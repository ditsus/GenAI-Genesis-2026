"""Forge: VEO 3.1 video generation for replacement segments."""

import os
import subprocess
import time
from pathlib import Path

from google import genai
from google.genai.types import GenerateVideosConfig, Image
from google.cloud import storage

from config import get_settings
from models import SanitizationSegment


def _extract_frame(
    video_path: str,
    timestamp: float,
    output_path: str,
) -> bool:
    """Extract a single frame at the given timestamp."""
    t = max(0, timestamp)
    result = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            str(t),
            "-i",
            video_path,
            "-frames:v",
            "1",
            "-q:v",
            "2",
            output_path,
        ],
        capture_output=True,
        timeout=30,
    )
    return result.returncode == 0 and os.path.exists(output_path)


def _upload_to_gcs(local_path: str, gcs_path: str, bucket_name: str) -> str:
    """Upload file to GCS, return gs:// URI."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(gcs_path)
    blob.upload_from_filename(local_path)
    return f"gs://{bucket_name}/{gcs_path}"


def _download_from_gcs(gcs_uri: str, local_path: str) -> None:
    """Download file from GCS URI to local path."""
    storage_client = storage.Client()
    parts = gcs_uri.replace("gs://", "").split("/", 1)
    bucket_name = parts[0]
    blob_path = parts[1]
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.download_to_filename(local_path)


def _poll_operation(operation, max_wait: int, poll_interval: int, log_fn):
    """Poll VEO operation until complete or timeout."""
    elapsed = 0
    while not operation.done:
        if elapsed >= max_wait:
            raise TimeoutError(f"VEO generation timed out after {max_wait}s")
        log_fn(f"  Waiting for VEO... ({elapsed}s)")
        time.sleep(poll_interval)
        elapsed += poll_interval
        operation = client.operations.get(operation)
    return operation


# Module-level client (initialized in generate_replacements)
client = None


def generate_replacements(
    video_path: str,
    segments: list[SanitizationSegment],
    job_id: str,
    outputs_dir: str,
    frames_dir: str,
    log_fn,
) -> list[str]:
    """
    For each segment: extract frames, upload to GCS, call VEO, download result.

    Returns list of local paths to generated replacement clips (in order).
    """
    global client
    settings = get_settings()
    os.environ["GOOGLE_CLOUD_PROJECT"] = settings.GOOGLE_CLOUD_PROJECT
    os.environ["GOOGLE_CLOUD_LOCATION"] = settings.GOOGLE_CLOUD_LOCATION
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = settings.GOOGLE_GENAI_USE_VERTEXAI

    client = genai.Client()
    bucket_name = settings.BUCKET_NAME
    bucket_uri = f"gs://{bucket_name}"
    model = settings.VEO_MODEL

    Path(outputs_dir).mkdir(parents=True, exist_ok=True)
    Path(frames_dir).mkdir(parents=True, exist_ok=True)

    replacement_paths: list[str] = []

    for i, seg in enumerate(segments):
        clip_name = f"{job_id}_{i}.mp4"
        local_output = os.path.join(outputs_dir, clip_name)
        duration = seg.end - seg.start
        duration_sec = max(4, min(8, int(duration) + 1))  # VEO supports 4, 6, 8

        log_fn(f"Segment {i + 1}/{len(segments)}: {seg.start:.1f}s–{seg.end:.1f}s ({seg.target})")

        # Extract frames
        start_frame = os.path.join(frames_dir, f"{job_id}_{i}_start.jpg")
        end_frame = os.path.join(frames_dir, f"{job_id}_{i}_end.jpg")

        got_start = _extract_frame(
            video_path,
            max(0, seg.start - 0.1),
            start_frame,
        )
        got_end = _extract_frame(
            video_path,
            seg.end + 0.1,
            end_frame,
        )

        if not got_start:
            log_fn(f"  WARNING: Could not extract start frame, using text-only generation")

        # Upload to GCS
        gcs_prefix = f"reel_frames/{job_id}"
        start_gcs = (
            _upload_to_gcs(start_frame, f"{gcs_prefix}/frame_{i}_start.jpg", bucket_name)
            if got_start
            else None
        )
        end_gcs = (
            _upload_to_gcs(end_frame, f"{gcs_prefix}/frame_{i}_end.jpg", bucket_name)
            if got_end
            else None
        )

        gcs_output = f"{bucket_uri}/reel_replacements/{clip_name}"

        config_kwargs: dict = {
            "aspect_ratio": "16:9",
            "output_gcs_uri": gcs_output,
            "duration_seconds": duration_sec,
            "generate_audio": False,
        }
        if end_gcs:
            config_kwargs["last_frame"] = Image(gcs_uri=end_gcs, mime_type="image/jpeg")
        config = GenerateVideosConfig(**config_kwargs)

        success = False
        try:
            gen_kwargs: dict = {
                "model": model,
                "prompt": seg.replacement,
                "config": config,
            }
            if start_gcs:
                gen_kwargs["image"] = Image(gcs_uri=start_gcs, mime_type="image/jpeg")

            operation = client.models.generate_videos(**gen_kwargs)

            operation = _poll_operation(
                operation,
                settings.VEO_MAX_WAIT,
                settings.VEO_POLL_INTERVAL,
                log_fn,
            )

            result = getattr(operation, "result", None) or getattr(operation, "response", None)
            if result and hasattr(result, "generated_videos") and result.generated_videos:
                gcs_uri = result.generated_videos[0].video.uri
                _download_from_gcs(gcs_uri, local_output)
                replacement_paths.append(local_output)
                log_fn(f"  Saved to {local_output}")
                success = True
        except Exception as e:
            log_fn(f"  ERROR: VEO generation failed: {e}")
            raise

        if not success:
            raise RuntimeError(f"VEO failed to generate replacement for segment {i}")

    return replacement_paths
