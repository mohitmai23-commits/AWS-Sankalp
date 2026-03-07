"""
Main FastAPI Application
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes import auth, content, cognitive_load, engagement, quiz, audio, notifications, chatbot
import json
import base64
from sqlalchemy import text

# Create database tables
Base.metadata.create_all(bind=engine)

# Run migration for email verification columns
def run_email_verification_migration():
    """Add email verification columns if they don't exist"""
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='users' AND column_name='is_verified'
            """))
            if not result.fetchone():
                print("🔄 Running email verification migration...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE,
                    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP
                """))
                conn.commit()
                # Mark all existing users as verified so they don't get locked out
                conn.execute(text("UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL"))
                conn.commit()
                print("✅ Email verification columns added, existing users marked as verified")
            else:
                print("✅ Email verification columns already exist")
    except Exception as e:
        print(f"⚠️ Migration warning (may already exist): {e}")

# Run migration on startup
run_email_verification_migration()

# Initialize FastAPI app
app = FastAPI(
    title="Adaptive Learning Platform API",
    description="AI-powered adaptive learning for Quantum Mechanics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health check endpoint for ELB
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(cognitive_load.router, prefix="/api/cognitive-load", tags=["Cognitive Load"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["Engagement"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

# Lazy-load engagement detector
_engagement_detector = None

def get_engagement_detector():
    global _engagement_detector
    if _engagement_detector is None:
        from .ml_models.engagement_detector import EngagementDetector
        _engagement_detector = EngagementDetector()
    return _engagement_detector


@app.get("/")
async def root():
    return {
        "message": "Adaptive Learning Platform API",
        "version": "1.0.0",
        "status": "running"
    }

@app.websocket("/ws/cognitive/{user_id}")
async def cognitive_websocket(websocket: WebSocket, user_id: str):
    """
    WebSocket for real-time ENGAGEMENT detection from webcam.
    NOTE: Cognitive load is computed separately via /api/cognitive-load/check
    """
    await websocket.accept()
    print(f"✅ WebSocket connected: {user_id}")
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Extract image data
            image_data = data.get("image", "")
            timestamp = data.get("timestamp", 0)
            
            # Process image if provided
            engagement_score = 0.7  # Default
            
            if image_data and image_data.startswith("data:image"):
                try:
                    # Remove data URL prefix
                    image_b64 = image_data.split(",")[1]
                    image_bytes = base64.b64decode(image_b64)
                    
                    # Predict engagement from frame
                    engagement_score = get_engagement_detector().predict_from_frame(image_bytes)
                    
                    print(f"📊 User {user_id}: Engagement={engagement_score:.2f}")
                    
                except Exception as e:
                    print(f"⚠️  Image processing error: {e}")
            
            # Send ONLY engagement back
            # Cognitive load will be calculated by /api/cognitive-load/check endpoint
            result = {
                "engagementLevel": engagement_score,
                "timestamp": timestamp
            }
            
            await websocket.send_json(result)
            
    except WebSocketDisconnect:
        print(f"❌ WebSocket disconnected: {user_id}")
    except Exception as e:
        print(f"❌ WebSocket error for {user_id}: {e}")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Debug: Print all routes
print("🚀 Adaptive Learning Platform API Starting...")
print("\n📋 Available Routes:")
for route in app.routes:
    print(f"  {route.methods if hasattr(route, 'methods') else ''} {route.path}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)