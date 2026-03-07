"""
Engagement monitoring routes (for video playback and camera-based engagement detection)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import base64
import logging

from ..database import get_db
from ..models.video_engagement import VideoEngagement
from ..models.video_question import VideoQuestion

logger = logging.getLogger(__name__)
router = APIRouter()

# Lazy-load engagement detector
_engagement_detector = None

def get_engagement_detector():
    global _engagement_detector
    if _engagement_detector is None:
        from ..ml_models.engagement_detector import EngagementDetector
        _engagement_detector = EngagementDetector()
        logger.info("✅ Engagement Detector lazy-loaded")
    return _engagement_detector


class FrameDetectionRequest(BaseModel):
    user_id: int
    image_base64: str  # Base64 encoded JPEG image from webcam


class EngagementResponse(BaseModel):
    engagement_score: float
    face_detected: bool
    message: str


@router.post("/detect", response_model=EngagementResponse)
async def detect_engagement_from_frame(request: FrameDetectionRequest):
    """
    Detect engagement from webcam frame using ML model
    """
    try:
        detector = get_engagement_detector()
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            image_data = request.image_base64
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
        except Exception as decode_error:
            logger.error(f"Image decode error: {decode_error}")
            return EngagementResponse(
                engagement_score=0.5,
                face_detected=False,
                message="Image decode failed, using default"
            )
        
        # Get engagement score from detector
        engagement_score = detector.predict_from_frame(image_bytes)
        
        # Check if face was detected (score > 0.6 generally means face found)
        face_detected = engagement_score > 0.6
        
        logger.info(f"📷 User {request.user_id} engagement: {engagement_score:.2f} (face: {face_detected})")
        
        return EngagementResponse(
            engagement_score=engagement_score,
            face_detected=face_detected,
            message="Engagement analyzed successfully"
        )
        
    except Exception as e:
        logger.error(f"Engagement detection error: {e}")
        return EngagementResponse(
            engagement_score=0.5,
            face_detected=False,
            message=f"Detection error: {str(e)}"
        )


@router.post("/video-check")
async def check_video_engagement(
    user_id: int,
    video_id: str,
    timestamp: int,
    engagement_score: float,
    db: Session = Depends(get_db)
):
    """
    Check engagement during video playback
    Returns action and question if engagement is low
    """
    action = "continue"
    question_data = None
    
    # If engagement is low, trigger pause and question
    if engagement_score < 0.3:
        action = "pause"
        
        # Find question for this timestamp (nearest 30s interval)
        question_timestamp = (timestamp // 30) * 30
        question = db.query(VideoQuestion).filter(
            VideoQuestion.video_id == video_id,
            VideoQuestion.timestamp == question_timestamp
        ).first()
        
        if question:
            question_data = {
                "id": question.vq_id,
                "text": question.question_text,
                "options": question.options,
                "correct_index": question.correct_option
            }
        
        # Log engagement event
        engagement_log = VideoEngagement(
            user_id=user_id,
            video_id=video_id,
            timestamp=timestamp,
            engagement_score=engagement_score,
            was_paused=True,
            question_shown=question is not None
        )
        db.add(engagement_log)
        db.commit()
    
    return {
        "action": action,
        "question": question_data
    }


@router.post("/video-answer")
async def record_video_answer(
    user_id: int,
    video_id: str,
    timestamp: int,
    answer_correct: bool,
    db: Session = Depends(get_db)
):
    """
    Record user's answer to attention question
    """
    # Find the most recent engagement record
    engagement = db.query(VideoEngagement).filter(
        VideoEngagement.user_id == user_id,
        VideoEngagement.video_id == video_id,
        VideoEngagement.timestamp == timestamp
    ).order_by(VideoEngagement.created_at.desc()).first()
    
    if engagement:
        engagement.answer_correct = answer_correct
        db.commit()
    
    return {
        "message": "Answer recorded",
        "rewind_seconds": 20 if not answer_correct else 0
    }


@router.post("/update")
async def update_engagement(
    user_id: int,
    subtopic_id: str,
    engagement_score: float,
    db: Session = Depends(get_db)
):
    """
    Update general engagement score (for content reading)
    """
    # This can be used for tracking engagement during content reading
    # Can be stored in CognitiveLoad table or separate tracking
    return {"message": "Engagement updated", "score": engagement_score}