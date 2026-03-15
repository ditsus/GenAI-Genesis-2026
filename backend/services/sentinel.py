"""Sentinel: Gemini-based video analysis for content sanitization."""

import json
import os
import tempfile
from typing import Callable

import httpx
from google import genai
from google.genai import types

from config import get_settings
from models import SanitizationSegment, UserPreferences


def _build_analysis_prompt(
    user_preferences: UserPreferences,
    custom_prompt: str | None,
) -> str:
    """Build the analysis prompt from user preferences and custom instructions."""
    prefs_desc = []
    if user_preferences.violence:
        prefs_desc.append("violence/gore")
    if user_preferences.language:
        prefs_desc.append("profanity/strong language")
    if user_preferences.romance:
        prefs_desc.append("romantic/intimate content")
    if user_preferences.horror:
        prefs_desc.append("horror/scary content")
    if user_preferences.epileptic:
        prefs_desc.append("flashing/strobing (epileptic triggers)")
    if user_preferences.loud_volume:
        prefs_desc.append("sudden loud sounds")
    if user_preferences.motion_sickness:
        prefs_desc.append("rapid motion/shaky cam")
    if user_preferences.profanity:
        prefs_desc.append("profanity")
    if user_preferences.intimacy:
        prefs_desc.append("intimacy")

    prefs_text = ", ".join(prefs_desc) if prefs_desc else "violence, language, romance, horror, epileptic triggers"

    base = f"""Analyze this video and identify segments that should be sanitized based on these user preferences: {prefs_text}.

For each segment that matches the preferences, provide:
- start: start time in seconds (float)
- end: end time in seconds (float)
- target: the type of content (e.g., "violence", "language", "romance", "horror", "epileptic")
- replacement: a detailed, cinematic prompt (2-3 sentences) describing a family-friendly replacement clip that maintains narrative flow. Include shot type, lighting, mood, and style. The replacement should feel like a natural cut in the same film.

Return ONLY a valid JSON array of objects, no other text. Example format:
[{{"start": 18.0, "end": 25.0, "target": "violence", "replacement": "Two characters having a calm conversation on a city street, cinematic wide shot, golden hour lighting, film grain"}}]

If no segments need sanitization, return: []"""

    if custom_prompt:
        base += f"\n\nAdditional instructions: {custom_prompt}"

    return base


def _parse_segments(response_text: str) -> list[SanitizationSegment]:
    """Parse Gemini response into SanitizationSegment list."""
    text = response_text.strip()
    # Handle markdown code blocks
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    data = json.loads(text)
    return [SanitizationSegment(**item) for item in data]


def analyze_video(
    video_url: str,
    user_preferences: UserPreferences,
    custom_prompt: str | None,
    log_fn: Callable[[str], None] | None = None,
    video_path: str | None = None,
) -> list[SanitizationSegment]:
    """
    Analyze video with Gemini, return sanitization segments.

    Args:
        video_url: URL of the video (used if video_path not provided)
        user_preferences: User content preferences
        custom_prompt: Optional custom instructions
        log_fn: Optional callback to append log messages
        video_path: Optional local path to video (avoids re-download)

    Returns:
        List of SanitizationSegment with start, end, target, replacement
    """
    settings = get_settings()
    os.environ["GOOGLE_CLOUD_PROJECT"] = settings.GOOGLE_CLOUD_PROJECT
    os.environ["GOOGLE_CLOUD_LOCATION"] = settings.GOOGLE_CLOUD_LOCATION
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = settings.GOOGLE_GENAI_USE_VERTEXAI

    def log(msg: str) -> None:
        if log_fn:
            log_fn(msg)

    if video_path and os.path.exists(video_path):
        log("Reading video from local path...")
        with open(video_path, "rb") as f:
            video_bytes = f.read()
    else:
        log("Downloading video from URL...")
        with httpx.Client(timeout=settings.VIDEO_DOWNLOAD_TIMEOUT) as client:
            response = client.get(video_url)
            response.raise_for_status()
            video_bytes = response.content

    if len(video_bytes) > 100 * 1024 * 1024:  # 100MB
        raise ValueError("Video exceeds 100MB limit for analysis")

    log(f"Downloaded {len(video_bytes) / 1024 / 1024:.1f} MB")

    client = genai.Client()

    # Use File API for larger files, inline for smaller
    if len(video_bytes) > 20 * 1024 * 1024:  # 20MB
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            f.write(video_bytes)
            temp_path = f.name
        try:
            log("Uploading video to Gemini File API...")
            uploaded = client.files.upload(file=temp_path)
            video_part = types.Part(file_data=types.FileData(file_uri=uploaded.uri))
        finally:
            os.unlink(temp_path)
    else:
        log("Using inline video data...")
        video_part = types.Part(
            inline_data=types.Blob(data=video_bytes, mime_type="video/mp4")
        )

    prompt = _build_analysis_prompt(user_preferences, custom_prompt)

    models_to_try = [settings.GEMINI_MODEL, settings.GEMINI_FALLBACK_MODEL]
    last_error = None

    for model in models_to_try:
        try:
            log(f"Analyzing with {model}...")
            response = client.models.generate_content(
                model=model,
                contents=types.Content(
                    parts=[video_part, types.Part(text=prompt)]
                ),
            )
            if response.text:
                segments = _parse_segments(response.text)
                log(f"Found {len(segments)} segment(s) to sanitize")
                return segments
        except Exception as e:
            last_error = e
            log(f"Model {model} failed: {e}")
            continue

    if last_error:
        raise last_error
    return []
