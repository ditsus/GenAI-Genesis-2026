"""Pydantic models for REEL API."""

from typing import Optional
from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    """User content preferences for sanitization."""

    violence: bool = True
    language: bool = True
    romance: bool = True
    horror: bool = True
    epileptic: bool = True
    loud_volume: bool = False
    motion_sickness: bool = False
    profanity: bool = True
    intimacy: bool = True

    class Config:
        extra = "allow"


class SanitizationSegment(BaseModel):
    """A segment to be sanitized/replaced."""

    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    target: str = Field(..., description="Type of content (violence, language, etc.)")
    replacement: str = Field(
        ...,
        description="Prompt for generating the replacement clip",
    )


class ProcessVideoRequest(BaseModel):
    """Request body for video processing."""

    video_url: str = Field(..., description="URL of the video to process")
    user_preferences: Optional[UserPreferences] = Field(
        default_factory=UserPreferences,
        description="User content preferences",
    )
    custom_prompt: Optional[str] = Field(
        default=None,
        description="Optional custom instructions for sanitization",
    )


class JobStatus:
    """Job status constants."""

    PENDING = "PENDING"
    SCANNING = "SCANNING"
    REGENERATING = "REGENERATING"
    STITCHING = "STITCHING"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class JobResponse(BaseModel):
    """Response for job status."""

    job_id: str
    status: str
    progress: Optional[str] = None
    output_path: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[str] = None
