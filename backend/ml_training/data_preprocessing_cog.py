"""
CORRECTED Data preprocessing for EdNet datasets
Handles per-user CSV files (u1.csv, u2.csv, u3.csv, ...)
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import logging
import os
import glob

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_ednet_user_files(dataset_path: str, max_users: int = 100):
    """
    Load EdNet data from multiple user CSV files
    
    Args:
        dataset_path: Path to KT1 or KT3 directory
        max_users: Maximum number of user files to load (to control memory)
    
    Returns:
        Combined DataFrame with all user interactions
    """
    logger.info(f"Loading EdNet data from {dataset_path}")
    
    # Find all user CSV files
    user_files = sorted(glob.glob(os.path.join(dataset_path, "u*.csv")))
    
    if not user_files:
        raise FileNotFoundError(f"No user CSV files (u*.csv) found in {dataset_path}")
    
    logger.info(f"Found {len(user_files)} user files")
    logger.info(f"Loading first {max_users} users for training...")
    
    # Load and combine user files
    dfs = []
    for i, filepath in enumerate(user_files[:max_users]):
        try:
            df = pd.read_csv(filepath)
            # Add user_id from filename
            user_id = os.path.basename(filepath).replace('.csv', '')
            df['user_id'] = user_id
            dfs.append(df)
            
            if (i + 1) % 20 == 0:
                logger.info(f"Loaded {i + 1}/{max_users} users...")
        except Exception as e:
            logger.warning(f"Failed to load {filepath}: {e}")
            continue
    
    if not dfs:
        raise ValueError("No data loaded successfully")
    
    combined_df = pd.concat(dfs, ignore_index=True)
    logger.info(f"Combined dataset: {len(combined_df)} interactions from {len(dfs)} users")
    
    return combined_df


def preprocess_cognitive_load_data(dataset_path: str):
    """
    Preprocess EdNet-KT1 for cognitive load prediction
    
    EdNet KT1 format:
    - timestamp: Unix timestamp
    - solving_id: Problem solving session ID
    - question_id: Question identifier
    - user_answer: User's answer (a, b, c, d)
    - elapsed_time: Time spent (milliseconds)
    
    Features we create:
    - engagement_score: Based on consistency and time patterns
    - scroll_speed: Simulated (EdNet doesn't track)
    - scroll_depth: Simulated
    - back_forth_scrolls: Simulated
    - hover_duration_avg: Simulated
    - time_spent: Actual from elapsed_time
    - mouse_movement_erratic: Simulated
    - pause_duration: Derived from time patterns
    
    Label:
    - cognitive_load: HIGH (1) if long time or multiple attempts, LOW (0) otherwise
    """
    
    # Load data from multiple user files
    df = load_ednet_user_files(dataset_path, max_users=100)  # Adjust max_users as needed
    
    logger.info("Columns in dataset:")
    logger.info(df.columns.tolist())
    logger.info(f"First few rows:\n{df.head()}")
    
    # Feature engineering
    logger.info("Engineering features...")
    
    # Time-based features
    df['time_spent'] = df['elapsed_time'] / 1000  # Convert milliseconds to seconds
    
    # Calculate pause patterns (time between questions for same user)
    df = df.sort_values(['user_id', 'timestamp'])
    df['time_diff'] = df.groupby('user_id')['timestamp'].diff() / 1000  # seconds
    df['pause_duration'] = df['time_diff'].fillna(0).clip(0, 300)  # Cap at 5 minutes
    
    # Calculate if user is struggling (proxy: very long time on questions)
    time_median = df['time_spent'].median()
    df['is_slow'] = (df['time_spent'] > time_median * 2).astype(int)
    
    # Count attempts per question (repeated solving_id for same user)
    df['attempt_count'] = df.groupby(['user_id', 'question_id']).cumcount() + 1
    df['multiple_attempts'] = (df['attempt_count'] > 1).astype(int)
    
    # Simulated interaction features (EdNet doesn't track these)
    np.random.seed(42)
    n = len(df)
    df['scroll_speed'] = np.random.uniform(50, 300, n)
    df['scroll_depth'] = np.random.uniform(0.2, 1.0, n)
    df['back_forth_scrolls'] = np.random.poisson(2, n)
    df['hover_duration_avg'] = np.random.uniform(1, 10, n)
    df['mouse_movement_erratic'] = np.random.uniform(0, 1, n)
    
    # Engagement score: Based on time consistency and patterns
    # Lower when very slow or very fast (not engaged)
    df['time_ratio'] = df['time_spent'] / (time_median + 1)
    df['engagement_score'] = 1.0 / (1.0 + np.abs(df['time_ratio'] - 1.0))
    df['engagement_score'] = df['engagement_score'].clip(0.2, 1.0)
    
    # Label: HIGH cognitive load if:
    # 1. Time spent is very high (> 75th percentile)
    # 2. Multiple attempts on same question
    # 3. Long pauses before starting
    time_75 = df['time_spent'].quantile(0.75)
    df['cognitive_load'] = (
        (df['time_spent'] > time_75) |
        (df['multiple_attempts'] == 1) |
        (df['pause_duration'] > 60)
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
    logger.info(f"  LOW cognitive load (0): {(y == 0).sum()} samples")
    logger.info(f"  HIGH cognitive load (1): {(y == 1).sum()} samples")
    
    return X_scaled, y, scaler, features


def preprocess_memory_retention_data(dataset_path: str = None):
    """
    Preprocess data for memory retention prediction
    
    Since EdNet doesn't track long-term retention (days until forgetting),
    we generate synthetic data based on learning science principles.
    
    Features:
    - quiz_score: performance score (0-1)
    - quiz_type: 0=easy, 1=hard
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
    logger.info("Generating synthetic memory retention data...")
    logger.info("(EdNet doesn't track long-term retention, so we use learning science models)")
    
    # Try to load EdNet data if available (to get realistic time patterns)
    base_data = None
    if dataset_path and os.path.exists(dataset_path):
        try:
            logger.info("Loading EdNet KT3 to derive realistic patterns...")
            df = load_ednet_user_files(dataset_path, max_users=50)
            
            # Extract useful patterns
            time_mean = df['elapsed_time'].mean() / 1000
            time_std = df['elapsed_time'].std() / 1000
            
            base_data = {
                'time_mean': time_mean,
                'time_std': time_std
            }
            logger.info(f"Using EdNet patterns: mean_time={time_mean:.1f}s, std={time_std:.1f}s")
        except Exception as e:
            logger.warning(f"Could not load KT3 data: {e}")
            logger.info("Using default synthetic patterns instead")
    
    # Generate synthetic data
    n_samples = 5000
    logger.info(f"Generating {n_samples} synthetic samples based on Ebbinghaus forgetting curve...")
    
    np.random.seed(42)
    
    # Generate features with realistic distributions
    data = {
        'quiz_score': np.random.beta(5, 2, n_samples),  # Skewed towards higher scores
        'quiz_type': np.random.binomial(1, 0.5, n_samples),  # 50% easy, 50% hard
        'engagement_avg': np.random.beta(4, 2, n_samples),  # Skewed towards engaged
        'cognitive_load': np.random.binomial(1, 0.4, n_samples),  # 40% high CL
        'video_watched': np.random.binomial(1, 0.6, n_samples),  # 60% watch video
        'video_pauses': np.random.poisson(1, n_samples),  # Average 1 pause
        'audio_completed': np.random.binomial(1, 0.7, n_samples),  # 70% complete audio
        'attempt_number': np.random.poisson(1, n_samples) + 1  # 1-5 attempts typically
    }
    
    # Time taken: Use EdNet patterns if available, otherwise use gamma distribution
    if base_data:
        data['time_taken'] = np.random.normal(
            base_data['time_mean'], 
            base_data['time_std'], 
            n_samples
        ).clip(30, 600)  # 30s to 10min
    else:
        data['time_taken'] = np.random.gamma(2, 30, n_samples).clip(30, 600)
    
    df = pd.DataFrame(data)
    
    # Generate retention labels based on Ebbinghaus forgetting curve
    # Formula: R(t) = e^(-t/S) where S is memory strength
    # We want to predict when R(t) drops below 0.5 (50% retention)
    
    # Calculate memory strength based on learning factors
    memory_strength = (
        df['quiz_score'] * 5.0 +           # Good performance = stronger memory
        df['quiz_type'] * 2.0 +            # Hard quiz = better retention
        df['engagement_avg'] * 3.0 +       # High engagement = better encoding
        (1 - df['cognitive_load']) * 2.0 + # Low CL = better learning
        df['video_watched'] * 1.0 +        # Multimedia helps
        df['audio_completed'] * 1.0 -      # Multiple modalities
        df['video_pauses'] * 0.5 -         # Pauses indicate difficulty
        np.log(df['time_taken'] / 60) * 0.5  # Optimal time (not too fast/slow)
    )
    
    # Add noise and convert to days
    df['days_to_forget'] = (memory_strength + np.random.normal(0, 1.5, n_samples)).clip(3, 14)
    df['days_to_forget'] = df['days_to_forget'].round().astype(int)
    
    features = [
        'quiz_score', 'quiz_type', 'time_taken', 'engagement_avg',
        'cognitive_load', 'video_watched', 'video_pauses',
        'audio_completed', 'attempt_number'
    ]
    
    X = df[features]
    y = df['days_to_forget']
    
    # Normalize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    logger.info(f"Preprocessed {len(X)} samples")
    logger.info(f"Days distribution:")
    for days in sorted(y.unique()):
        count = (y == days).sum()
        logger.info(f"  {days} days: {count} samples")
    
    return X_scaled, y, scaler, features


if __name__ == "__main__":
    # Test preprocessing
    print("\n" + "="*70)
    print("Testing Cognitive Load preprocessing...")
    print("="*70)
    try:
        X, y, scaler, features = preprocess_cognitive_load_data("../../data/ednet/KT1")
        print(f"✓ Cognitive Load preprocessing successful!")
        print(f"  Shape: {X.shape}")
        print(f"  Features ({len(features)}): {features}")
        print(f"  Class balance: LOW={np.sum(y==0)}, HIGH={np.sum(y==1)}")
    except Exception as e:
        print(f"✗ Cognitive Load preprocessing failed:")
        print(f"  Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*70)
    print("Testing Memory Retention preprocessing...")
    print("="*70)
    try:
        X, y, scaler, features = preprocess_memory_retention_data("../../data/ednet/KT3")
        print(f"✓ Memory Retention preprocessing successful!")
        print(f"  Shape: {X.shape}")
        print(f"  Features ({len(features)}): {features}")
        print(f"  Days range: {y.min()}-{y.max()}")
    except Exception as e:
        print(f"✗ Memory Retention preprocessing failed:")
        print(f"  Error: {e}")
        import traceback
        traceback.print_exc()