"""
Engagement monitoring routes (for video playback)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.video_engagement import VideoEngagement
from ..models.video_question import VideoQuestion

router = APIRouter()


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