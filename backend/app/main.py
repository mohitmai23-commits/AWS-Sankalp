"""
Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes import auth, content, cognitive_load, engagement, quiz, audio, notifications

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Adaptive Learning Platform API",
    description="AI-powered adaptive learning for Quantum Mechanics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - FIXED!
app.include_router(auth.router, prefix="/api")  # ← Keep only this one!
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(cognitive_load.router, prefix="/api/cognitive-load", tags=["Cognitive Load"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["Engagement"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/")
async def root():
    return {
        "message": "Adaptive Learning Platform API",
        "version": "1.0.0",
        "status": "running"
    }


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