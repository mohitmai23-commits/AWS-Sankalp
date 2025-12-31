"""
Notification management routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.notification import Notification

router = APIRouter()


@router.get("/{user_id}")
async def get_notifications(user_id: int, db: Session = Depends(get_db)):
    """
    Get all notifications for a user
    """
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return {
        "notifications": [
            {
                "notif_id": n.notif_id,
                "message": n.message,
                "link": n.link,
                "created_at": n.created_at.isoformat(),
                "is_read": n.is_read
            }
            for n in notifications
        ],
        "unread_count": sum(1 for n in notifications if not n.is_read)
    }


@router.post("/{notif_id}/mark-read")
async def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    """
    Mark a notification as read
    """
    notification = db.query(Notification).filter(
        Notification.notif_id == notif_id
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
    
    return {"message": "Notification marked as read"}