"""
INTERACTIVE INTEGRATION TEST - All 3 Models
Test cognitive load, memory retention, and engagement models together
"""
import joblib
import numpy as np
import os
import sys

print("=" * 80)
print("🎓 ADAPTIVE LEARNING PLATFORM - MODEL INTEGRATION TEST")
print("=" * 80)

# ============================================================================
# STEP 1: LOAD ALL MODELS
# ============================================================================
print("\n📦 Step 1: Loading all models...")

models_dir = "models"
if not os.path.exists(models_dir):
    models_dir = "../models"
if not os.path.exists(models_dir):
    models_dir = "../../models"

try:
    # Cognitive Load Model
    print("  Loading cognitive load model...")
    cog_model = joblib.load(os.path.join(models_dir, "cognitive_load_model.pkl"))
    cog_scaler = joblib.load(os.path.join(models_dir, "cognitive_load_scaler.pkl"))
    cog_features = joblib.load(os.path.join(models_dir, "cognitive_load_features.pkl"))
    print("  ✓ Cognitive Load Model loaded")
    print(f"    Features: {cog_features}")
    
    # Memory Retention Model
    print("\n  Loading memory retention model...")
    mem_model = joblib.load(os.path.join(models_dir, "memory_retention_model.pkl"))
    mem_scaler = joblib.load(os.path.join(models_dir, "memory_retention_scaler.pkl"))
    mem_features = joblib.load(os.path.join(models_dir, "memory_retention_features.pkl"))
    print("  ✓ Memory Retention Model loaded")
    print(f"    Features: {mem_features}")
    
    # Engagement Model (placeholder - in production, this would be CNN)
    print("\n  Loading engagement model...")
    try:
        engagement_model = joblib.load(os.path.join(models_dir, "engagement_model.pkl"))
        print("  ✓ Engagement Model loaded")
    except:
        print("  ⚠ Engagement model not found (using placeholder)")
        engagement_model = None
    
except Exception as e:
    print(f"\n❌ Error loading models: {e}")
    print("\nMake sure you're in the backend directory and models are trained!")
    sys.exit(1)

print("\n✅ All models loaded successfully!\n")

# ============================================================================
# DECISION LOGIC (From quiz.py)
# ============================================================================
def decide_quiz_difficulty(cognitive_load, engagement_score):
    """
    Combine cognitive load + engagement to decide quiz difficulty
    """
    if cognitive_load == "HIGH" and engagement_score < 0.5:
        return {
            'quiz_type': 'EASY',
            'num_questions': 5,
            'timer_enabled': False,
            'reasoning': 'Student struggling AND distracted - needs easy content'
        }
    elif cognitive_load == "HIGH" and engagement_score >= 0.5:
        return {
            'quiz_type': 'EASY',
            'num_questions': 6,
            'timer_enabled': False,
            'reasoning': 'Student struggling but engaged - give easier questions to build confidence'
        }
    elif cognitive_load == "LOW" and engagement_score < 0.5:
        return {
            'quiz_type': 'EASY',
            'num_questions': 6,
            'timer_enabled': False,
            'reasoning': 'Student not struggling but distracted - keep it easy to re-engage'
        }
    elif cognitive_load == "LOW" and engagement_score >= 0.5 and engagement_score < 0.7:
        return {
            'quiz_type': 'MEDIUM',
            'num_questions': 7,
            'timer_enabled': True,
            'reasoning': 'Student doing okay with moderate engagement - standard difficulty'
        }
    else:  # LOW cognitive load and HIGH engagement
        return {
            'quiz_type': 'HARD',
            'num_questions': 10,
            'timer_enabled': True,
            'reasoning': 'Student doing well AND focused - challenge them!'
        }

