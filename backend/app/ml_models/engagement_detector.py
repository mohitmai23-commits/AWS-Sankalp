"""
Engagement Detection Model (Pre-trained from train_model__1_.py)
"""
import cv2
import numpy as np
from tensorflow import keras
import logging

logger = logging.getLogger(__name__)


class EngagementDetector:
    def __init__(self, model_path: str = None):
        """
        Initialize engagement detector with pre-trained model
        """
        if model_path:
            try:
                self.model = keras.models.load_model(model_path)
                logger.info("Engagement Detection model loaded")
            except Exception as e:
                logger.error(f"Failed to load engagement model: {str(e)}")
                self.model = None
        else:
            logger.warning("No engagement model path provided. Using dummy detector.")
            self.model = None
    
    def predict_from_frame(self, image_bytes: bytes) -> float:
        """
        Predict engagement score from webcam frame
        Returns: engagement score (0.0 to 1.0)
        """
        if self.model is None:
            # Dummy prediction
            return 0.7
        
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Preprocess for model (adjust based on training)
            img = cv2.resize(img, (48, 48))
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            img = img.astype('float32') / 255.0
            img = np.expand_dims(img, axis=0)
            img = np.expand_dims(img, axis=-1)
            
            # Predict
            prediction = self.model.predict(img, verbose=0)
            
            # Convert to engagement score (adjust based on model output)
            engagement_score = float(prediction[0][0])
            
            logger.info(f"Engagement score: {engagement_score}")
            return engagement_score
        
        except Exception as e:
            logger.error(f"Engagement prediction error: {str(e)}")
            return 0.5  # Default neutral score