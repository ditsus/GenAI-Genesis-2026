#!/usr/bin/env python3
"""
Helper script: POST a video URL to the running REEL backend and poll job status.
Similar in spirit to clearplay's generate_*.py one-off scripts.

Usage (backend must be running on localhost:8000):
  python scripts/process_sample_url.py [VIDEO_URL]
  python scripts/process_sample_url.py   # uses a default sample URL

Example:
  python scripts/process_sample_url.py "https://example.com/some-trailer.mp4"
"""
import argparse
import sys
import time

try:
    import httpx
except ImportError:
    print("Install httpx: pip install httpx", file=sys.stderr)
    sys.exit(1)

DEFAULT_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
API_BASE = "http://localhost:8000"


def main() -> None:
    parser = argparse.ArgumentParser(description="Send a video URL to REEL /process-video and poll until done.")
    parser.add_argument(
        "video_url",
        nargs="?",
        default=DEFAULT_URL,
        help="Video URL to process (default: Big Buck Bunny sample)",
    )
    parser.add_argument(
        "--poll-interval",
        type=float,
        default=3.0,
        help="Seconds between status polls (default: 3)",
    )
    args = parser.parse_args()

    with httpx.Client(timeout=30.0) as client:
        try:
            r = client.post(
                f"{API_BASE}/process-video",
                json={"video_url": args.video_url},
            )
            r.raise_for_status()
        except httpx.ConnectError:
            print("Error: Cannot connect to backend. Is it running? (e.g. scripts/run_backend.sh)", file=sys.stderr)
            sys.exit(1)
        except httpx.HTTPStatusError as e:
            print(f"Error: {e.response.status_code} {e.response.text}", file=sys.stderr)
            sys.exit(1)

    data = r.json()
    job_id = data.get("job_id")
    if not job_id:
        print("Error: No job_id in response", data, file=sys.stderr)
        sys.exit(1)

    print(f"Job created: {job_id}")
    print(f"  URL: {args.video_url[:70]}...")
    print("Polling status...")

    while True:
        time.sleep(args.poll_interval)
        try:
            r = client.get(f"{API_BASE}/api/jobs/{job_id}")
            r.raise_for_status()
        except Exception as e:
            print(f"Poll error: {e}", file=sys.stderr)
            continue

        j = r.json()
        status = j.get("status", "")
        progress = j.get("progress", "")

        print(f"  [{status}] {progress or '-'}")

        if status == "COMPLETE":
            out = j.get("output_path")
            if out:
                print(f"\nDone. Output: {API_BASE}{out}")
            break
        if status == "FAILED":
            print(f"\nFailed: {j.get('error', 'Unknown error')}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
