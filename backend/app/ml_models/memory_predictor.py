"""
Memory Retention Prediction Model
"""
import numpy as np
from .model_loader import load_model
from ..config import settings
import logging

logger = logging.getLogger(__name__)


class MemoryRetentionPredictor:
    def __init__(self):
        try:
            self.model = load_model(settings.MEMORY_RETENTION_MODEL_PATH)
            logger.info("Memory Retention Predictor initialized")
        except FileNotFoundError:
            logger.warning("Memory Retention model not found. Using dummy predictor.")
            self.model = None
    
    def predict(self, features: dict) -> int:
        """
        Predict days until forgetting (returns integer: 3, 5, 7, 14, etc.)
        """
        if self.model is None:
            # Dummy prediction based on quiz score
            score = features.get('quiz_score', 0.5)
            if score >= 0.8:
                return 7
            elif score >= 0.6:
                return 5
            else:
                return 3
        
        # Prepare feature vector
        feature_vector = np.array([[
            features.get('quiz_score', 0.5),
            features.get('quiz_type', 0),  # 0=easy, 1=hard
            features.get('time_taken', 180),
            features.get('engagement_avg', 0.5),
            features.get('cognitive_load', 0),  # 0=low, 1=high
            features.get('video_watched', 0),
            features.get('video_pauses', 0),
            features.get('audio_completed', 0),
            features.get('attempt_number', 1)
        ]])
        
        prediction = self.model.predict(feature_vector)[0]
        predicted_days = int(np.round(prediction))
        
        # Clamp between 3 and 14 days
        predicted_days = max(3, min(14, predicted_days))
        
        logger.info(f"Memory Retention prediction: {predicted_days} days")
        return predicted_days