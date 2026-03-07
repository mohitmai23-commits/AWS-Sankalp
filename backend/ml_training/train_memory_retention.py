"""
Train Memory Retention Model with REDESIGNED Features
Focus: Quiz performance as primary predictor
"""
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import logging
import numpy as np

# Import ASSISTments preprocessing
import sys
sys.path.insert(0, os.path.dirname(__file__))
from data_preprocessing import preprocess_assistments_memory_retention

# MLflow imports
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
        mlflow.set_experiment("memory-retention-redesigned")


def train_memory_retention_model():
    """
    Train XGBoost model with REDESIGNED features
    Key: Quiz score is now PRIMARY feature
    """
    logger.info("="*80)
    logger.info("🧠 Memory Retention Training - REDESIGNED FEATURES")
    logger.info("="*80)
    
    # Setup MLflow
    if MLFLOW_AVAILABLE:
        setup_mlflow()
    
    # Find dataset path (ASSISTments)
    dataset_path = "../../data/assistments/skill_builder_data.csv"
    if not os.path.exists(dataset_path):
        dataset_path = "../data/assistments/skill_builder_data.csv"
    if not os.path.exists(dataset_path):
        dataset_path = "data/assistments/skill_builder_data.csv"
    if not os.path.exists(dataset_path):
        dataset_path = "../../data/raw/skill_builder_data.csv"
    if not os.path.exists(dataset_path):
        dataset_path = "../data/raw/skill_builder_data.csv"
    
    logger.info(f"Loading data from: {dataset_path}\n")
    
    try:
        X, y, scaler, feature_names = preprocess_assistments_memory_retention(dataset_path)
    except Exception as e:
        logger.error(f"Failed to load ASSISTments data: {e}")
        logger.error("Make sure skill_builder_data.csv is in data/assistments/ or data/raw/")
        raise
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    logger.info(f"\n{'='*80}")
    logger.info("DATASET SPLIT")
    logger.info(f"{'='*80}")
    logger.info(f"  Training set: {len(X_train)} sessions")
    logger.info(f"  Test set:     {len(X_test)} sessions")
    
    # Model parameters
    params = {
        'n_estimators': 300,        # More trees for better learning
        'max_depth': 7,             # Deeper trees to capture patterns
        'learning_rate': 0.05,      # Lower LR for better generalization
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'tree_method': 'hist',
        'objective': 'reg:squarederror',
        'random_state': 42,
        'min_child_weight': 3,      # Prevent overfitting
        'gamma': 0.1,               # Regularization
        'reg_alpha': 0.1,           # L1 regularization
        'reg_lambda': 1.0           # L2 regularization
    }
    
    logger.info(f"\n{'='*80}")
    logger.info("MODEL PARAMETERS")
    logger.info(f"{'='*80}")
    for key, value in params.items():
        logger.info(f"  {key:20s}: {value}")
    
    # Start MLflow run
    if MLFLOW_AVAILABLE:
        mlflow.start_run()
        mlflow.log_params(params)
        mlflow.log_param('feature_count', len(feature_names))
        mlflow.log_param('dataset', 'EdNet-KT3-Redesigned')
        mlflow.log_param('train_samples', len(X_train))
    
    # Train model
    logger.info(f"\n{'='*80}")
    logger.info("TRAINING XGBoost Regressor...")
    logger.info(f"{'='*80}")
    
    model = xgb.XGBRegressor(**params)
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    
    logger.info("✅ Training complete!\n")
    
    # Evaluate
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"{'='*80}")
    logger.info("MODEL PERFORMANCE")
    logger.info(f"{'='*80}")
    logger.info(f"  MAE (Mean Absolute Error):  {mae:.2f} days")
    logger.info(f"  RMSE (Root Mean Sq Error):  {rmse:.2f} days")
    logger.info(f"  R² Score:                    {r2:.4f}")
    
    # Performance interpretation
    if mae < 2.0:
        performance = "EXCELLENT"
    elif mae < 3.0:
        performance = "GOOD"
    elif mae < 4.0:
        performance = "ACCEPTABLE"
    else:
        performance = "NEEDS IMPROVEMENT"
    
    logger.info(f"  Performance Rating:          {performance}")
    
    logger.info(f"\n{'='*80}")
    logger.info("PREDICTION ANALYSIS")
    logger.info(f"{'='*80}")
    logger.info(f"  Actual days range:     {y_test.min():.0f} - {y_test.max():.0f}")
    logger.info(f"  Predicted days range:  {y_pred.min():.1f} - {y_pred.max():.1f}")
    logger.info(f"  Mean actual:           {y_test.mean():.1f} days")
    logger.info(f"  Mean predicted:        {y_pred.mean():.1f} days")
    
    # Error distribution
    errors = np.abs(y_test.values - y_pred)
    logger.info(f"\n  Error Distribution:")
    logger.info(f"    < 1 day error:   {(errors < 1).sum():5d} samples ({(errors < 1).sum()/len(errors)*100:5.1f}%)")
    logger.info(f"    < 2 days error:  {(errors < 2).sum():5d} samples ({(errors < 2).sum()/len(errors)*100:5.1f}%)")
    logger.info(f"    < 3 days error:  {(errors < 3).sum():5d} samples ({(errors < 3).sum()/len(errors)*100:5.1f}%)")
    logger.info(f"    > 5 days error:  {(errors > 5).sum():5d} samples ({(errors > 5).sum()/len(errors)*100:5.1f}%)")
    
    # Feature importance
    logger.info(f"\n{'='*80}")
    logger.info("FEATURE IMPORTANCE")
    logger.info(f"{'='*80}")
    
    feature_importance = model.feature_importances_
    feature_imp_dict = dict(zip(feature_names, feature_importance))
    
    logger.info("\n  Ranked by importance:")
    for i, (feat, imp) in enumerate(sorted(feature_imp_dict.items(), key=lambda x: x[1], reverse=True), 1):
        stars = "★" * int(imp * 20)  # Visual representation
        logger.info(f"  {i}. {feat:30s}: {imp:.4f} ({imp*100:5.1f}%) {stars}")
    
    # Check if quiz_score is important
    quiz_score_importance = feature_imp_dict.get('quiz_score', 0)
    
    logger.info(f"\n{'='*80}")
    logger.info("FEATURE IMPORTANCE VALIDATION")
    logger.info(f"{'='*80}")
    
    if quiz_score_importance > 0.15:
        logger.info(f"  ✓ EXCELLENT: quiz_score has {quiz_score_importance*100:.1f}% importance")
        logger.info(f"    Model is properly using quiz performance!")
    elif quiz_score_importance > 0.05:
        logger.info(f"  ✓ GOOD: quiz_score has {quiz_score_importance*100:.1f}% importance")
        logger.info(f"    Model considers quiz performance")
    else:
        logger.warning(f"  ⚠ WARNING: quiz_score only has {quiz_score_importance*100:.1f}% importance")
        logger.warning(f"    Model may not be using quiz performance properly!")
    
    # Log metrics to MLflow
    if MLFLOW_AVAILABLE:
        mlflow.log_metric('mae', mae)
        mlflow.log_metric('rmse', rmse)
        mlflow.log_metric('r2_score', r2)
        mlflow.log_metric('quiz_score_importance', quiz_score_importance)
        mlflow.log_metric('test_samples', len(X_test))
    
    # Save model
    models_dir = "../../models"
    if not os.path.exists(models_dir):
        models_dir = "../models"
    if not os.path.exists(models_dir):
        models_dir = "models"
    
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "memory_retention_model.pkl")
    scaler_path = os.path.join(models_dir, "memory_retention_scaler.pkl")
    features_path = os.path.join(models_dir, "memory_retention_features.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(feature_names, features_path)
    
    logger.info(f"\n{'='*80}")
    logger.info("MODEL SAVED")
    logger.info(f"{'='*80}")
    logger.info(f"  Model:    {model_path}")
    logger.info(f"  Scaler:   {scaler_path}")
    logger.info(f"  Features: {features_path}")
    
    # Log model to MLflow
    if MLFLOW_AVAILABLE:
        mlflow.sklearn.log_model(model, "memory_retention_model")
        mlflow.end_run()
    
    logger.info(f"\n{'='*80}")
    logger.info("✨ TRAINING COMPLETE!")
    logger.info(f"{'='*80}")
    
    # Final summary
    logger.info("\nModel Summary:")
    logger.info(f"  • Accuracy (R²):        {r2:.1%}")
    logger.info(f"  • Avg Error (MAE):      {mae:.1f} days")
    logger.info(f"  • Quiz Score Impact:    {quiz_score_importance*100:.1f}%")
    logger.info(f"  • Ready for Production: {'YES ✓' if quiz_score_importance > 0.10 else 'NEEDS REVIEW ⚠'}")
    
    return model, scaler, feature_names


if __name__ == "__main__":
    try:
        train_memory_retention_model()
    except Exception as e:
        logger.error(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)