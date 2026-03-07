"""
Lambda Handler for AnuJnana Backend
Uses Mangum to adapt FastAPI for AWS Lambda
"""
import os
import logging

# Set up logging for Lambda
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Set model paths for Lambda environment
os.environ.setdefault("COGNITIVE_LOAD_MODEL_PATH", "models/cognitive_load_model.pkl")
os.environ.setdefault("MEMORY_RETENTION_MODEL_PATH", "models/memory_retention_model.pkl")

from mangum import Mangum
from app.main import app

# Log startup info
logger.info("Loading AnuJnana Lambda handler with ML models...")

# Create the Lambda handler with api_gateway_base_path to strip stage prefix
handler = Mangum(app, lifespan="off", api_gateway_base_path="/prod")
