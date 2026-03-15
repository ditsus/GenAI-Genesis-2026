"""In-memory job store for REEL processing jobs."""

import threading
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from models import JobStatus


@dataclass
class Job:
    """A processing job with status and logs."""

    job_id: str
    status: str = JobStatus.PENDING
    progress: Optional[str] = None
    output_path: Optional[str] = None
    error: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    logs: list[str] = field(default_factory=list)


class JobStore:
    """Thread-safe in-memory job store."""

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def create(self, job_id: str) -> Job:
        """Create a new job."""
        with self._lock:
            job = Job(job_id=job_id)
            self._jobs[job_id] = job
            return job

    def get(self, job_id: str) -> Optional[Job]:
        """Get a job by ID."""
        with self._lock:
            return self._jobs.get(job_id)

    def update(
        self,
        job_id: str,
        *,
        status: Optional[str] = None,
        progress: Optional[str] = None,
        output_path: Optional[str] = None,
        error: Optional[str] = None,
    ) -> Optional[Job]:
        """Update job fields."""
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                if status is not None:
                    job.status = status
                if progress is not None:
                    job.progress = progress
                if output_path is not None:
                    job.output_path = output_path
                if error is not None:
                    job.error = error
            return job

    def append_log(self, job_id: str, message: str) -> None:
        """Append a log message to the job."""
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                timestamp = datetime.utcnow().strftime("%H:%M:%S")
                job.logs.append(f"[{timestamp}] {message}")

    def get_logs(self, job_id: str) -> list[str]:
        """Get all log lines for a job."""
        with self._lock:
            job = self._jobs.get(job_id)
            return job.logs.copy() if job else []


job_store = JobStore()
