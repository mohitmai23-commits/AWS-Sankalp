"""
Quiz submission and memory prediction routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from ..schemas.quiz import QuizSubmit, QuizResponse
from ..models.quiz import QuizResult
from ..models.memory_prediction import MemoryPrediction
from ..ml_models.memory_predictor import MemoryRetentionPredictor
from ..services.email_service import send_immediate_prediction_email

router = APIRouter()
memory_predictor = MemoryRetentionPredictor()


@router.post("/submit", response_model=QuizResponse)
async def submit_quiz(
    data: QuizSubmit,
    db: Session = Depends(get_db)
):
    """
    Submit quiz and trigger memory retention prediction
    """
    # Calculate attempt number
    attempt_number = db.query(QuizResult).filter(
        QuizResult.user_id == data.user_id,
        QuizResult.subtopic_id == data.subtopic_id
    ).count() + 1
    
    # Store quiz result
    quiz_result = QuizResult(
        user_id=data.user_id,
        subtopic_id=data.subtopic_id,
        quiz_type=data.quiz_type,
        score=data.score,
        time_taken=data.time_taken,
        attempt_number=attempt_number
    )
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)
    
    # Prepare features for memory prediction
    features = {
        'quiz_score': data.score,
        'quiz_type': 1 if data.quiz_type == 'hard' else 0,  # hard = 1, easy = 0
        'time_taken': data.time_taken,
        'engagement_avg': data.engagement_avg,
        'cognitive_load': 1 if data.cognitive_load_history == 'HIGH' else 0,
        'video_watched': 1 if data.video_watched else 0,
        'video_pauses': data.video_pauses,
        'audio_completed': 1 if data.audio_completed else 0,
        'attempt_number': attempt_number
    }
    
    # Predict days until forgetting
    predicted_days = memory_predictor.predict(features)
    
    # Calculate reminder date
    reminder_date = datetime.utcnow() + timedelta(days=predicted_days)
    
    # Store prediction
    prediction = MemoryPrediction(
        user_id=data.user_id,
        subtopic_id=data.subtopic_id,
        predicted_days=predicted_days,
        reminder_date=reminder_date,
        is_reminded=False
    )
    db.add(prediction)
    db.commit()
    
    # Send immediate email notification
    from ..models.user import User
    user = db.query(User).filter(User.user_id == data.user_id).first()
    if user:
        await send_immediate_prediction_email(
            user.email,
            user.name,
            data.subtopic_id,
            predicted_days
        )
    
    return QuizResponse(
        quiz_id=quiz_result.quiz_id,
        score=data.score,
        predicted_days=predicted_days,
        reminder_date=reminder_date.isoformat(),
        message=f"Great job! Revise this topic in {predicted_days} days to remember it well."
    )