"""
Cognitive load prediction routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.cognitive_load import CognitiveLoadCheck, CognitiveLoadResponse
from ..ml_models.cognitive_load_predictor import CognitiveLoadPredictor
from ..models.cognitive_load import CognitiveLoad
from datetime import datetime

router = APIRouter()
cl_predictor = CognitiveLoadPredictor()


@router.post("/check", response_model=CognitiveLoadResponse)
async def check_cognitive_load(
    data: CognitiveLoadCheck,
    db: Session = Depends(get_db)
):
    """
    Predict cognitive load based on engagement and interaction data
    """
    # Prepare features for model
    features = {
        'engagement_score': data.engagement_score,
        'scroll_speed': data.scroll_data.get('speed', 0),
        'scroll_depth': data.scroll_data.get('depth', 0),
        'back_forth_scrolls': data.scroll_data.get('back_forth', 0),
        'hover_duration_avg': data.hover_data.get('avg_duration', 0),
        'time_per_section_avg': data.time_data.get('avg_time_per_section', 0),
        'mouse_movement_erratic': data.mouse_data.get('erratic_score', 0),
        'pause_duration_total': data.time_data.get('total_pause', 0)
    }
    
    # Predict cognitive load
    prediction = cl_predictor.predict(features)
    load_level = "HIGH" if prediction == 1 else "LOW"
    
    # Determine action and quiz type
    action = "simplify" if load_level == "HIGH" else "continue"
    quiz_type = "easy" if load_level == "HIGH" else "hard"
    
    # Store in database
    cl_record = CognitiveLoad(
        user_id=data.user_id,
        subtopic_id=data.subtopic_id,
        load_level=load_level,
        engagement_score=data.engagement_score,
        features=features
    )
    db.add(cl_record)
    db.commit()
    
    return CognitiveLoadResponse(
        cognitive_load=load_level,
        action=action,
        quiz_type=quiz_type,
        engagement_score=data.engagement_score
    )