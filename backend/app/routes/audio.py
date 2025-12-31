"""
Audio summary generation routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib

from ..database import get_db
from ..schemas.audio import AudioGenerateRequest, AudioResponse
from ..models.audio_summary import AudioSummary
from ..services.gemini_service import generate_audio_summary
from ..services.tts_service import text_to_speech
from ..services.storage_service import upload_audio

router = APIRouter()


@router.post("/generate-summary", response_model=AudioResponse)
async def generate_audio_summary_route(
    data: AudioGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate AI audio summary using Gemini + TTS
    """
    # Create content hash for caching
    content_hash = hashlib.sha256(data.content.encode()).hexdigest()
    
    # Check if audio already exists (cached)
    existing_audio = db.query(AudioSummary).filter(
        AudioSummary.content_hash == content_hash
    ).first()
    
    if existing_audio:
        return AudioResponse(
            audio_url=existing_audio.audio_url,
            simplified_text=existing_audio.simplified_text,
            duration_seconds=existing_audio.duration_seconds or 0,
            cached=True
        )
    
    # Generate simplified text using Gemini
    simplified_text = await generate_audio_summary(data.content)
    
    # Convert text to speech
    audio_bytes, duration = await text_to_speech(simplified_text)
    
    # Upload audio to cloud storage
    audio_url = await upload_audio(
        audio_bytes,
        f"audio_{data.subtopic_id}_{content_hash[:8]}.mp3"
    )
    
    # Store in database
    audio_summary = AudioSummary(
        subtopic_id=data.subtopic_id,
        content_hash=content_hash,
        audio_url=audio_url,
        simplified_text=simplified_text,
        file_size=len(audio_bytes),
        duration_seconds=duration
    )
    db.add(audio_summary)
    db.commit()
    
    return AudioResponse(
        audio_url=audio_url,
        simplified_text=simplified_text,
        duration_seconds=duration,
        cached=False
    )


@router.get("/{subtopic_id}")
async def get_cached_audio(subtopic_id: str, db: Session = Depends(get_db)):
    """
    Get cached audio for a subtopic
    """
    audio = db.query(AudioSummary).filter(
        AudioSummary.subtopic_id == subtopic_id
    ).first()
    
    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    return {
        "audio_url": audio.audio_url,
        "simplified_text": audio.simplified_text,
        "duration_seconds": audio.duration_seconds
    }