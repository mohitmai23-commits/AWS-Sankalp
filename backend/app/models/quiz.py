"""
QuizResult model for storing quiz performance
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    quiz_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subtopic_id = Column(String(50), nullable=False)
    quiz_type = Column(String(20), nullable=False)  # "easy" or "hard"
    score = Column(Float, nullable=False)  # 0.0 to 1.0 (percentage)
    time_taken = Column(Integer, nullable=False)  # seconds
    attempt_number = Column(Integer, default=1)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="quiz_results")
    
    def __repr__(self):
        return f"<QuizResult(user_id={self.user_id}, subtopic='{self.subtopic_id}', score={self.score})>"