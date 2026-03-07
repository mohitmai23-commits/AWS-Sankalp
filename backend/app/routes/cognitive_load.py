"""
Cognitive Load Routes - Updated with confidence handling
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging
from datetime import datetime

from ..database import get_db
from ..models.cognitive_load import CognitiveLoad

logger = logging.getLogger(__name__)

router = APIRouter()

# Lazy-load predictor to save memory at startup
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        from ..ml_models.cognitive_load_predictor import CognitiveLoadPredictor
        _predictor = CognitiveLoadPredictor()
        logger.info("✅ Cognitive Load Predictor lazy-loaded")
    return _predictor


class CognitiveLoadCheckRequest(BaseModel):
    user_id: int
    subtopic_id: str
    engagement_score: float
    scroll_speed: float = 100
    scroll_depth: float = 0.5
    back_forth_scrolls: int = 0
    hover_duration_avg: float = 3
    time_spent: float = 5
    mouse_movement_erratic: float = 0.3
    pause_duration: float = 0.0


class CognitiveLoadResponse(BaseModel):
    cognitive_load: str
    cognitive_load_score: float
    confidence: float  # NEW: Data quality/confidence
    message: str


@router.post("/check", response_model=CognitiveLoadResponse)
async def check_cognitive_load(
    request: CognitiveLoadCheckRequest,
    db: Session = Depends(get_db)
):
    """Check cognitive load with confidence score"""
    try:
        predictor = get_predictor()
        if not predictor:
            raise HTTPException(status_code=503, detail="Predictor not available")
        
        # Build features
        features = {
            'engagement_score': request.engagement_score,
            'scroll_speed': request.scroll_speed,
            'scroll_depth': request.scroll_depth,
            'back_forth_scrolls': request.back_forth_scrolls,
            'hover_duration_avg': request.hover_duration_avg,
            'time_spent': request.time_spent,
            'mouse_movement_erratic': request.mouse_movement_erratic,
            'pause_duration': request.pause_duration
        }
        
        logger.info(f"📥 Cognitive check: user={request.user_id} subtopic={request.subtopic_id}")
        logger.info(f"   Time={request.time_spent:.1f}s Eng={request.engagement_score:.2f}")
        
        # Get prediction WITH confidence
        prediction, probability, confidence = predictor.predict_with_probability(features)
        
        load_label = "HIGH" if prediction == 1 else "LOW"
        
        logger.info(f"📤 Result: {load_label} prob={probability:.2%} conf={confidence:.2%}")
        
        # Only save to database if confidence is high enough
        if confidence > 0.5:
            try:
                cognitive_entry = CognitiveLoad(
                    user_id=request.user_id,
                    subtopic_id=request.subtopic_id,
                    load_level=load_label,
                    engagement_score=request.engagement_score,
                    timestamp=datetime.utcnow(),
                    features=features
                )
                db.add(cognitive_entry)
                db.commit()
                db.refresh(cognitive_entry)
                logger.info(f"💾 Saved to DB (ID: {cognitive_entry.cl_id})")
            except Exception as db_error:
                logger.warning(f"⚠️ DB save failed: {db_error}")
                db.rollback()
        else:
            logger.info(f"⏭️ Skipped DB save (low confidence: {confidence:.2%})")
        
        return CognitiveLoadResponse(
            cognitive_load=load_label,
            cognitive_load_score=float(probability),
            confidence=float(confidence),
            message=f"{load_label} cognitive load ({probability:.1%} confidence)"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Check failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{user_id}")
async def get_cognitive_load_history(
    user_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get cognitive load history"""
    try:
        history = db.query(CognitiveLoad)\
            .filter(CognitiveLoad.user_id == user_id)\
            .order_by(CognitiveLoad.timestamp.desc())\
            .limit(limit)\
            .all()
        
        return {
            "user_id": user_id,
            "count": len(history),
            "history": [
                {
                    "cl_id": h.cl_id,
                    "subtopic_id": h.subtopic_id,
                    "load_level": h.load_level,
                    "engagement_score": h.engagement_score,
                    "timestamp": h.timestamp.isoformat(),
                    "features": h.features
                }
                for h in history
            ]
        }
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{user_id}")
async def get_cognitive_load_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get cognitive load statistics"""
    try:
        all_loads = db.query(CognitiveLoad)\
            .filter(CognitiveLoad.user_id == user_id)\
            .all()
        
        if not all_loads:
            return {
                "user_id": user_id,
                "total_checks": 0,
                "high_count": 0,
                "low_count": 0,
                "high_percentage": 0,
                "avg_engagement": 0
            }
        
        high_count = sum(1 for load in all_loads if load.load_level == "HIGH")
        low_count = len(all_loads) - high_count
        avg_engagement = sum(load.engagement_score for load in all_loads) / len(all_loads)
        
        return {
            "user_id": user_id,
            "total_checks": len(all_loads),
            "high_count": high_count,
            "low_count": low_count,
            "high_percentage": (high_count / len(all_loads)) * 100,
            "avg_engagement": avg_engagement
        }
    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))