"""
Memory Retention Preprocessing using ASSISTments Dataset
Adapted from MindWeave approach with real quiz correctness
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

np.random.seed(42)


def preprocess_assistments_memory_retention(dataset_path: str):
    """
    Preprocess ASSISTments dataset for memory retention prediction
    
    Uses MindWeave's Ebbinghaus-based approach with REAL quiz correctness
    
    Features:
    - correct: REAL 0/1 answer correctness (not inferred!)
    - hint_count: Number of hints used
    - attempt_count: Number of attempts
    - time_taken: Response time in milliseconds
    - student_accuracy_rate: Historical performance
    - skill_difficulty: Difficulty of the skill/topic
    
    Label:
    - days_to_forget: Calculated using Ebbinghaus forgetting curve
    """
    logger.info("="*80)
    logger.info("ASSISTments Memory Retention Model")
    logger.info("="*80)
    
    # Load ASSISTments dataset
    logger.info(f"Loading ASSISTments data from {dataset_path}")
    try:
        df = pd.read_csv(dataset_path, encoding='latin-1', low_memory=False)
        logger.info(f"✓ Loaded {len(df):,} rows")
    except Exception as e:
        logger.error(f"Failed to load dataset: {e}")
        raise
    
    # Column mapping (flexible for different ASSISTments versions)
    column_mapping = {
        'correct': ['correct', 'Correct', 'correct_first_attempt'],
        'hint_count': ['hint_count', 'Hint Count', 'hints', 'hint_total'],
        'attempt_count': ['attempt_count', 'Attempt Count', 'attempts'],
        'time_taken': ['ms_first_response', 'time_taken', 'Time Taken(ms)', 'first_response_time'],
        'skill_id': ['skill_id', 'Skill ID', 'skill', 'skill_name'],
        'user_id': ['user_id', 'Anon Student Id', 'student_id', 'user'],
        'problem_id': ['problem_id', 'Problem ID', 'problem_name'],
    }
    
    # Map columns
    logger.info("Mapping columns...")
    df_clean = pd.DataFrame()
    
    for feature, possible_names in column_mapping.items():
        for col_name in possible_names:
            if col_name in df.columns:
                df_clean[feature] = df[col_name]
                logger.info(f"  ✓ Found '{feature}' as '{col_name}'")
                break
    
    # Fill missing values
    df_clean['hint_count'] = df_clean.get('hint_count', 0).fillna(0)
    df_clean['attempt_count'] = df_clean.get('attempt_count', 1).fillna(1)
    df_clean['time_taken'] = df_clean.get('time_taken', 10000).fillna(10000)
    
    # Drop rows with missing critical data
    df_clean = df_clean.dropna(subset=['correct', 'user_id'])
    logger.info(f"After cleaning: {len(df_clean):,} rows")
    
    # Sample for faster training (optional - remove if you want full dataset)
    if len(df_clean) > 100000:
        logger.info(f"Sampling 100,000 rows for training...")
        df_clean = df_clean.sample(n=100000, random_state=42)
    
    # ===================================================================
    # FEATURE ENGINEERING
    # ===================================================================
    logger.info("\n" + "="*80)
    logger.info("FEATURE ENGINEERING")
    logger.info("="*80)
    
    features_df = pd.DataFrame()
    
    # Feature 1: Quiz Score (REAL correctness!)
    features_df['quiz_score'] = df_clean['correct'].astype(float)
    logger.info(f"✓ quiz_score: {features_df['quiz_score'].mean():.2%} avg correctness")
    
    # Feature 2: Hint Count (normalized)
    features_df['hint_count'] = df_clean['hint_count'].astype(int)
    max_hints = features_df['hint_count'].max()
    features_df['hint_usage'] = (features_df['hint_count'] / (max_hints + 1)).clip(0, 1)
    
    # Feature 3: Attempt Count
    features_df['attempt_count'] = df_clean['attempt_count'].astype(int).clip(1, 10)
    features_df['struggle_rate'] = (features_df['attempt_count'] - 1) / 9  # 0-1 scale
    
    # Feature 4: Time Taken (normalized to seconds)
    features_df['time_taken'] = (df_clean['time_taken'].astype(float) / 1000).clip(1, 300)  # 1-300 seconds
    
    # Feature 5: Student Accuracy Rate (historical performance)
    logger.info("Computing student accuracy rates...")
    student_accuracy = df_clean.groupby('user_id')['correct'].mean()
    features_df['student_accuracy_rate'] = df_clean['user_id'].map(student_accuracy).fillna(0.5)
    logger.info(f"✓ student_accuracy_rate: {features_df['student_accuracy_rate'].mean():.2%}")
    
    # Feature 6: Skill Difficulty (based on average correctness per skill)
    logger.info("Computing skill difficulty...")
    skill_correctness = df_clean.groupby('skill_id')['correct'].mean()
    skill_difficulty = 1 - skill_correctness  # Easy skills = low difficulty
    features_df['skill_difficulty'] = df_clean['skill_id'].map(skill_difficulty).fillna(0.5)
    
    # Feature 7: Time Efficiency (normalized time relative to correctness)
    features_df['time_efficiency'] = features_df['quiz_score'] / (features_df['time_taken'] / 30 + 1)
    features_df['time_efficiency'] = features_df['time_efficiency'].clip(0, 1)
    
    # ===================================================================
    # LABEL GENERATION: Days to Forget (Ebbinghaus-based)
    # BALANCED approach - not just quiz_score!
    # ===================================================================
    logger.info("\n" + "="*80)
    logger.info("LABEL GENERATION (Balanced Ebbinghaus Curve)")
    logger.info("="*80)
    
    # Calculate BASE retention time from quiz performance
    base_days = np.zeros(len(features_df))
    
    # Category 1: Strong Memory (correct, no hints, fast)
    mask_strong = (
        (features_df['quiz_score'] == 1) & 
        (features_df['hint_count'] == 0) & 
        (features_df['time_taken'] < 30)
    )
    base_days[mask_strong] = np.random.uniform(9, 11, size=mask_strong.sum())
    logger.info(f"  Strong memory: {mask_strong.sum():,} samples → 9-11 days (base)")
    
    # Category 2: Good Memory (correct with minimal help)
    mask_good = (
        (features_df['quiz_score'] == 1) & 
        ((features_df['hint_count'] > 0) | (features_df['time_taken'] >= 30))
    )
    base_days[mask_good] = np.random.uniform(6, 8, size=mask_good.sum())
    logger.info(f"  Good memory: {mask_good.sum():,} samples → 6-8 days (base)")
    
    # Category 3: Weak Memory (incorrect with few hints)
    mask_weak = (
        (features_df['quiz_score'] == 0) & 
        (features_df['hint_count'] <= 2)
    )
    base_days[mask_weak] = np.random.uniform(4, 6, size=mask_weak.sum())
    logger.info(f"  Weak memory: {mask_weak.sum():,} samples → 4-6 days (base)")
    
    # Category 4: Very Weak (incorrect with many hints)
    mask_very_weak = (
        (features_df['quiz_score'] == 0) & 
        (features_df['hint_count'] > 2)
    )
    base_days[mask_very_weak] = np.random.uniform(2, 4, size=mask_very_weak.sum())
    logger.info(f"  Very weak memory: {mask_very_weak.sum():,} samples → 2-4 days (base)")
    
    # NOW ADD STRONG ADJUSTMENTS FROM OTHER FEATURES
    logger.info("\nApplying feature adjustments...")
    
    # 1. Student History (STRONG influence: ±4 days)
    accuracy_adjustment = (features_df['student_accuracy_rate'] - 0.5) * 8  # -4 to +4 days
    base_days = base_days + accuracy_adjustment
    logger.info(f"  • Student accuracy: ±4 days max")
    
    # 2. Skill Difficulty (MODERATE influence: +3 days)
    # Harder skills = better encoding (desirable difficulty)
    difficulty_bonus = features_df['skill_difficulty'] * 3  # 0 to +3 days
    base_days = base_days + difficulty_bonus
    logger.info(f"  • Skill difficulty: 0 to +3 days")
    
    # 3. Time Efficiency (STRONG influence: ±3 days)
    # Efficient learning = better retention
    efficiency_adjustment = (features_df['time_efficiency'] - 0.5) * 6  # -3 to +3 days
    base_days = base_days + efficiency_adjustment
    logger.info(f"  • Time efficiency: ±3 days")
    
    # 4. Hint Usage (STRONG penalty: -5 days)
    # More hints = weaker understanding
    hint_penalty = features_df['hint_usage'] * 5  # 0 to -5 days
    base_days = base_days - hint_penalty
    logger.info(f"  • Hint usage penalty: 0 to -5 days")
    
    # 5. Struggle Rate (MODERATE penalty: -3 days)
    # Multiple attempts = weaker memory
    struggle_penalty = features_df['struggle_rate'] * 3  # 0 to -3 days
    base_days = base_days - struggle_penalty
    logger.info(f"  • Struggle penalty: 0 to -3 days")
    
    # 6. Time Taken (SMALL influence: ±1 day)
    # Optimal time around 30s
    time_factor = np.abs(features_df['time_taken'] - 30) / 150  # 0-1 scale
    time_adjustment = (0.5 - time_factor) * 2  # -1 to +1 days
    base_days = base_days + time_adjustment
    logger.info(f"  • Time adjustment: ±1 day")
    
    # Ensure within reasonable range
    days = np.clip(base_days, 3, 14).round().astype(int)
    
    features_df['days_to_forget'] = days
    
    logger.info(f"\nFinal range after all adjustments: {days.min()}-{days.max()} days")
    
    # ===================================================================
    # FINAL FEATURE SELECTION
    # ===================================================================
    feature_columns = [
        'quiz_score',              # Most important!
        'student_accuracy_rate',   # Historical performance
        'skill_difficulty',        # Topic difficulty
        'hint_usage',              # Help needed
        'struggle_rate',           # Multiple attempts
        'time_taken',              # Response speed
        'time_efficiency'          # Quality of learning
    ]
    
    X = features_df[feature_columns]
    y = features_df['days_to_forget']
    
    # Handle any remaining missing values
    X = X.fillna(X.mean())
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # ===================================================================
    # STATISTICS
    # ===================================================================
    logger.info("\n" + "="*80)
    logger.info("FEATURE STATISTICS")
    logger.info("="*80)
    
    for feature in feature_columns:
        mean_val = features_df[feature].mean()
        std_val = features_df[feature].std()
        min_val = features_df[feature].min()
        max_val = features_df[feature].max()
        logger.info(f"{feature:30s}: mean={mean_val:.3f}, std={std_val:.3f}, range=[{min_val:.1f}, {max_val:.1f}]")
    
    logger.info("\n" + "="*80)
    logger.info("LABEL DISTRIBUTION (Days to Forget)")
    logger.info("="*80)
    
    for days_val in sorted(y.unique()):
        count = (y == days_val).sum()
        pct = count / len(y) * 100
        bar = "█" * int(pct / 2)
        logger.info(f"  {days_val:2d} days: {count:6d} samples ({pct:5.1f}%) {bar}")
    
    logger.info(f"\nMean: {y.mean():.1f} days")
    logger.info(f"Median: {y.median():.1f} days")
    logger.info(f"Std: {y.std():.1f} days")
    
    # Correlation analysis
    logger.info("\n" + "="*80)
    logger.info("CORRELATION WITH DAYS_TO_FORGET")
    logger.info("="*80)
    
    for feature in feature_columns:
        corr = features_df[[feature, 'days_to_forget']].corr().iloc[0, 1]
        direction = "↑ Positive (good!)" if corr > 0.1 else "↓ Negative (expected)" if corr < -0.1 else "~ Neutral"
        logger.info(f"  {feature:30s}: {corr:+.3f} {direction}")
    
    logger.info("\n" + "="*80)
    logger.info(f"✓ Preprocessed {len(X)} samples using ASSISTments dataset")
    logger.info("="*80)
    
    return X_scaled, y, scaler, feature_columns


if __name__ == "__main__":
    print("\n" + "="*80)
    print("Testing ASSISTments Memory Retention preprocessing")
    print("="*80)
    
    # Try common paths
    possible_paths = [
        "../../data/assistments/skill_builder_data.csv",
        "../data/assistments/skill_builder_data.csv",
        "data/assistments/skill_builder_data.csv",
        "../../data/raw/skill_builder_data.csv",
        "../data/raw/skill_builder_data.csv",
    ]
    
    dataset_path = None
    for path in possible_paths:
        if os.path.exists(path):
            dataset_path = path
            break
    
    if dataset_path is None:
        print("\n✗ Dataset not found! Please provide path to skill_builder_data.csv")
        print("\nTried:")
        for path in possible_paths:
            print(f"  - {path}")
    else:
        try:
            X, y, scaler, features = preprocess_assistments_memory_retention(dataset_path)
            print(f"\n✓ Preprocessing successful!")
            print(f"  Shape: {X.shape}")
            print(f"  Features ({len(features)}): {features}")
            print(f"  Label range: {y.min():.0f}-{y.max():.0f} days")
            print(f"  Label mean: {y.mean():.1f} days")
        except Exception as e:
            print(f"\n✗ Preprocessing failed:")
            print(f"  Error: {e}")
            import traceback
            traceback.print_exc()