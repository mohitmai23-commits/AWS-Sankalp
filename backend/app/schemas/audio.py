"""
Audio related Pydantic schemas
"""
from pydantic import BaseModel


class AudioGenerateRequest(BaseModel):
    content: str  # Full webpage content text
    subtopic_id: str


class AudioResponse(BaseModel):
    audio_url: str
    simplified_text: str
    duration_seconds: int
    cached: bool = False