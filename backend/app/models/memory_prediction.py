"""
MemoryPrediction model for storing retention predictions
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MemoryPrediction(Base):
    __tablename__ = "memory_predictions"
    
    prediction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subtopic_id = Column(String(50), nullable=False)
    predicted_days = Column(Integer, nullable=False)  # Days until forgetting
    reminder_date = Column(DateTime, nullable=False)
    is_reminded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="memory_predictions")
    
    def __repr__(self):
        return f"<MemoryPrediction(user_id={self.user_id}, subtopic='{self.subtopic_id}', days={self.predicted_days})>"