"""
Celery task for sending revision reminders (daily cron job)
"""
from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date
import logging
from celery.schedules import crontab

from ..config import settings
from ..models.memory_prediction import MemoryPrediction
from ..models.user import User
from ..models.notification import Notification
from ..services.email_service import send_revision_reminder

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'tasks',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


@celery_app.task
def send_daily_reminders():
    """
    Send revision reminders to users (runs daily at midnight)
    """
    db = SessionLocal()
    
    try:
        today = date.today()
        
        # Find all predictions due today that haven't been reminded
        predictions = db.query(MemoryPrediction).filter(
            MemoryPrediction.reminder_date.cast(date) == today,
            MemoryPrediction.is_reminded == False
        ).all()
        
        logger.info(f"Found {len(predictions)} reminders to send")
        
        for prediction in predictions:
            user = db.query(User).filter(User.user_id == prediction.user_id).first()
            
            if user:
                # Send email
                link = f"https://yourdomain.com/physics/{prediction.subtopic_id}"
                send_revision_reminder(
                    user.email,
                    user.name,
                    prediction.subtopic_id,
                    link
                )
                
                # Create in-app notification
                notification = Notification(
                    user_id=user.user_id,
                    message=f"Time to revise: {prediction.subtopic_id}",
                    link=f"/physics/{prediction.subtopic_id}"
                )
                db.add(notification)
                
                # Mark as reminded
                prediction.is_reminded = True
                
                logger.info(f"Sent reminder to user {user.user_id} for {prediction.subtopic_id}")
        
        db.commit()
        logger.info("Daily reminders sent successfully")
    
    except Exception as e:
        logger.error(f"Error sending reminders: {str(e)}")
        db.rollback()
    finally:
        db.close()


# Schedule: Run daily at midnight
celery_app.conf.beat_schedule = {
    'send-daily-reminders': {
        'task': 'app.tasks.reminder_cron.send_daily_reminders',
        'schedule': crontab(hour=0, minute=0),
    },
}