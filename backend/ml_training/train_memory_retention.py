"""
Train Memory Retention Prediction Model (XGBoost Regressor)
"""
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import logging
import numpy as np

from .mlflow_config import setup_mlflow, log_model_params, log_model_metrics, log_model_artifact
from .dataset_download import download_ednet_kt3
from .data_preprocessing import preprocess_memory_retention_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train_memory_retention_model():
    """
    Train XGBoost model for memory retention prediction
    """
    logger.info("Starting Memory Retention Model Training...")
    
    # Setup MLflow
    setup_mlflow()
    
    # Download dataset
    try:
        dataset_path = download_ednet_kt3()
    except Exception as e:
        logger.warning(f"Could not download EdNet-KT3: {e}")
        dataset_path = None
    
    # Preprocess data
    X, y, scaler, feature_names = preprocess_memory_retention_data(dataset_path)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Model parameters
    params = {
        'n_estimators': 200,
        'max_depth': 6,
        'learning_rate': 0.1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'tree_method': 'hist',
        'objective': 'reg:squarederror',
        'random_state': 42
    }
    
    # Log parameters
    log_model_params(params)
    log_model_params({'feature_count': len(feature_names)})
    
    # Train model
    logger.info("Training XGBoost Regressor...")
    model = xgb.XGBRegressor(**params)
    model.fit(X_train, y_train, verbose=False)
    
    # Evaluate
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"MAE: {mae:.2f} days")
    logger.info(f"RMSE: {rmse:.2f} days")
    logger.info(f"R² Score: {r2:.4f}")
    
    # Log metrics
    log_model_metrics({
        'mae': mae,
        'rmse': rmse,
        'r2_score': r2,
        'test_samples': len(X_test)
    })
    
    # Save model
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "memory_retention_model.pkl")
    scaler_path = os.path.join(models_dir, "memory_retention_scaler.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(feature_names, os.path.join(models_dir, "memory_retention_features.pkl"))
    
    logger.info(f"Model saved to {model_path}")
    
    # Log model to MLflow
    log_model_artifact(model, "memory_retention_model")
    
    logger.info("Memory Retention Model Training Complete!")
    
    return model, scaler, feature_names


if __name__ == "__main__":
    train_memory_retention_model()