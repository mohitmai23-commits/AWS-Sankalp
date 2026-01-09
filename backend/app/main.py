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
from .ml_models.engagement_detector import EngagementDetector

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Adaptive Learning Platform API",
    description="AI-powered adaptive learning for Quantum Mechanics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(cognitive_load.router, prefix="/api/cognitive-load", tags=["Cognitive Load"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["Engagement"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

# Initialize engagement detector (will use dummy if model not available)
engagement_detector = EngagementDetector()


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
                    engagement_score = engagement_detector.predict_from_frame(image_bytes)
                    
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