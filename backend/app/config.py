"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://localhost/adaptive_learning"
    
    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email (AWS SES - primary)
    SES_REGION: str = "ap-south-1"
    SES_FROM_EMAIL: str = "mohitm.ai23@rvce.edu.in"
    SES_FROM_NAME: str = "AnuJnana"
    
    # Email (SendGrid - fallback)
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "mohitm.ai23@rvce.edu.in"
    
    # Frontend URL for verification links
    FRONTEND_URL: str = "https://dwq4qowib3s87.cloudfront.net"
    
    # Google Services
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GEMINI_API_KEY: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # MLflow
    MLFLOW_TRACKING_URI: str = ""
    
    # Model Paths
    COGNITIVE_LOAD_MODEL_PATH: str = "models/cognitive_load_model.pkl"
    ENGAGEMENT_MODEL_PATH: str = "models/engagement_model.pkl"
    MEMORY_RETENTION_MODEL_PATH: str = "models/memory_retention_model.pkl"
    
    # Cloud Storage
    STORAGE_BUCKET: str = ""
    STORAGE_TYPE: str = "s3"  # 'gcs' or 's3'
    
    # Application
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()