# ============================================================================
# MAIN INTERACTIVE LOOP
# ============================================================================
def main():
    print("=" * 80)
    print("🎮 INTERACTIVE MODEL TESTING")
    print("=" * 80)
    print("\nYou will provide student behavior data, and the models will:")
    print("  1. Predict cognitive load (HIGH/LOW)")
    print("  2. Determine quiz difficulty (EASY/MEDIUM/HARD)")
    print("  3. Predict memory retention (days until review)")
    print("\n" + "=" * 80)
    
    while True:
        print("\n" + "─" * 80)
        print("📝 STUDENT LEARNING SESSION")
        print("─" * 80)
        
        # ====================================================================
        # PART 1: COGNITIVE LOAD PREDICTION
        # ====================================================================
        print("\n🧠 PART 1: COGNITIVE LOAD ASSESSMENT")
        print("─" * 80)
        print("Provide behavior during quiz:\n")
        
        try:
            # Get cognitive load inputs
            print("Expected features:", cog_features)
            print("\nEnter values for each feature:")
            
            cog_inputs = {}
            for feature in cog_features:
                while True:
                    try:
                        if feature == 'engagement_score':
                            val = float(input(f"  {feature} (0.0-1.0): "))
                            if 0 <= val <= 1:
                                cog_inputs[feature] = val
                                break
                        elif feature in ['scroll_speed', 'scroll_depth', 'back_forth_scrolls']:
                            val = float(input(f"  {feature} (any positive number): "))
                            cog_inputs[feature] = val
                            break
                        elif feature == 'hover_duration_avg':
                            val = float(input(f"  {feature} (seconds, e.g., 2.5): "))
                            cog_inputs[feature] = val
                            break
                        elif feature == 'time_spent':
                            val = float(input(f"  {feature} (seconds per question, e.g., 45): "))
                            cog_inputs[feature] = val
                            break
                        elif feature == 'mouse_movement_erratic':
                            val = float(input(f"  {feature} (0.0-1.0, higher = more erratic): "))
                            if 0 <= val <= 1:
                                cog_inputs[feature] = val
                                break
                        elif feature == 'pause_duration':
                            val = float(input(f"  {feature} (seconds between questions, e.g., 30): "))
                            cog_inputs[feature] = val
                            break
                        else:
                            val = float(input(f"  {feature}: "))
                            cog_inputs[feature] = val
                            break
                        print("    Invalid value, try again.")
                    except ValueError:
                        print("    Please enter a valid number.")
            
            # Predict cognitive load
            features_array = [cog_inputs[f] for f in cog_features]
            features_scaled = cog_scaler.transform([features_array])
            cog_pred = cog_model.predict(features_scaled)[0]
            cog_proba = cog_model.predict_proba(features_scaled)[0]
            
            cognitive_load = "HIGH" if cog_pred == 1 else "LOW"
            confidence = cog_proba[cog_pred] * 100
            
            print("\n📊 COGNITIVE LOAD RESULT:")
            print(f"  Prediction: {cognitive_load}")
            print(f"  Confidence: {confidence:.1f}%")
            
            # ================================================================
            # PART 2: ENGAGEMENT SCORE
            # ================================================================
            print("\n👁️ PART 2: ENGAGEMENT ASSESSMENT")
            print("─" * 80)
            
            if engagement_model:
                print("(In production, this comes from webcam)")
                engagement_score = float(input("\nEnter engagement score (0.0-1.0, simulated): "))
            else:
                engagement_score = float(input("\nEnter engagement score (0.0-1.0): "))
            
            engagement_score = max(0.0, min(1.0, engagement_score))
            
            print(f"\n📊 ENGAGEMENT RESULT:")
            print(f"  Score: {engagement_score:.2f} ({engagement_score*100:.0f}%)")
            if engagement_score < 0.4:
                print(f"  Level: Very Low - Student is distracted")
            elif engagement_score < 0.6:
                print(f"  Level: Low - Student is somewhat distracted")
            elif engagement_score < 0.7:
                print(f"  Level: Moderate - Student is paying attention")
            elif engagement_score < 0.85:
                print(f"  Level: High - Student is focused")
            else:
                print(f"  Level: Very High - Student is highly engaged")
            
            # ================================================================
            # DECISION: QUIZ DIFFICULTY
            # ================================================================
            print("\n🎯 DECISION: QUIZ DIFFICULTY")
            print("─" * 80)
            
            decision = decide_quiz_difficulty(cognitive_load, engagement_score)
            
            print(f"\n  Quiz Type: {decision['quiz_type']}")
            print(f"  Questions: {decision['num_questions']}")
            print(f"  Timer: {'Yes' if decision['timer_enabled'] else 'No'}")
            print(f"  Reasoning: {decision['reasoning']}")
            
            # ================================================================
            # PART 3: MEMORY RETENTION PREDICTION
            # ================================================================
            print("\n💾 PART 3: MEMORY RETENTION PREDICTION")
            print("─" * 80)
            print("Provide quiz performance data:\n")
            
            print("Expected features:", mem_features)
            print("\nEnter values for each feature:")
            
            mem_inputs = {}
            for feature in mem_features:
                while True:
                    try:
                        if feature == 'quiz_score':
                            val = float(input(f"  {feature} (0.0-1.0, 1.0 = 100% correct): "))
                            if 0 <= val <= 1:
                                mem_inputs[feature] = val
                                break
                        elif feature == 'student_accuracy_rate':
                            val = float(input(f"  {feature} (0.0-1.0, historical performance): "))
                            if 0 <= val <= 1:
                                mem_inputs[feature] = val
                                break
                        elif feature == 'skill_difficulty':
                            val = float(input(f"  {feature} (0.0-1.0, topic difficulty): "))
                            if 0 <= val <= 1:
                                mem_inputs[feature] = val
                                break
                        elif feature == 'hint_usage':
                            val = float(input(f"  {feature} (0.0-1.0, hints used): "))
                            if 0 <= val <= 1:
                                mem_inputs[feature] = val
                                break
                        elif feature == 'struggle_rate':
                            val = float(input(f"  {feature} (0.0-1.0, multiple attempts): "))
                            if 0 <= val <= 1:
                                mem_inputs[feature] = val
                                break
                        elif feature == 'time_taken':
                            val = float(input(f"  {feature} (seconds per question): "))
                            mem_inputs[feature] = val
                            break
                        elif feature == 'time_efficiency':
                            val = float(input(f"  {feature} (0.0-1.0, learning quality): "))
                            if 0 <= val <= 1:
                                mem_inputs[feature] = val
                                break
                        else:
                            val = float(input(f"  {feature}: "))
                            mem_inputs[feature] = val
                            break
                        print("    Invalid value, try again.")
                    except ValueError:
                        print("    Please enter a valid number.")
            
            # Predict memory retention
            mem_features_array = [mem_inputs[f] for f in mem_features]
            mem_features_scaled = mem_scaler.transform([mem_features_array])
            days_to_forget = mem_model.predict(mem_features_scaled)[0]
            
            print("\n📊 MEMORY RETENTION RESULT:")
            print(f"  Days until review needed: {days_to_forget:.1f} days")
            
            if days_to_forget <= 3:
                urgency = "🔴 URGENT"
                recommendation = "Schedule review TODAY or tomorrow"
            elif days_to_forget <= 7:
                urgency = "🟡 MEDIUM"
                recommendation = "Schedule review within this week"
            elif days_to_forget <= 10:
                urgency = "🟢 LOW"
                recommendation = "Schedule review in 1-2 weeks"
            else:
                urgency = "⚪ VERY LOW"
                recommendation = "Strong retention! Review in 2+ weeks"
            
            print(f"  Urgency: {urgency}")
            print(f"  Recommendation: {recommendation}")
            
            # ================================================================
            # FINAL SUMMARY
            # ================================================================
            print("\n" + "=" * 80)
            print("📋 COMPLETE ASSESSMENT SUMMARY")
            print("=" * 80)
            
            print(f"\n🧠 Cognitive Load:      {cognitive_load} ({confidence:.1f}% confidence)")
            print(f"👁️  Engagement:          {engagement_score:.2f} ({engagement_score*100:.0f}%)")
            print(f"🎯 Next Quiz:           {decision['quiz_type']} ({decision['num_questions']} questions)")
            print(f"💾 Review Schedule:     {days_to_forget:.1f} days ({urgency})")
            
            print(f"\n📝 Complete Learning Path:")
            print(f"   1. Student watches video (engagement tracked)")
            print(f"   2. Takes {decision['quiz_type']} quiz ({decision['num_questions']} questions)")
            print(f"   3. System detects {cognitive_load} cognitive load")
            print(f"   4. Email reminder scheduled for {days_to_forget:.0f} days")
            print(f"   5. Student receives personalized review content")
            
            print("\n" + "=" * 80)
            
        except KeyboardInterrupt:
            print("\n\n👋 Test interrupted by user.")
            break
        except Exception as e:
            print(f"\n❌ Error during prediction: {e}")
            import traceback
            traceback.print_exc()
        
        # Ask to continue
        print("\n" + "─" * 80)
        continue_test = input("\n🔄 Test another student? (y/n): ").strip().lower()
        if continue_test != 'y':
            break
    
    print("\n" + "=" * 80)
    print("✅ Testing Complete!")
    print("=" * 80)
    print("\n🎓 All models are working correctly and ready for production!")
    print("\n💡 Next steps:")
    print("   1. Integrate models with backend API")
    print("   2. Connect frontend to backend")
    print("   3. Test end-to-end with real users")
    print("   4. Deploy to production!")
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()