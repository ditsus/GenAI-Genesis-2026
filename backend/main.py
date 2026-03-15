"""REEL FastAPI backend: video sanitization pipeline with Railtracks observability."""

import asyncio
import json
import os
import tempfile
import uuid
from pathlib import Path
from typing import Callable

import httpx
import railtracks as rt
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
    SanitizationSegment,
)
from services.sentinel import analyze_video
from services.forge import generate_replacements
from services.assembler import stitch_video

# Initialize Railtracks for project-level observability (dashboard shows REEL-Sanitization)
rt.set_config(save_state=True)

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

# --- Railtracks pipeline tasks (observability + orchestration) ---

RETRIES = 2


def _sentinel_scan_impl(
    video_id: str,
    video_path: str,
    video_url: str,
    user_preferences: UserPreferences,
    custom_prompt: str | None,
    log_fn: Callable[[str], None],
) -> list[SanitizationSegment]:
    """
    Sentinel: Gemini-based scan to identify segments to sanitize.
    Output feeds into Regen step.
    """
    last_error = None
    for attempt in range(RETRIES + 1):
        try:
            return analyze_video(
                video_url,
                user_preferences,
                custom_prompt,
                log_fn=log_fn,
                video_path=video_path,
            )
        except Exception as e:
            last_error = e
            if attempt < RETRIES:
                log_fn(f"Scan retry {attempt + 1}/{RETRIES}: {e}")
            continue
    raise last_error  # type: ignore


sentinel_scan = rt.function_node(_sentinel_scan_impl, name="Scan")


def _forge_regeneration_impl(
    video_id: str,
    video_path: str,
    segments: list[SanitizationSegment],
    outputs_dir: str,
    frames_dir: str,
    log_fn: Callable[[str], None],
) -> list[str]:
    """
    Forge: VEO regeneration of replacement clips per segment.
    Consumes Scan output; output feeds into Stitch.
    """
    last_error = None
    for attempt in range(RETRIES + 1):
        try:
            return generate_replacements(
                video_path,
                segments,
                video_id,
                outputs_dir,
                frames_dir,
                log_fn=log_fn,
            )
        except Exception as e:
            last_error = e
            if attempt < RETRIES:
                log_fn(f"Regen retry {attempt + 1}/{RETRIES}: {e}")
            continue
    raise last_error  # type: ignore


forge_regeneration = rt.function_node(_forge_regeneration_impl, name="Regen")


def _assembler_stitch_impl(
    video_id: str,
    video_path: str,
    segments: list[SanitizationSegment],
    replacement_paths: list[str],
    output_path: str,
    log_fn: Callable[[str], None],
) -> str:
    """
    Assembler: FFmpeg stitch of original + replacement clips.
    Consumes Regen output; produces final video.
    """
    last_error = None
    for attempt in range(RETRIES + 1):
        try:
            return stitch_video(
                video_path,
                segments,
                replacement_paths,
                output_path,
                log_fn=log_fn,
            )
        except Exception as e:
            last_error = e
            if attempt < RETRIES:
                log_fn(f"Stitch retry {attempt + 1}/{RETRIES}: {e}")
            continue
    raise last_error  # type: ignore


assembler_stitch = rt.function_node(_assembler_stitch_impl, name="Stitch")


async def _pipeline_entry(job_id: str, req: ProcessVideoRequest) -> None:
    """
    Railtracks workflow entry: chain Scan -> Regen -> Stitch.
    video_id (job_id) is passed through all tasks for a single session trace.
    """
    def log(msg: str) -> None:
        job_store.append_log(job_id, msg)

    video_path: str | None = None
    try:
        job_store.update(job_id, status=JobStatus.SCANNING, progress="Downloading video...")
        log("Starting pipeline")

        with httpx.AsyncClient(timeout=settings.VIDEO_DOWNLOAD_TIMEOUT) as client:
            response = await client.get(req.video_url)
            response.raise_for_status()
            video_bytes = response.content

        video_path = os.path.join(tempfile.gettempdir(), f"reel_{job_id}.mp4")
        with open(video_path, "wb") as f:
            f.write(video_bytes)
        log(f"Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")

        prefs = req.user_preferences or UserPreferences()

        # 1. Scan (Gemini)
        job_store.update(job_id, status=JobStatus.SCANNING, progress="Analyzing with Gemini...")
        segments = await rt.call(
            sentinel_scan,
            job_id,
            video_path,
            req.video_url,
            prefs,
            req.custom_prompt,
            log,
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

        # 2. Regen (VEO)
        job_store.update(job_id, status=JobStatus.REGENERATING, progress="Generating replacements...")
        replacement_paths = await rt.call(
            forge_regeneration,
            job_id,
            video_path,
            segments,
            settings.OUTPUTS_DIR,
            settings.FRAMES_DIR,
            log,
        )

        # 3. Stitch (FFmpeg)
        job_store.update(job_id, status=JobStatus.STITCHING, progress="Stitching final video...")
        output_path = os.path.join(settings.PROCESSED_DIR, f"{job_id}.mp4")
        await rt.call(
            assembler_stitch,
            job_id,
            video_path,
            segments,
            replacement_paths,
            output_path,
            log,
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
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
            except Exception:
                pass


# Workflow: Scan -> Regen -> Stitch; each run tied to video_id via context
reel_workflow = rt.Flow(
    name="REEL-Sanitization",
    entry_point=_pipeline_entry,
    context={},
)


def _run_pipeline(job_id: str, req: ProcessVideoRequest) -> None:
    """Run the full sanitization pipeline via Railtracks workflow (Scan -> Regen -> Stitch)."""
    # Bind video_id to this run so the execution trace is tied to one session in the dashboard
    workflow = reel_workflow.update_context({"video_id": job_id})
    try:
        asyncio.run(workflow.ainvoke(job_id, req))
    except Exception as e:
        # Pipeline entry updates job_store on failure; if we get here, the failure was outside it (e.g. Flow/event loop)
        job_store.append_log(job_id, f"Pipeline failed: {e}")
        job_store.update(job_id, status=JobStatus.FAILED, error=str(e))


@app.post("/process-video")
def process_video(req: ProcessVideoRequest, background_tasks: BackgroundTasks):
    """Start video processing. Returns job_id immediately. Runs Railtracks workflow with video_id trace."""
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
