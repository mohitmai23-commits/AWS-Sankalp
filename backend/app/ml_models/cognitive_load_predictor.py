"""
Cognitive Load Prediction Model
"""
import numpy as np
from .model_loader import load_model
from ..config import settings
import logging

logger = logging.getLogger(__name__)


class CognitiveLoadPredictor:
    def __init__(self):
        try:
            self.model = load_model(settings.COGNITIVE_LOAD_MODEL_PATH)
            logger.info("Cognitive Load Predictor initialized")
        except FileNotFoundError:
            logger.warning("Cognitive Load model not found. Using dummy predictor.")
            self.model = None
    
    def predict(self, features: dict) -> int:
        """
        Predict cognitive load: 0 = LOW, 1 = HIGH
        """
        if self.model is None:
            # Dummy prediction based on engagement score
            return 1 if features['engagement_score'] < 0.5 else 0
        
        # Prepare feature vector
        feature_vector = np.array([[
            features.get('engagement_score', 0.5),
            features.get('scroll_speed', 0),
            features.get('scroll_depth', 0),
            features.get('back_forth_scrolls', 0),
            features.get('hover_duration_avg', 0),
            features.get('time_per_section_avg', 0),
            features.get('mouse_movement_erratic', 0),
            features.get('pause_duration_total', 0)
        ]])
        
        prediction = self.model.predict(feature_vector)[0]
        logger.info(f"Cognitive Load prediction: {prediction}")
        return int(prediction)