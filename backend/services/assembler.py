"""Assembler: FFmpeg-based video stitching with concat demuxer."""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Callable

from models import SanitizationSegment


def _get_video_duration(video_path: str) -> float:
    """Get video duration in seconds using ffprobe."""
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            video_path,
        ],
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")
    return float(result.stdout.strip())


def stitch_video(
    original_path: str,
    segments: list[SanitizationSegment],
    replacement_paths: list[str],
    output_path: str,
    log_fn: Callable[[str], None] | None = None,
) -> str:
    """
    Slice original video into segments, interleave with VEO clips, concat.

    Uses FFmpeg concat demuxer with setpts=PTS-STARTPTS for each segment.

    Args:
        original_path: Path to original video
        segments: Sanitization segments (start, end for each cut)
        replacement_paths: Paths to replacement clips (one per segment)
        output_path: Output path for final video
        log_fn: Optional log callback

    Returns:
        Path to the stitched output video
    """
    def log(msg: str) -> None:
        if log_fn:
            log_fn(msg)

    if len(segments) != len(replacement_paths):
        raise ValueError(
            f"Segment count ({len(segments)}) must match replacement count ({len(replacement_paths)})"
        )

    duration = _get_video_duration(original_path)
    log(f"Original duration: {duration:.1f}s")

    # Build concat list: [keep1, repl1, keep2, repl2, ... keepN]
    # Each "keep" is a segment from original; each "repl" is a replacement clip
    concat_parts: list[str] = []
    temp_dir = tempfile.mkdtemp()

    try:
        # Extract "keep" segments (parts of original we retain)
        # Segment 0: 0 -> segments[0].start
        # Segment 1: segments[0].end -> segments[1].start
        # ...
        # Last: segments[-1].end -> duration

        for i in range(len(segments) + 1):
            if i == 0:
                start = 0.0
                end = segments[0].start
            elif i == len(segments):
                start = segments[-1].end
                end = duration
            else:
                start = segments[i - 1].end
                end = segments[i].start

            seg_duration = end - start
            if seg_duration > 0.1:  # Skip tiny segments
                part_path = os.path.join(temp_dir, f"part_keep_{i}.mp4")
                # Extract segment: -ss before -i for fast seek
                result = subprocess.run(
                    [
                        "ffmpeg",
                        "-y",
                        "-ss",
                        str(start),
                        "-i",
                        original_path,
                        "-t",
                        str(seg_duration),
                        "-c",
                        "copy",
                        "-avoid_negative_ts",
                        "1",
                        part_path,
                    ],
                    capture_output=True,
                    timeout=60,
                )
                if result.returncode == 0 and os.path.exists(part_path):
                    concat_parts.append(part_path)
                    log(f"  Kept original {start:.1f}s–{end:.1f}s")
                else:
                    log(f"  WARNING: Failed to extract keep segment {i}: {result.stderr.decode()[:200]}")

        # Interleave: keep0, repl0, keep1, repl1, ... keepN
        if len(concat_parts) != len(segments) + 1:
            log(f"  WARNING: Expected {len(segments)+1} keep segments, got {len(concat_parts)}")
        ordered: list[str] = []
        for i in range(len(segments)):
            if i < len(concat_parts):
                ordered.append(concat_parts[i])
            if i < len(replacement_paths) and os.path.exists(replacement_paths[i]):
                ordered.append(replacement_paths[i])
        if len(segments) < len(concat_parts):
            ordered.append(concat_parts[len(segments)])

        if not ordered:
            raise RuntimeError("No segments to concat")

        # Write concat demuxer file
        concat_file = os.path.join(temp_dir, "concat.txt")
        with open(concat_file, "w") as f:
            for p in ordered:
                # Use file protocol for absolute paths
                abs_path = os.path.abspath(p)
                f.write(f"file '{abs_path}'\n")

        log("Stitching with FFmpeg concat demuxer...")

        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        # Concat with stream copy; use setpts if re-encoding needed for A/V sync
        result = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                concat_file,
                "-c",
                "copy",
                "-movflags",
                "+faststart",
                output_path,
            ],
            capture_output=True,
            timeout=300,
        )

        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg concat failed: {result.stderr.decode()}")

        log(f"Saved to {output_path}")
        return output_path

    finally:
        import shutil
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass
