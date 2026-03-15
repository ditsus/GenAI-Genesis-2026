"""Configuration settings for REEL backend."""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = "gen-lang-client-0326372924"
    GOOGLE_CLOUD_LOCATION: str = "us-central1"
    GOOGLE_GENAI_USE_VERTEXAI: str = "True"
    BUCKET_NAME: str = "clearplay-demo-videos"

    # Paths
    DATA_DIR: str = "data"
    TRAILERS_DIR: str = "trailers"
    OUTPUTS_DIR: str = "outputs"
    PROCESSED_DIR: str = "processed"
    FRAMES_DIR: str = "frames"

    # API timeouts (seconds)
    VIDEO_DOWNLOAD_TIMEOUT: int = 120
    GEMINI_TIMEOUT: int = 180
    VEO_POLL_INTERVAL: int = 15
    VEO_MAX_WAIT: int = 600  # 10 minutes per segment

    # Models
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-1.5-flash"
    VEO_MODEL: str = "veo-3.1-generate-001"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
