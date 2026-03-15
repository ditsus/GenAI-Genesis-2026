#!/usr/bin/env python3
"""
Generate a new clip with VEO from a video segment: extract start/end frames,
upload to GCS, call VEO with a prompt, download the result.
Similar to Halftime/clearplay generate_*.py (e.g. generate_hindenburg).

Usage (run from repo root; backend/.env must be set for GCP/VEO):
  python scripts/generate_replacement.py <video_path> --prompt "A calm scene, no flashing."
  python scripts/generate_replacement.py backend/trailers/clip_8s.mp4 --start 0 --end 8 --prompt "Smooth version, no flicker." --out backend/outputs/smooth.mp4

Requires: ffmpeg, Google Cloud credentials, backend/.env (BUCKET_NAME, etc.).
"""
import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
os.chdir(BACKEND)  # so config loads backend/.env

from google import genai
from google.genai.types import GenerateVideosConfig, Image
from google.cloud import storage

from config import get_settings


def extract_frame(video_path: str, timestamp: float, output_path: str) -> bool:
    """Extract a single frame at the given timestamp."""
    t = max(0, timestamp)
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-ss", str(t), "-i", video_path,
            "-frames:v", "1", "-q:v", "2", output_path,
        ],
        capture_output=True,
        timeout=30,
    )
    return result.returncode == 0 and os.path.exists(output_path)


def upload_to_gcs(local_path: str, gcs_path: str, bucket_name: str) -> str:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(gcs_path)
    blob.upload_from_filename(local_path)
    return f"gs://{bucket_name}/{gcs_path}"


def download_from_gcs(gcs_uri: str, local_path: str) -> None:
    parts = gcs_uri.replace("gs://", "").split("/", 1)
    bucket_name, blob_path = parts[0], parts[1]
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    bucket.blob(blob_path).download_to_filename(local_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a replacement clip with VEO from a video segment.")
    parser.add_argument("video_path", type=Path, help="Path to source video (e.g. backend/trailers/clip_8s.mp4)")
    parser.add_argument("--prompt", "-p", required=True, help="VEO prompt for the generated clip")
    parser.add_argument("--start", type=float, default=0.0, help="Start time in seconds for first frame (default: 0)")
    parser.add_argument("--end", type=float, default=8.0, help="End time in seconds for last frame (default: 8)")
    parser.add_argument("--duration", "-d", type=int, default=8, help="VEO clip duration in seconds, 4/6/8 (default: 8)")
    parser.add_argument("--out", "-o", type=Path, default=None, help="Output path (default: backend/outputs/generated_<name>.mp4)")
    parser.add_argument("--prefix", type=str, default="reel_script", help="GCS path prefix for frames (default: reel_script)")
    args = parser.parse_args()

    settings = get_settings()
    os.environ["GOOGLE_CLOUD_PROJECT"] = settings.GOOGLE_CLOUD_PROJECT
    os.environ["GOOGLE_CLOUD_LOCATION"] = settings.GOOGLE_CLOUD_LOCATION
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = settings.GOOGLE_GENAI_USE_VERTEXAI

    video_path = args.video_path if args.video_path.is_absolute() else ROOT / args.video_path
    if not video_path.exists():
        print(f"Error: Video not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    frames_dir = ROOT / "backend" / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    outputs_dir = ROOT / "backend" / "outputs"
    outputs_dir.mkdir(parents=True, exist_ok=True)

    start_frame = frames_dir / "gen_start.jpg"
    end_frame = frames_dir / "gen_end.jpg"
    print("Extracting frames...")
    if not extract_frame(str(video_path), args.start, str(start_frame)):
        print("Warning: Could not extract start frame; VEO may use text-only.", file=sys.stderr)
        start_frame = None
    else:
        print(f"  Start frame ({args.start}s) -> {start_frame}")
    if not extract_frame(str(video_path), args.end, str(end_frame)):
        print("Warning: Could not extract end frame.", file=sys.stderr)
        end_frame = None
    else:
        print(f"  End frame ({args.end}s) -> {end_frame}")

    bucket_name = settings.BUCKET_NAME
    gcs_prefix = f"{args.prefix}/frames"
    start_gcs = upload_to_gcs(str(start_frame), f"{gcs_prefix}/start.jpg", bucket_name) if start_frame and start_frame.exists() else None
    end_gcs = upload_to_gcs(str(end_frame), f"{gcs_prefix}/end.jpg", bucket_name) if end_frame and end_frame.exists() else None
    print("Uploaded frames to GCS.")

    out_name = "generated_replacement.mp4"
    if args.out:
        out_path = args.out if args.out.is_absolute() else ROOT / args.out
    else:
        out_path = outputs_dir / out_name
    out_path.parent.mkdir(parents=True, exist_ok=True)
    gcs_output = f"gs://{bucket_name}/{args.prefix}/output/{out_name}"

    client = genai.Client()
    duration = max(4, min(8, args.duration))
    if duration not in (4, 6, 8):
        duration = 8

    config_kwargs = {
        "aspect_ratio": "16:9",
        "output_gcs_uri": gcs_output,
        "duration_seconds": duration,
        "generate_audio": False,
    }
    if end_gcs:
        config_kwargs["last_frame"] = Image(gcs_uri=end_gcs, mime_type="image/jpeg")

    gen_kwargs = {
        "model": settings.VEO_MODEL,
        "prompt": args.prompt,
        "config": GenerateVideosConfig(**config_kwargs),
    }
    if start_gcs:
        gen_kwargs["image"] = Image(gcs_uri=start_gcs, mime_type="image/jpeg")

    print(f"Calling VEO ({settings.VEO_MODEL}), duration={duration}s...")
    print(f"  Prompt: {args.prompt[:80]}...")
    operation = client.models.generate_videos(**gen_kwargs)

    elapsed = 0
    while not operation.done:
        if elapsed >= settings.VEO_MAX_WAIT:
            print("VEO timed out.", file=sys.stderr)
            sys.exit(1)
        print(f"  Waiting for VEO... ({elapsed}s)")
        time.sleep(settings.VEO_POLL_INTERVAL)
        elapsed += settings.VEO_POLL_INTERVAL
        operation = client.operations.get(operation)

    result = getattr(operation, "result", None) or getattr(operation, "response", None)
    if result and hasattr(result, "generated_videos") and result.generated_videos:
        gcs_uri = result.generated_videos[0].video.uri
        download_from_gcs(gcs_uri, str(out_path))
        print(f"Saved to {out_path}")
    else:
        print("VEO did not return a video.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
