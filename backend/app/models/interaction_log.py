"""
InteractionLog model for storing detailed user interaction data
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class InteractionLog(Base):
    __tablename__ = "interaction_logs"
    
    log_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subtopic_id = Column(String(50), nullable=False)
    
    # Interaction data stored as JSON
    mouse_data = Column(JSON, nullable=True)  # movements, clicks, hover duration
    scroll_data = Column(JSON, nullable=True)  # depth, speed, patterns
    hover_data = Column(JSON, nullable=True)  # elements hovered, duration
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="interaction_logs")
    
    def __repr__(self):
        return f"<InteractionLog(user_id={self.user_id}, subtopic='{self.subtopic_id}')>"