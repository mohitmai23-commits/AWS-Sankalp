"""
Quiz related Pydantic schemas
"""
from pydantic import BaseModel
from typing import List, Dict, Any


class QuizSubmit(BaseModel):
    user_id: int
    subtopic_id: str
    quiz_type: str  # "easy" or "hard"
    score: float  # 0.0 to 1.0
    time_taken: int  # seconds
    engagement_avg: float
    cognitive_load_history: str  # "HIGH" or "LOW"
    video_watched: bool = False
    video_pauses: int = 0
    audio_completed: bool = False


class QuizResponse(BaseModel):
    quiz_id: int
    score: float
    predicted_days: int
    reminder_date: str
    message: str