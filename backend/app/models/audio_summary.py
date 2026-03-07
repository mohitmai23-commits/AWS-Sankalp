"""
AudioSummary model for caching AI-generated audio summaries
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, BigInteger
from datetime import datetime
from ..database import Base


class AudioSummary(Base):
    __tablename__ = "audio_summaries"
    
    audio_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subtopic_id = Column(String(50), nullable=False, index=True)
    content_hash = Column(String(64), nullable=False, unique=True, index=True)  # MD5/SHA256 hash
    audio_url = Column(String(500), nullable=False)  # Cloud storage URL
    simplified_text = Column(Text, nullable=False)  # LLM-generated text
    created_at = Column(DateTime, default=datetime.utcnow)
    file_size = Column(BigInteger, nullable=True)  # bytes
    duration_seconds = Column(Integer, nullable=True)
    
    def __repr__(self):
        return f"<AudioSummary(subtopic='{self.subtopic_id}', hash='{self.content_hash[:8]}...')>"