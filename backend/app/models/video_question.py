"""
VideoQuestion model for storing pre-defined video engagement questions
"""
from sqlalchemy import Column, Integer, String, JSON
from ..database import Base


class VideoQuestion(Base):
    __tablename__ = "video_questions"
    
    vq_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    video_id = Column(String(100), nullable=False, index=True)
    timestamp = Column(Integer, nullable=False)  # seconds (every 30s)
    question_text = Column(String(500), nullable=False)
    options = Column(JSON, nullable=False)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_option = Column(Integer, nullable=False)  # 0-3 (index of correct answer)
    
    def __repr__(self):
        return f"<VideoQuestion(video_id='{self.video_id}', timestamp={self.timestamp})>"