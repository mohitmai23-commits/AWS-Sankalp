"""
Cognitive Load related Pydantic schemas
"""
from pydantic import BaseModel
from typing import Dict, Any


class CognitiveLoadCheck(BaseModel):
    user_id: int
    subtopic_id: str
    engagement_score: float  # 0.0 to 1.0
    scroll_data: Dict[str, Any]
    hover_data: Dict[str, Any]
    time_data: Dict[str, Any]
    mouse_data: Dict[str, Any]


class CognitiveLoadResponse(BaseModel):
    cognitive_load: str  # "HIGH" or "LOW"
    action: str  # "simplify" or "continue"
    quiz_type: str  # "easy" or "hard"
    engagement_score: float