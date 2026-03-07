"""
Cognitive Load Prediction - BALANCED & REALISTIC Version
Key improvements:
1. Lower thresholds for HIGH (was too sensitive)
2. Better smoothing to prevent jumps
3. More time before predicting
4. Better engagement interpretation
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
            logger.info("✅ Cognitive Load XGBoost Model loaded")
            self.using_model = True
        except FileNotFoundError:
            logger.warning("⚠️ Model not found. Using improved heuristic.")
            self.model = None
            self.using_model = False
    
    def predict_with_probability(self, features: dict) -> tuple:
        """
        Predict cognitive load with confidence
        Returns: (prediction: int, probability: float, confidence: float)
        """
        time_spent = features.get('time_spent', 0)
        
        # DATA QUALITY CHECK - Need more time for long content
        data_quality = self._assess_data_quality(features)
        
        if data_quality < 0.4:
            logger.info(f"⏳ Insufficient data (quality={data_quality:.2f}). Time={time_spent:.1f}s")
            return 0, 0.40, data_quality  # Neutral LOW
        
        if self.using_model and self.model is not None:
            return self._predict_with_model(features, data_quality)
        else:
            return self._predict_with_heuristic(features, data_quality)
    
    def _assess_data_quality(self, features: dict) -> float:
        """
        IMPROVED: Require more time for quality assessment
        """
        time_spent = features.get('time_spent', 0)
        mouse_movements = features.get('mouse_movement_erratic', 0)
        scroll_events = features.get('back_forth_scrolls', 0)
        engagement = features.get('engagement_score', 0)
        
        # INCREASED: Need at least 10 seconds (was 8)
        if time_spent < 8:
            time_quality = 0.0
        elif time_spent < 12:
            time_quality = (time_spent - 8) / 4  # 0.0 to 1.0 over 8-12s
        else:
            time_quality = 1.0
        
        # Interaction quality
        interaction_score = 0.0
        if mouse_movements > 0:
            interaction_score += 0.4
        if scroll_events > 0:
            interaction_score += 0.3
        if engagement > 0.1:
            interaction_score += 0.3
        
        quality = (time_quality * 0.7 + interaction_score * 0.3)
        
        return min(quality, 1.0)
    
    def _predict_with_model(self, features: dict, data_quality: float) -> tuple:
        """Use trained XGBoost model"""
        try:
            feature_vector = np.array([[
                features.get('engagement_score', 0.5),
                features.get('scroll_speed', 100),
                min(features.get('scroll_depth', 0.5), 1.0),
                features.get('back_forth_scrolls', 0),
                features.get('hover_duration_avg', 3),
                features.get('time_spent', 10),
                min(features.get('mouse_movement_erratic', 0.3), 1.0),
                features.get('pause_duration', 0)
            ]])
            
            probabilities = self.model.predict_proba(feature_vector)[0]
            prob_high = float(probabilities[1])
            
            # CRITICAL: Blend with neutral during warm-up
            if data_quality < 0.7:
                neutral = 0.35  # Bias towards LOW during warm-up
                prob_high = neutral * (1 - data_quality) + prob_high * data_quality
            
            # CRITICAL: Increase threshold for HIGH (was 0.5, now 0.65)
            prediction = 1 if prob_high > 0.65 else 0
            
            logger.info(f"🤖 XGBoost: {prediction} ({'HIGH' if prediction else 'LOW'}) "
                       f"prob={prob_high:.2%} conf={data_quality:.2%}")
            
            return prediction, prob_high, data_quality
            
        except Exception as e:
            logger.error(f"Model prediction failed: {e}")
            return self._predict_with_heuristic(features, data_quality)
    
    def _predict_with_heuristic(self, features: dict, data_quality: float) -> tuple:
        """
        IMPROVED: More realistic heuristic with better interpretation
        """
        engagement = features.get('engagement_score', 0.5)
        time_spent = features.get('time_spent', 5)
        scroll_depth = features.get('scroll_depth', 0.5)
        scroll_speed = features.get('scroll_speed', 100)
        mouse_erratic = features.get('mouse_movement_erratic', 0.3)
        hover_avg = features.get('hover_duration_avg', 3)
        back_forth = features.get('back_forth_scrolls', 0)
        
        # Start LOWER (was 0.45, now 0.35)
        score = 0.35
        
        # 1. ENGAGEMENT - HIGH engagement (>0.85) = GOOD = LOW cognitive load
        if engagement > 0.90:
            score -= 0.15  # Very engaged = LOW load
        elif engagement > 0.80:
            score -= 0.08  # Engaged = LOW load
        elif engagement > 0.70:
            score += 0.00  # Neutral
        elif engagement > 0.50:
            score += 0.12  # Somewhat disengaged
        else:
            score += 0.25  # Very disengaged = HIGH load
        
        # 2. TIME PATTERNS - Be MORE lenient with reading time
        if time_spent < 5:
            score += 0.20  # Too fast
        elif time_spent < 10:
            score += 0.10  # A bit fast
        elif 12 <= time_spent <= 60:
            score -= 0.08  # Good reading pace
        elif time_spent > 90:
            score += 0.15  # Very slow = struggling
        elif time_spent > 60:
            score += 0.08  # Slow
        
        # 3. SCROLL BEHAVIOR - More lenient
        if scroll_speed > 600:
            score += 0.10  # Very fast scrolling
        elif scroll_speed < 30 and time_spent > 20:
            score += 0.08  # Stuck
        
        if scroll_depth < 0.2 and time_spent > 15:
            score += 0.08
        
        if back_forth > 8:  # Increased threshold (was 3)
            score += 0.08
        
        # 4. MOUSE BEHAVIOR
        if mouse_erratic > 0.8:  # Increased threshold (was 0.6)
            score += 0.08
        
        if hover_avg > 12:  # Increased threshold (was 8)
            score += 0.05
        
        # Convert to probability with sigmoid
        prob_high = 1 / (1 + np.exp(-5 * (score - 0.5)))
        
        # Blend with neutral during warm-up
        if data_quality < 0.7:
            neutral = 0.35
            prob_high = neutral * (1 - data_quality) + prob_high * data_quality
        
        # CRITICAL: Higher threshold for HIGH (was 0.5, now 0.65)
        prediction = 1 if prob_high > 0.65 else 0
        
        logger.info(f"📊 Heuristic: {prediction} ({'HIGH' if prediction else 'LOW'}) "
                   f"score={prob_high:.2%} conf={data_quality:.2%} "
                   f"eng={engagement:.2f} time={time_spent:.1f}s")
        
        return prediction, prob_high, data_quality
    
    def predict(self, features: dict) -> int:
        """Legacy compatibility"""
        prediction, _, _ = self.predict_with_probability(features)
        return prediction