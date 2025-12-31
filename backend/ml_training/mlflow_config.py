"""
MLflow configuration for experiment tracking
"""
import mlflow
from app.config import settings


def setup_mlflow():
    """
    Configure MLflow tracking
    """
    mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
    mlflow.set_experiment("adaptive-learning-models")


def log_model_params(params: dict):
    """
    Log model parameters to MLflow
    """
    for key, value in params.items():
        mlflow.log_param(key, value)


def log_model_metrics(metrics: dict):
    """
    Log model metrics to MLflow
    """
    for key, value in metrics.items():
        mlflow.log_metric(key, value)


def log_model_artifact(model, model_name: str):
    """
    Log trained model to MLflow
    """
    mlflow.sklearn.log_model(model, model_name)