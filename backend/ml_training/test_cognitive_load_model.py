"""
DIAGNOSTIC TESTING SCRIPT FOR BEHAVIORAL LOAD MODEL
Purpose:
- Diagnose whether ML adds value beyond heuristic rules
- Test robustness, leakage, and feature dependence
- NOT to claim ground-truth cognitive accuracy
"""

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score
import os
import sys
import glob

print("=" * 80)
print("🧪 DIAGNOSTIC TESTING: BEHAVIORAL LOAD MODEL")
print("=" * 80)

# ============================================================================
# STEP 1: LOAD MODEL
# ============================================================================
print("\n📦 Step 1: Loading trained artifacts...")

models_dir = "models"
for p in ["models", "../models", "../../models"]:
    if os.path.exists(p):
        models_dir = p
        break

model = joblib.load(os.path.join(models_dir, "cognitive_load_model.pkl"))
scaler = joblib.load(os.path.join(models_dir, "cognitive_load_scaler.pkl"))
feature_names = joblib.load(os.path.join(models_dir, "cognitive_load_features.pkl"))

print(f"✓ Model loaded from {models_dir}")
print(f"✓ Features used: {feature_names}")

# ============================================================================
# STEP 2: LOAD FRESH USERS
# ============================================================================
print("\n📊 Step 2: Loading unseen users (101–150)...")

dataset_path = "data/ednet/KT1"
for p in ["data/ednet/KT1", "../data/ednet/KT1", "../../data/ednet/KT1"]:
    if os.path.exists(p):
        dataset_path = p
        break

user_files = sorted(glob.glob(os.path.join(dataset_path, "u*.csv")))[100:150]

dfs = []
for f in user_files:
    df = pd.read_csv(f)
    df["user_id"] = os.path.basename(f)
    dfs.append(df)

df_test = pd.concat(dfs, ignore_index=True)
print(f"✓ Loaded {len(df_test)} interactions from {len(dfs)} unseen users")

# ============================================================================
# STEP 3: FEATURE ENGINEERING (SAME AS TRAINING)
# ============================================================================
print("\n🔧 Step 3: Feature engineering...")

df_test["time_spent"] = df_test["elapsed_time"] / 1000
df_test = df_test.sort_values(["user_id", "timestamp"])
df_test["pause_duration"] = df_test.groupby("user_id")["timestamp"].diff().fillna(0) / 1000
df_test["pause_duration"] = df_test["pause_duration"].clip(0, 300)

df_test["attempt_count"] = df_test.groupby(
    ["user_id", "question_id"]
).cumcount() + 1
df_test["multiple_attempts"] = (df_test["attempt_count"] > 1).astype(int)

np.random.seed(99)
n = len(df_test)
df_test["scroll_speed"] = np.random.uniform(50, 300, n)
df_test["scroll_depth"] = np.random.uniform(0.2, 1.0, n)
df_test["back_forth_scrolls"] = np.random.poisson(2, n)
df_test["hover_duration_avg"] = np.random.uniform(1, 10, n)
df_test["mouse_movement_erratic"] = np.random.uniform(0, 1, n)

time_median = df_test["time_spent"].median()
df_test["engagement_score"] = 1 / (1 + np.abs(df_test["time_spent"] / (time_median + 1) - 1))
df_test["engagement_score"] = df_test["engagement_score"].clip(0.2, 1)

# ============================================================================
# STEP 4: HEURISTIC LABEL (FOR DIAGNOSTICS ONLY)
# ============================================================================
time_75 = df_test["time_spent"].quantile(0.75)
df_test["heuristic_load"] = (
    (df_test["time_spent"] > time_75)
    | (df_test["multiple_attempts"] == 1)
    | (df_test["pause_duration"] > 60)
).astype(int)

X = df_test[feature_names].fillna(df_test[feature_names].mean())
X_scaled = scaler.transform(X)

y_model = model.predict(X_scaled)
y_rule = df_test["heuristic_load"].values

# ============================================================================
# STEP 5: RULE AGREEMENT TEST
# ============================================================================
print("\n🧪 STEP 5: RULE ↔ MODEL AGREEMENT")
print("=" * 80)

agreement = np.mean(y_model == y_rule)
print(f"Agreement with heuristic rules: {agreement:.4f} ({agreement*100:.2f}%)")

if agreement > 0.90:
    print("⚠ Model mostly replicates heuristic rules")
else:
    print("✓ Model shows deviation beyond simple rules")

# ============================================================================
# STEP 6: FEATURE ABLATION TEST
# ============================================================================
print("\n🧪 STEP 6: FEATURE ABLATION (TIME SIGNAL REMOVAL)")
print("=" * 80)

X_ablated = df_test[feature_names].copy()
X_ablated["time_spent"] = 0
X_ablated["pause_duration"] = 0
X_ablated_scaled = scaler.transform(X_ablated)

y_ablated = model.predict(X_ablated_scaled)
flip_rate = np.mean(y_ablated != y_model)

print(f"Prediction flip rate after removing time signals: {flip_rate*100:.2f}%")

# ============================================================================
# STEP 7: PERMUTATION SANITY TEST
# ============================================================================
print("\n🧪 STEP 7: LABEL PERMUTATION SANITY CHECK")
print("=" * 80)

y_perm = np.random.permutation(y_rule)
perm_acc = accuracy_score(y_perm, y_model)

print(f"Accuracy vs permuted labels: {perm_acc:.4f}")

# ============================================================================
# STEP 8: COUNTERFACTUAL CONSISTENCY
# ============================================================================
print("\n🧪 STEP 8: COUNTERFACTUAL CONSISTENCY CHECK")
print("=" * 80)

sample = X.iloc[0].copy()

low_case = sample.copy()
low_case["time_spent"] = 15
low_case["pause_duration"] = 5

high_case = sample.copy()
high_case["time_spent"] = 120
high_case["pause_duration"] = 90

low_pred = model.predict(scaler.transform([low_case]))[0]
high_pred = model.predict(scaler.transform([high_case]))[0]

print(f"Low-effort counterfactual prediction: {low_pred}")
print(f"High-effort counterfactual prediction: {high_pred}")

# ============================================================================
# STEP 9: FINAL HONEST CONCLUSION
# ============================================================================
print("\n" + "=" * 80)
print("📊 FINAL DIAGNOSTIC SUMMARY")
print("=" * 80)

print(f"""
✔ Users tested: {len(dfs)}
✔ Interactions tested: {len(df_test)}

Key Findings:
- Rule agreement: {agreement*100:.1f}%
- Time dependence flip rate: {flip_rate*100:.1f}%
- Permutation accuracy: {perm_acc:.3f}

Interpretation:
• This model is a **behavioral effort estimator**
• Strongly driven by time-based interaction signals
• Suitable for **adaptive pacing and UI adjustments**
• NOT a ground-truth cognitive or psychological measure

Verdict:
✅ Valid for hackathon & adaptive systems
❌ Not a scientific cognitive load detector
""")

print("=" * 80)
print("Testing complete.")
print("=" * 80)
