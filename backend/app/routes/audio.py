"""
Audio Routes - WITH PROPER ERROR HANDLING
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import hashlib
import logging
from datetime import datetime

from ..database import get_db
from ..models.audio_summary import AudioSummary
from ..services.gemini_service import generate_audio_summary

logger = logging.getLogger(__name__)

router = APIRouter()


class AudioGenerationRequest(BaseModel):
    subtopic_id: str
    content: str


class AudioGenerationResponse(BaseModel):
    audio_id: Optional[int] = None
    subtopic_id: str
    simplified_text: str
    audio_url: Optional[str] = None
    is_fallback: bool = False
    message: str


@router.post("/generate-summary", response_model=AudioGenerationResponse)
async def generate_audio_summary_route(
    data: AudioGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate audio summary for content with fallback support
    """
    try:
        logger.info(f"📝 Generating audio summary for subtopic: {data.subtopic_id}")
        
        # Create content hash for caching
        content_hash = hashlib.sha256(data.content.encode()).hexdigest()
        
        # Check if already generated
        existing = db.query(AudioSummary).filter(
            AudioSummary.content_hash == content_hash
        ).first()
        
        if existing:
            logger.info(f"✅ Found cached audio summary (ID: {existing.audio_id})")
            return AudioGenerationResponse(
                audio_id=existing.audio_id,
                subtopic_id=data.subtopic_id,
                simplified_text=existing.simplified_text,
                audio_url=existing.audio_url,
                is_fallback=False,
                message="Retrieved from cache"
            )
        
        # Generate new summary
        try:
            simplified_text = await generate_audio_summary(data.content)
            is_fallback = "[Fallback]" in simplified_text or "Let me explain this concept in simple terms" in simplified_text
            
            logger.info(f"✅ Generated summary: {len(simplified_text)} chars (fallback={is_fallback})")
            
        except Exception as gen_error:
            logger.error(f"❌ Summary generation failed: {gen_error}")
            # Return a simple fallback instead of crashing
            simplified_text = f"""
Let me explain this concept in simple terms.

{data.content[:500]}

This is one of the fundamental concepts in quantum mechanics. 
The audio feature is temporarily using a basic summary due to high demand.
Please watch the video or read the full content for complete details.
            """.strip()
            is_fallback = True
        
        # Save to database
        try:
            audio_summary = AudioSummary(
                subtopic_id=data.subtopic_id,
                content_hash=content_hash,
                simplified_text=simplified_text,
                audio_url=None,  # TTS integration can be added later
                created_at=datetime.utcnow(),
                file_size=len(simplified_text),
                duration_seconds=len(simplified_text) // 150  # Rough estimate: 150 chars/minute
            )
            
            db.add(audio_summary)
            db.commit()
            db.refresh(audio_summary)
            
            logger.info(f"💾 Saved audio summary (ID: {audio_summary.audio_id})")
            
            return AudioGenerationResponse(
                audio_id=audio_summary.audio_id,
                subtopic_id=data.subtopic_id,
                simplified_text=simplified_text,
                audio_url=audio_summary.audio_url,
                is_fallback=is_fallback,
                message="Summary generated successfully" if not is_fallback else "Using simplified summary"
            )
            
        except Exception as db_error:
            logger.error(f"⚠️ Database save failed: {db_error}")
            # Still return the summary even if DB fails
            return AudioGenerationResponse(
                audio_id=None,
                subtopic_id=data.subtopic_id,
                simplified_text=simplified_text,
                audio_url=None,
                is_fallback=is_fallback,
                message="Summary generated (not cached)"
            )
        
    except Exception as e:
        logger.error(f"❌ Audio generation route failed: {e}")
        import traceback
        traceback.print_exc()
        
        # Return error response instead of crashing
        raise HTTPException(
            status_code=500,
            detail=f"Audio generation failed: {str(e)}"
        )


@router.get("/{subtopic_id}")
async def get_cached_audio(
    subtopic_id: str,
    db: Session = Depends(get_db)
):
    """
    Get cached audio summary for a subtopic
    """
    try:
        audio = db.query(AudioSummary).filter(
            AudioSummary.subtopic_id == subtopic_id
        ).order_by(AudioSummary.created_at.desc()).first()
        
        if not audio:
            raise HTTPException(status_code=404, detail="Audio summary not found")
        
        return {
            "audio_id": audio.audio_id,
            "subtopic_id": audio.subtopic_id,
            "simplified_text": audio.simplified_text,
            "audio_url": audio.audio_url,
            "created_at": audio.created_at.isoformat(),
            "duration_seconds": audio.duration_seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch cached audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))