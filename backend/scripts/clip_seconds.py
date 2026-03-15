#!/usr/bin/env python3
"""
Clip N seconds from a video (URL or local file), e.g. first 8 seconds for processing.

Usage:
  python scripts/clip_seconds.py <source> [--seconds 8] [--output path]
  python scripts/clip_seconds.py "https://www.youtube.com/watch?v=..." --seconds 8
  python scripts/clip_seconds.py backend/trailers/full.mp4 --seconds 10 --output backend/trailers/clip_10s.mp4

Requires: ffmpeg. For URLs, yt-dlp (pip install yt-dlp or install locally).
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

# Repo root
ROOT = Path(__file__).resolve().parent.parent
BACKEND_TRAILERS = ROOT / "backend" / "trailers"
BACKEND_OUTPUTS = ROOT / "backend" / "outputs"


def clip_from_url(url: str, seconds: float, output_path: Path) -> Path:
    """Download first N seconds from URL using yt-dlp + ffmpeg (yt-dlp must be on PATH)."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out_str = str(output_path)
    cmd = [
        "yt-dlp",
        "--downloader", "ffmpeg",
        "--downloader-args", f"ffmpeg:-t {seconds}",
        "-f", "best[ext=mp4]/best",
        "-o", out_str,
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"yt-dlp failed: {result.returncode}")
    if not output_path.exists():
        raise RuntimeError(f"Output not created: {output_path}")
    return output_path


def clip_from_file(video_path: Path, seconds: float, output_path: Path) -> Path:
    """Extract first N seconds using ffmpeg."""
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-t", str(seconds),
        "-c", "copy",
        "-avoid_negative_ts", "1",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"ffmpeg failed: {result.returncode}")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Clip N seconds from a video URL or file.")
    parser.add_argument("source", help="Video URL or path to local file")
    parser.add_argument("--seconds", "-s", type=float, default=8.0, help="Length in seconds (default: 8)")
    parser.add_argument("--output", "-o", type=Path, default=None, help="Output path (default: backend/trailers/clip_<N>s.mp4)")
    args = parser.parse_args()

    source = args.source.strip()
    if args.output is not None:
        out_path = Path(args.output)
    else:
        BACKEND_TRAILERS.mkdir(parents=True, exist_ok=True)
        out_path = BACKEND_TRAILERS / f"clip_{int(args.seconds)}s.mp4"

    if source.startswith("http://") or source.startswith("https://"):
        print(f"Downloading first {args.seconds}s from URL...")
        clip_from_url(source, args.seconds, out_path)
    else:
        in_path = Path(source)
        if not in_path.is_absolute():
            in_path = ROOT / in_path
        print(f"Clipping first {args.seconds}s from {in_path}...")
        clip_from_file(in_path, args.seconds, out_path)

    print(f"Saved to {out_path}")


if __name__ == "__main__":
    main()
