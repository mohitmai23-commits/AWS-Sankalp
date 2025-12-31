"""
Train Cognitive Load Prediction Model (XGBoost Classifier)
"""
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
import joblib
import os
import logging

from .mlflow_config import setup_mlflow, log_model_params, log_model_metrics, log_model_artifact
from .dataset_download import download_ednet_kt1
from .data_preprocessing import preprocess_cognitive_load_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train_cognitive_load_model():
    """
    Train XGBoost model for cognitive load prediction
    """
    logger.info("Starting Cognitive Load Model Training...")
    
    # Setup MLflow
    setup_mlflow()
    
    # Download dataset
    dataset_path = download_ednet_kt1()
    
    # Preprocess data
    X, y, scaler, feature_names = preprocess_cognitive_load_data(dataset_path)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Model parameters (optimized for CPU)
    params = {
        'n_estimators': 150,
        'max_depth': 5,
        'learning_rate': 0.1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'tree_method': 'hist',
        'objective': 'binary:logistic',
        'eval_metric': 'logloss',
        'random_state': 42
    }
    
    # Log parameters to MLflow
    log_model_params(params)
    log_model_params({'feature_count': len(feature_names)})
    
    # Train model
    logger.info("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, verbose=False)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info(f"F1 Score: {f1:.4f}")
    logger.info("\nClassification Report:")
    logger.info(classification_report(y_test, y_pred, target_names=['LOW', 'HIGH']))
    
    # Log metrics to MLflow
    log_model_metrics({
        'accuracy': accuracy,
        'f1_score': f1,
        'test_samples': len(X_test)
    })
    
    # Save model
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "cognitive_load_model.pkl")
    scaler_path = os.path.join(models_dir, "cognitive_load_scaler.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(feature_names, os.path.join(models_dir, "cognitive_load_features.pkl"))
    
    logger.info(f"Model saved to {model_path}")
    
    # Log model to MLflow
    log_model_artifact(model, "cognitive_load_model")
    
    logger.info("Cognitive Load Model Training Complete!")
    
    return model, scaler, feature_names


if __name__ == "__main__":
    train_cognitive_load_model()