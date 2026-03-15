"""REEL FastAPI backend: video sanitization pipeline."""

import json
import os
import tempfile
import uuid
from pathlib import Path

import httpx
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from jobs import job_store
from models import (
    JobResponse,
    JobStatus,
    ProcessVideoRequest,
    UserPreferences,
)
from services.sentinel import analyze_video
from services.forge import generate_replacements
from services.assembler import stitch_video


app = FastAPI(title="REEL API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = get_settings()

# Ensure directories exist
Path(settings.DATA_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.TRAILERS_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.OUTPUTS_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.PROCESSED_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.FRAMES_DIR).mkdir(parents=True, exist_ok=True)

# Mount static directories
@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {"service": "reel", "status": "ok"}


app.mount("/trailers", StaticFiles(directory=settings.TRAILERS_DIR), name="trailers")
app.mount("/outputs", StaticFiles(directory=settings.OUTPUTS_DIR), name="outputs")
app.mount("/processed", StaticFiles(directory=settings.PROCESSED_DIR), name="processed")


def _run_pipeline(job_id: str, req: ProcessVideoRequest) -> None:
    """Run the full sanitization pipeline in background."""
    def log(msg: str) -> None:
        job_store.append_log(job_id, msg)

    video_path: str | None = None
    try:
        job_store.update(job_id, status=JobStatus.SCANNING, progress="Downloading video...")
        log("Starting pipeline")

        # 1. Download video
        with httpx.Client(timeout=settings.VIDEO_DOWNLOAD_TIMEOUT) as client:
            response = client.get(req.video_url)
            response.raise_for_status()
            video_bytes = response.content

        video_path = os.path.join(tempfile.gettempdir(), f"reel_{job_id}.mp4")
        with open(video_path, "wb") as f:
            f.write(video_bytes)
        log(f"Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")

        prefs = req.user_preferences or UserPreferences()

        # 2. Sentinel: Gemini analysis
        job_store.update(job_id, status=JobStatus.SCANNING, progress="Analyzing with Gemini...")
        segments = analyze_video(
            req.video_url,
            prefs,
            req.custom_prompt,
            log_fn=log,
            video_path=video_path,
        )

        if not segments:
            log("No segments to sanitize - copying original")
            output_path = os.path.join(settings.PROCESSED_DIR, f"{job_id}.mp4")
            with open(output_path, "wb") as f:
                f.write(video_bytes)
            job_store.update(
                job_id,
                status=JobStatus.COMPLETE,
                progress="Complete",
                output_path=f"/processed/{job_id}.mp4",
            )
            log("Pipeline complete (no sanitization needed)")
            return

        # 3. Forge: VEO generation per segment
        job_store.update(job_id, status=JobStatus.REGENERATING, progress="Generating replacements...")
        replacement_paths = generate_replacements(
            video_path,
            segments,
            job_id,
            settings.OUTPUTS_DIR,
            settings.FRAMES_DIR,
            log_fn=log,
        )

        # 4. Assembler: FFmpeg stitch
        job_store.update(job_id, status=JobStatus.STITCHING, progress="Stitching final video...")
        output_path = os.path.join(settings.PROCESSED_DIR, f"{job_id}.mp4")
        stitch_video(
            video_path,
            segments,
            replacement_paths,
            output_path,
            log_fn=log,
        )

        job_store.update(
            job_id,
            status=JobStatus.COMPLETE,
            progress="Complete",
            output_path=f"/processed/{job_id}.mp4",
        )
        log("Pipeline complete")

    except Exception as e:
        log(f"Pipeline failed: {e}")
        job_store.update(
            job_id,
            status=JobStatus.FAILED,
            error=str(e),
        )
    finally:
        # Cleanup temp video
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
            except Exception:
                pass


@app.post("/process-video")
def process_video(req: ProcessVideoRequest, background_tasks: BackgroundTasks):
    """Start video processing. Returns job_id immediately."""
    job_id = str(uuid.uuid4())[:8]
    job_store.create(job_id)
    job_store.append_log(job_id, f"Job created for {req.video_url[:80]}...")
    background_tasks.add_task(_run_pipeline, job_id, req)
    return {"job_id": job_id}


@app.get("/api/jobs/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str):
    """Get job status."""
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(
        job_id=job.job_id,
        status=job.status,
        progress=job.progress,
        output_path=job.output_path,
        error=job.error,
        created_at=job.created_at,
    )


@app.get("/api/jobs/{job_id}/logs")
def get_job_logs(job_id: str):
    """Get log lines for polling."""
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "logs": job_store.get_logs(job_id)}


def _load_timestamps() -> list:
    """Load trailers from data/timestamps.json."""
    path = os.path.join(settings.DATA_DIR, "timestamps.json")
    if not os.path.exists(path):
        return []
    with open(path) as f:
        return json.load(f)


@app.get("/api/trailers")
def get_trailers():
    """Return trailers from data/timestamps.json."""
    return _load_timestamps()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
