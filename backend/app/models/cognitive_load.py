"""
CognitiveLoad model for storing cognitive load predictions
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class CognitiveLoad(Base):
    __tablename__ = "cognitive_load"
    
    cl_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subtopic_id = Column(String(50), nullable=False)  # e.g., "1.1", "3.2"
    load_level = Column(String(20), nullable=False)  # "HIGH" or "LOW"
    engagement_score = Column(Float, nullable=False)  # 0.0 to 1.0
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Store raw features as JSON for analysis
    features = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="cognitive_loads")
    
    def __repr__(self):
        return f"<CognitiveLoad(user_id={self.user_id}, subtopic='{self.subtopic_id}', level='{self.load_level}')>"