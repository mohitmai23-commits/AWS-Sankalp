"""
Content management routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.progress import Progress
from ..models.notification import Notification  # ADD THIS IMPORT

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


from pydantic import BaseModel

class ProgressUpdate(BaseModel):
    user_id: int
    topic: str
    subtopic: str
    is_completed: bool = False


@router.post("/progress/update")
async def update_progress(
    data: ProgressUpdate,
    db: Session = Depends(get_db)
):
    """
    Update user progress for a subtopic
    """
    progress = db.query(Progress).filter(
        Progress.user_id == data.user_id,
        Progress.topic == data.topic,
        Progress.subtopic == data.subtopic
    ).first()
    
    was_not_completed = False
    if progress:
        was_not_completed = not progress.is_completed and data.is_completed
        progress.is_completed = data.is_completed
        progress.last_accessed = datetime.utcnow()
    else:
        progress = Progress(
            user_id=data.user_id,
            topic=data.topic,
            subtopic=data.subtopic,
            is_completed=data.is_completed
        )
        db.add(progress)
        was_not_completed = data.is_completed
    
    db.commit()
    db.refresh(progress)
    
    # CREATE NOTIFICATION when subtopic is completed for the first time
    if was_not_completed:
        notification = Notification(
            user_id=data.user_id,
            message=f"🎉 Congratulations! You completed {data.topic} - Subtopic {data.subtopic}!",
            link=f"/physics/{data.topic.lower().replace(' ', '-')}/{data.subtopic}",
            is_read=False
        )
        db.add(notification)
        db.commit()
    
    return {
        "message": "Progress updated successfully",
        "is_completed": data.is_completed,
        "notification_created": was_not_completed
    }


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