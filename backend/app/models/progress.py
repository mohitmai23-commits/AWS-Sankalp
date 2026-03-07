"""
Progress model for tracking user learning progress
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Progress(Base):
    __tablename__ = "progress"
    
    progress_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    topic = Column(String(255), nullable=False)  # e.g., "Infinite Potential Well"
    subtopic = Column(String(255), nullable=False)  # e.g., "1.1"
    last_accessed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="progress")
    
    def __repr__(self):
        return f"<Progress(user_id={self.user_id}, topic='{self.topic}', subtopic='{self.subtopic}')>"