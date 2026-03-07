"""
Model loading utilities
"""
import joblib
import os
from ..config import settings
import logging

logger = logging.getLogger(__name__)


def load_model(model_path: str):
    """
    Load a trained model from disk
    """
    if not os.path.exists(model_path):
        logger.error(f"Model not found: {model_path}")
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    try:
        model = joblib.load(model_path)
        logger.info(f"Model loaded successfully: {model_path}")
        return model
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise