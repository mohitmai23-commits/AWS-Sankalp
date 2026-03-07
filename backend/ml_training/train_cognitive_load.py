"""
Train Cognitive Load Prediction Model (XGBoost Classifier)
"""
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
import joblib
import os
import logging
import numpy as np

# Import preprocessing
import sys
sys.path.insert(0, os.path.dirname(__file__))
from backend.ml_training.data_preprocessing_cog import preprocess_cognitive_load_data

# MLflow imports (optional)
try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    print("⚠️  MLflow not available. Training will continue without tracking.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def setup_mlflow():
    """Configure MLflow tracking"""
    if MLFLOW_AVAILABLE:
        mlflow.set_tracking_uri("http://localhost:5000")
        mlflow.set_experiment("cognitive-load-kt1")


def train_cognitive_load_model():
    """
    Train XGBoost model for cognitive load prediction
    """
    logger.info("="*70)
    logger.info("🤖 Starting Cognitive Load Model Training")
    logger.info("="*70)
    
    # Setup MLflow
    if MLFLOW_AVAILABLE:
        setup_mlflow()
    
    # Dataset path (already downloaded)
    dataset_path = "../../data/ednet/KT1"
    if not os.path.exists(dataset_path):
        dataset_path = "../data/ednet/KT1"
    if not os.path.exists(dataset_path):
        dataset_path = "data/ednet/KT1"
    
    logger.info(f"Loading data from: {dataset_path}")
    
    # Preprocess data
    try:
        X, y, scaler, feature_names = preprocess_cognitive_load_data(dataset_path)
    except Exception as e:
        logger.error(f"Failed to load KT1 data: {e}")
        logger.error("Make sure KT1 dataset is in data/ednet/KT1/")
        raise
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    logger.info(f"\n📊 Dataset split:")
    logger.info(f"  Training set: {len(X_train)} samples")
    logger.info(f"  Test set: {len(X_test)} samples")
    
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
    
    logger.info(f"\n🎯 Model parameters:")
    for key, value in params.items():
        logger.info(f"  {key}: {value}")
    
    # Start MLflow run
    if MLFLOW_AVAILABLE:
        mlflow.start_run()
        mlflow.log_params(params)
        mlflow.log_param('feature_count', len(feature_names))
        mlflow.log_param('dataset', 'EdNet-KT1')
        mlflow.log_param('train_samples', len(X_train))
    
    # Train model
    logger.info("\n🚀 Training XGBoost Classifier...")
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, verbose=False)
    
    logger.info("✅ Training complete!")
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    logger.info(f"\n📊 Model Performance:")
    logger.info(f"  Accuracy: {accuracy:.4f}")
    logger.info(f"  F1 Score: {f1:.4f}")
    logger.info("\n📋 Classification Report:")
    logger.info(classification_report(y_test, y_pred, target_names=['LOW', 'HIGH']))
    
    # Feature importance
    logger.info(f"\n🔍 Feature Importance:")
    feature_importance = model.feature_importances_
    feature_imp_dict = dict(zip(feature_names, feature_importance))
    for feat, imp in sorted(feature_imp_dict.items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  {feat}: {imp:.4f}")
    
    # Log metrics to MLflow
    if MLFLOW_AVAILABLE:
        mlflow.log_metric('accuracy', accuracy)
        mlflow.log_metric('f1_score', f1)
        mlflow.log_metric('test_samples', len(X_test))
    
    # Save model
    models_dir = "../../models"
    if not os.path.exists(models_dir):
        models_dir = "../models"
    if not os.path.exists(models_dir):
        models_dir = "models"
    
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "cognitive_load_model.pkl")
    scaler_path = os.path.join(models_dir, "cognitive_load_scaler.pkl")
    features_path = os.path.join(models_dir, "cognitive_load_features.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(feature_names, features_path)
    
    logger.info(f"\n💾 Model saved:")
    logger.info(f"  Model: {model_path}")
    logger.info(f"  Scaler: {scaler_path}")
    logger.info(f"  Features: {features_path}")
    
    # Log model to MLflow
    if MLFLOW_AVAILABLE:
        mlflow.sklearn.log_model(model, "cognitive_load_model")
        mlflow.end_run()
    
    logger.info("\n" + "="*70)
    logger.info("✨ Cognitive Load Model Training Complete!")
    logger.info("="*70)
    
    return model, scaler, feature_names


if __name__ == "__main__":
    try:
        train_cognitive_load_model()
    except Exception as e:
        logger.error(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)