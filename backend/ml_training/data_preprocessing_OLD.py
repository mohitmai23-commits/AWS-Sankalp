"""
Data preprocessing for EdNet datasets
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


def preprocess_cognitive_load_data(dataset_path: str):
    """
    Preprocess EdNet-KT1 for cognitive load prediction
    
    Creates features:
    - time_spent: seconds spent on content
    - pause_duration: time paused
    - scroll_speed: simulated scroll speed
    - back_forth_scrolls: simulated back-forth behavior
    - hover_duration_avg: average hover time
    - engagement_score: simulated engagement (0-1)
    
    Label:
    - cognitive_load: HIGH (1) if user struggled, LOW (0) otherwise
    """
    logger.info(f"Loading data from {dataset_path}")
    
    # Load EdNet-KT1 data
    # Adjust path based on actual dataset structure
    df = pd.read_csv(f"{dataset_path}/KT1_interactions.csv")
    
    # Feature engineering
    logger.info("Engineering features...")
    
    # Time-based features
    df['time_spent'] = df['elapsed_time'] / 1000  # Convert to seconds
    df['pause_duration'] = df['time_spent'] * 0.1  # Simulate pauses
    
    # Interaction features (simulated for EdNet)
    df['scroll_speed'] = np.random.uniform(50, 300, size=len(df))
    df['scroll_depth'] = np.random.uniform(0.2, 1.0, size=len(df))
    df['back_forth_scrolls'] = np.random.poisson(2, size=len(df))
    df['hover_duration_avg'] = np.random.uniform(1, 10, size=len(df))
    df['mouse_movement_erratic'] = np.random.uniform(0, 1, size=len(df))
    
    # Engagement score (simulated based on correctness)
    df['engagement_score'] = df['answered_correctly'] * 0.5 + np.random.uniform(0.3, 0.5, size=len(df))
    df['engagement_score'] = df['engagement_score'].clip(0, 1)
    
    # Label: HIGH cognitive load if answered incorrectly or took too long
    median_time = df['time_spent'].median()
    df['cognitive_load'] = (
        (df['answered_correctly'] == 0) | 
        (df['time_spent'] > median_time * 1.5)
    ).astype(int)
    
    # Select features
    features = [
        'engagement_score', 'scroll_speed', 'scroll_depth',
        'back_forth_scrolls', 'hover_duration_avg', 'time_spent',
        'mouse_movement_erratic', 'pause_duration'
    ]
    
    X = df[features]
    y = df['cognitive_load']
    
    # Handle missing values
    X = X.fillna(X.mean())
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    logger.info(f"Preprocessed {len(X)} samples")
    logger.info(f"Class distribution: {y.value_counts().to_dict()}")
    
    return X_scaled, y, scaler, features


def preprocess_memory_retention_data(dataset_path: str):
    """
    Preprocess EdNet-KT3 for memory retention prediction
    
    Creates features:
    - quiz_score: performance score (0-1)
    - quiz_type: 0=easy, 1=hard (simulated)
    - time_taken: seconds to complete
    - engagement_avg: average engagement
    - cognitive_load: 0=low, 1=high
    - video_watched: binary
    - video_pauses: count
    - audio_completed: binary
    - attempt_number: nth attempt
    
    Label:
    - days_to_forget: days until retention drops (3-14)
    """
    logger.info(f"Loading data from {dataset_path}")
    
    # Load EdNet-KT3 data (or create synthetic data if not available)
    try:
        df = pd.read_csv(f"{dataset_path}/KT3_interactions.csv")
    except FileNotFoundError:
        logger.warning("EdNet-KT3 not found. Generating synthetic data...")
        df = generate_synthetic_memory_data(1000)
    
    # Feature engineering
    logger.info("Engineering features...")
    
    df['quiz_score'] = df.get('answered_correctly', np.random.uniform(0.4, 1.0, size=len(df)))
    df['quiz_type'] = np.random.binomial(1, 0.5, size=len(df))  # 0=easy, 1=hard
    df['time_taken'] = np.random.uniform(60, 300, size=len(df))
    df['engagement_avg'] = np.random.uniform(0.3, 1.0, size=len(df))
    df['cognitive_load'] = np.random.binomial(1, 0.4, size=len(df))
    df['video_watched'] = np.random.binomial(1, 0.6, size=len(df))
    df['video_pauses'] = np.random.poisson(1, size=len(df))
    df['audio_completed'] = np.random.binomial(1, 0.7, size=len(df))
    df['attempt_number'] = np.random.poisson(1, size=len(df)) + 1
    
    # Label: Apply Ebbinghaus forgetting curve
    # Higher score, harder quiz, more engagement → longer retention
    retention_factor = (
        df['quiz_score'] * 5 +
        df['quiz_type'] * 2 +
        df['engagement_avg'] * 3 +
        (1 - df['cognitive_load']) * 2 +
        df['video_watched'] * 1 +
        df['audio_completed'] * 1
    )
    
    df['days_to_forget'] = (retention_factor + np.random.normal(0, 1, size=len(df))).clip(3, 14)
    df['days_to_forget'] = df['days_to_forget'].round().astype(int)
    
    features = [
        'quiz_score', 'quiz_type', 'time_taken', 'engagement_avg',
        'cognitive_load', 'video_watched', 'video_pauses',
        'audio_completed', 'attempt_number'
    ]
    
    X = df[features]
    y = df['days_to_forget']
    
    X = X.fillna(X.mean())
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    logger.info(f"Preprocessed {len(X)} samples")
    logger.info(f"Days distribution: {y.value_counts().sort_index().to_dict()}")
    
    return X_scaled, y, scaler, features


def generate_synthetic_memory_data(n_samples: int):
    """
    Generate synthetic data for memory retention if EdNet-KT3 is unavailable
    """
    np.random.seed(42)
    
    data = {
        'quiz_score': np.random.uniform(0.4, 1.0, n_samples),
        'quiz_type': np.random.binomial(1, 0.5, n_samples),
        'time_taken': np.random.uniform(60, 300, n_samples),
        'engagement_avg': np.random.uniform(0.3, 1.0, n_samples),
        'cognitive_load': np.random.binomial(1, 0.4, n_samples),
        'video_watched': np.random.binomial(1, 0.6, n_samples),
        'video_pauses': np.random.poisson(1, n_samples),
        'audio_completed': np.random.binomial(1, 0.7, n_samples),
        'attempt_number': np.random.poisson(1, n_samples) + 1
    }
    
    return pd.DataFrame(data)