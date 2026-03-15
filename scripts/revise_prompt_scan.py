#!/usr/bin/env python3
"""
Run the Sentinel (Gemini) scan on a video with a custom prompt and/or model.
Prints the detected segments as JSON. Use this to revise prompts or try
different models without running the full pipeline.

Usage (run from repo root; backend/.env must be set for Gemini):
  python scripts/revise_prompt_scan.py <video_path_or_url>
  python scripts/revise_prompt_scan.py backend/trailers/clip_8s.mp4 --prompt "Focus only on violence."
  python scripts/revise_prompt_scan.py "https://example.com/video.mp4" --model gemini-1.5-flash

Requires: backend/.env (Google Cloud / Vertex AI for Gemini).
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
os.chdir(BACKEND)  # so config loads backend/.env

from config import get_settings
from models import UserPreferences
from services.sentinel import analyze_video


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Gemini scan with custom prompt/model; print segments JSON.")
    parser.add_argument("source", help="Video URL or path to local file")
    parser.add_argument("--prompt", "-p", type=str, default=None, help="Custom instruction for the analysis (appended to the default prompt)")
    parser.add_argument("--model", "-m", type=str, default=None, help="Override Gemini model (e.g. gemini-1.5-flash); uses config default if not set")
    parser.add_argument("--prefs", type=str, default=None, help="Comma-separated content types to detect, e.g. violence,language,romance (default: all)")
    args = parser.parse_args()

    settings = get_settings()
    os.environ["GOOGLE_CLOUD_PROJECT"] = settings.GOOGLE_CLOUD_PROJECT
    os.environ["GOOGLE_CLOUD_LOCATION"] = settings.GOOGLE_CLOUD_LOCATION
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = settings.GOOGLE_GENAI_USE_VERTEXAI

    if args.model:
        os.environ["REEL_GEMINI_MODEL_OVERRIDE"] = args.model

    # Apply model override in config if we had a way; sentinel uses get_settings() which is cached.
    # So we patch the model on the settings object for this run.
    if args.model:
        settings.GEMINI_MODEL = args.model
        settings.GEMINI_FALLBACK_MODEL = args.model

    prefs = UserPreferences()
    if args.prefs:
        for key in ["violence", "language", "romance", "horror", "epileptic", "profanity", "intimacy"]:
            setattr(prefs, key, key in [s.strip().lower() for s in args.prefs.split(",")])

    source = args.source.strip()
    video_path = None
    video_url = source
    if not source.startswith("http://") and not source.startswith("https://"):
        video_path = Path(source) if Path(source).is_absolute() else ROOT / source
        if not video_path.exists():
            print(f"Error: File not found: {video_path}", file=sys.stderr)
            sys.exit(1)
        video_path = str(video_path)
        video_url = "file://localhost/" + video_path

    def log(msg: str) -> None:
        print(f"  {msg}")

    print("Running Sentinel (Gemini) scan...")
    if args.prompt:
        print(f"  Custom prompt: {args.prompt[:60]}...")
    if args.model:
        print(f"  Model: {args.model}")

    segments = analyze_video(
        video_url,
        prefs,
        args.prompt,
        log_fn=log,
        video_path=video_path,
    )

    print(f"\nSegments found: {len(segments)}")
    out = [s.model_dump() for s in segments]
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
