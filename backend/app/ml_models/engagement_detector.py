"""
Engagement Detection Model (Pre-trained from train_model__1_.py)
"""
import cv2
import numpy as np
import logging
import time
import random

logger = logging.getLogger(__name__)


class EngagementDetector:
    def __init__(self, model_path: str = None):
        """
        Initialize engagement detector with pre-trained model
        """
        self.model = None
        self.last_scores = []  # Track recent scores for smoothing
        
        if model_path:
            try:
                from tensorflow import keras
                self.model = keras.models.load_model(model_path)
                logger.info("✅ Engagement Detection model loaded from file")
            except Exception as e:
                logger.warning(f"⚠️  Failed to load engagement model: {str(e)}")
                logger.info("Using simulated engagement detector")
                self.model = None
        else:
            logger.info("⚠️  No engagement model path provided. Using simulated engagement based on image analysis.")
            self.model = None
    
    def predict_from_frame(self, image_bytes: bytes) -> float:
        """
        Predict engagement score from webcam frame
        Returns: engagement score (0.0 to 1.0)
        """
        if self.model is None:
            # Simulated engagement detection based on image properties
            return self._simulate_engagement(image_bytes)
        
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
    
    def _simulate_engagement(self, image_bytes: bytes) -> float:
        """
        Simulate engagement detection using simple image analysis
        This provides realistic varying scores instead of constant 0.7
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return 0.5
            
            # Simple heuristics for engagement:
            # 1. Face detection (presence = engaged)
            # 2. Brightness variance (movement = engaged)
            # 3. Image sharpness (focused = engaged)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Calculate metrics
            brightness_var = np.var(gray)  # Higher variance = more detail/movement
            mean_brightness = np.mean(gray)  # Check if image is too dark
            sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()  # Higher = sharper
            
            # Try face detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            face_detected = len(faces) > 0
            
            # Calculate engagement score
            score = 0.3  # Base score
            
            if face_detected:
                score += 0.4  # Strong indicator of engagement
            
            if brightness_var > 500:  # Image has good detail
                score += 0.1
            
            if 50 < mean_brightness < 200:  # Not too dark or bright
                score += 0.1
            
            if sharpness > 100:  # Image is sharp/focused
                score += 0.1
            
            # Add some randomness to simulate natural variation
            score += random.uniform(-0.05, 0.05)
            
            # Clamp to valid range
            score = max(0.2, min(1.0, score))
            
            # Smooth with recent scores
            self.last_scores.append(score)
            if len(self.last_scores) > 5:
                self.last_scores.pop(0)
            
            smoothed_score = np.mean(self.last_scores)
            
            logger.info(f"📊 Simulated engagement: {smoothed_score:.2f} (face: {face_detected}, bright_var: {brightness_var:.0f})")
            
            return float(smoothed_score)
            
        except Exception as e:
            logger.error(f"Simulated engagement error: {str(e)}")
            # Return varying score instead of constant
            return 0.5 + random.uniform(-0.2, 0.2)