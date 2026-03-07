"""
VideoEngagement model for tracking video watching behavior
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class VideoEngagement(Base):
    __tablename__ = "video_engagement"
    
    ve_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    video_id = Column(String(100), nullable=False)
    timestamp = Column(Integer, nullable=False)  # Video timestamp in seconds
    engagement_score = Column(Float, nullable=False)  # 0.0 to 1.0
    was_paused = Column(Boolean, default=False)
    question_shown = Column(Boolean, default=False)
    answer_correct = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="video_engagements")
    
    def __repr__(self):
        return f"<VideoEngagement(user_id={self.user_id}, video='{self.video_id}', paused={self.was_paused})>"