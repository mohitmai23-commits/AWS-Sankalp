
"""
Content management routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.progress import Progress

router = APIRouter()


@router.get("/progress/{user_id}")
async def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    """
    Get user's learning progress
    """
    progress = db.query(Progress).filter(Progress.user_id == user_id).all()
    
    # Find last accessed subtopic
    last_progress = db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(Progress.last_accessed.desc()).first()
    
    return {
        "user_id": user_id,
        "last_topic": last_progress.topic if last_progress else None,
        "last_subtopic": last_progress.subtopic if last_progress else None,
        "progress": [
            {
                "topic": p.topic,
                "subtopic": p.subtopic,
                "is_completed": p.is_completed,
                "last_accessed": p.last_accessed.isoformat()
            }
            for p in progress
        ]
    }


@router.post("/progress/update")
async def update_progress(
    user_id: int,
    topic: str,
    subtopic: str,
    is_completed: bool = False,
    db: Session = Depends(get_db)
):
    """
    Update user progress for a subtopic
    """
    progress = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.topic == topic,
        Progress.subtopic == subtopic
    ).first()
    
    if progress:
        progress.is_completed = is_completed
        progress.last_accessed = datetime.utcnow()
    else:
        progress = Progress(
            user_id=user_id,
            topic=topic,
            subtopic=subtopic,
            is_completed=is_completed
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    
    return {"message": "Progress updated successfully"}


@router.post("/track")
async def track_interaction(
    user_id: int,
    subtopic_id: str,
    mouse_data: dict,
    scroll_data: dict,
    hover_data: dict,
    db: Session = Depends(get_db)
):
    """
    Store interaction log data
    """
    from ..models.interaction_log import InteractionLog
    from datetime import datetime
    
    log = InteractionLog(
        user_id=user_id,
        subtopic_id=subtopic_id,
        mouse_data=mouse_data,
        scroll_data=scroll_data,
        hover_data=hover_data
    )
    
    db.add(log)
    db.commit()
    
    return {"message": "Interaction logged successfully"}