"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    # ==========================
    # Database
    # ==========================
    DATABASE_URL: str

    # ==========================
    # JWT
    # ==========================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ==========================
    # SMTP Email
    # ==========================
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str
    SMTP_FROM_NAME: str


    # ==========================
    # Google / AI Services
    # ==========================
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    GEMINI_API_KEY: str

    # ==========================
    # Redis (optional for dev)
    # ==========================
    REDIS_URL: str = "redis://localhost:6379/0"

    # ==========================
    # MLflow
    # ==========================
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"

    # ==========================
    # Model Paths
    # ==========================
    COGNITIVE_LOAD_MODEL_PATH: str = "models/cognitive_load_model.pkl"
    ENGAGEMENT_MODEL_PATH: str = "models/engagement_model.pkl"
    MEMORY_RETENTION_MODEL_PATH: str = "models/memory_retention_model.pkl"

    # ==========================
    # Cloud Storage
    # ==========================
    STORAGE_BUCKET: str
    STORAGE_TYPE: str = "gcs"  # gcs | s3 | local

    # ==========================
    # Application
    # ==========================
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ==========================
    # Pydantic v2 Config
    # ==========================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
