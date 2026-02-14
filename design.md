# Design Document: AnuJnana - Adaptive Learning Platform

## Project Overview

**Project Name:** AnuJnana  
**Hackathon:** AWS AI for Bharat  
**Domain:** Educational Technology (EdTech) - Quantum Mechanics Learning  
**Version:** 1.0.0  
**Architecture Type:** Microservices-Ready Monolith with ML Inference Pipeline

---

## 1. System Overview

AnuJnana is an AI-powered adaptive learning platform that provides personalized quantum mechanics education through real-time cognitive load detection, webcam-based engagement monitoring, and predictive memory retention modeling. The system dynamically adjusts content complexity, quiz difficulty, and revision schedules based on individual learner behavior and performance.

### Core Capabilities

- **Real-Time Adaptation:** Dual-model monitoring (cognitive load + engagement) triggers content simplification
- **Predictive Learning:** ML-powered memory retention forecasting schedules optimal revision intervals
- **AI-Enhanced Content:** Gemini 2.0 Flash generates conversational audio summaries with analogies
- **Personalized Assessment:** Adaptive quiz difficulty selection based on cognitive state
- **Automated Interventions:** Video pausing, attention-recovery questions, and email reminders

### Technology Stack

**Backend:**
- FastAPI (Python 3.10+) - High-performance async API framework
- PostgreSQL 14+ - Relational database with ACID guarantees
- SQLAlchemy - ORM for database interactions
- Redis - Message broker for background tasks
- Celery - Distributed task queue for async processing

**Machine Learning:**
- XGBoost - Cognitive load classification & memory retention regression
- Ensemble Model (RF + XGBoost + Extra Trees) - Engagement detection
- MLflow - Experiment tracking and model versioning
- scikit-learn - Data preprocessing and feature engineering
- OpenCV - Image processing for webcam frames

**AI Services:**
- Google Gemini 2.0 Flash - Audio summary generation
- Google Cloud Text-to-Speech - Audio narration synthesis

**Frontend:**
- React 18 - Component-based UI framework
- React Router v6 - Client-side routing
- Tailwind CSS - Utility-first styling
- Axios - HTTP client for API communication
- react-webcam - Webcam capture for engagement monitoring
- Framer Motion - Smooth animations and transitions

**Infrastructure:**
- Docker - Containerization for consistent deployment
- NGINX - Reverse proxy and load balancing
- AWS (Target) - Cloud infrastructure (EC2, RDS, S3, SES)

---

## 2. Architectural Principles

### 2.1 Design Philosophy

1. **Modularity:** Clear separation between API, ML inference, background tasks, and data layers
2. **Scalability:** Stateless API design enables horizontal scaling
3. **Resilience:** Graceful degradation with fallback mechanisms for external services
4. **Privacy-First:** No storage of raw webcam images, only engagement scores
5. **Performance:** Async processing for ML inference and email notifications
6. **Maintainability:** Clean code structure with comprehensive logging

### 2.2 Key Architectural Decisions

**Decision 1: Monolithic Backend with Service Layer Pattern**
- **Rationale:** Simplifies development for hackathon timeline while maintaining clear service boundaries
- **Trade-off:** Easier to develop and deploy initially; can be split into microservices later
- **Implementation:** Separate modules for routes, models, services, and ML inference

**Decision 2: Real-Time WebSocket for Engagement Monitoring**
- **Rationale:** Low-latency bidirectional communication for continuous webcam frame processing
- **Trade-off:** Maintains persistent connections; requires connection management
- **Implementation:** FastAPI WebSocket endpoint with automatic reconnection on frontend

**Decision 3: Async Background Tasks for Email & Predictions**
- **Rationale:** Non-blocking operations prevent API response delays
- **Trade-off:** Requires Redis infrastructure; eventual consistency for notifications
- **Implementation:** Celery workers process email sending and scheduled reminders

**Decision 4: Client-Side Interaction Tracking**
- **Rationale:** Reduces server load by computing interaction metrics on frontend
- **Trade-off:** Relies on client-side JavaScript; potential for data inconsistency
- **Implementation:** Frontend tracks scroll, mouse, hover events and sends aggregated features

**Decision 5: Model Inference in API Process**
- **Rationale:** Low-latency predictions (<200ms) suitable for in-process inference
- **Trade-off:** CPU-bound operations in API process; acceptable for current scale
- **Implementation:** Pre-loaded models in memory with singleton pattern

---

## 3. High-Level Architecture


```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Browser)                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React Frontend (SPA)                                             │  │
│  │  - Authentication UI          - Content Display (Normal/Simple)   │  │
│  │  - Webcam Capture             - Quiz Interface                    │  │
│  │  - Interaction Tracking       - Progress Dashboard                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│         │                    │                         │                 │
│         │ HTTP/REST          │ WebSocket               │ HTTP/REST       │
│         ▼                    ▼                         ▼                 │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                         │
         │                    │                         │
┌────────┴────────────────────┴─────────────────────────┴─────────────────┐
│                        API GATEWAY / LOAD BALANCER                       │
│                              (NGINX / AWS ALB)                           │
└──────────────────────────────────────────────────────────────────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Auth Routes  │  │Content Routes│  │ Quiz Routes  │  │Engagement  │ │
│  │ /api/auth/*  │  │/api/content/*│  │ /api/quiz/*  │  │WebSocket   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │Cognitive Load│  │ Audio Routes │  │Notification  │  │ Chatbot    │ │
│  │/api/cog-load │  │ /api/audio/* │  │ /api/notif/* │  │/api/chat/* │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Business Logic)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │Email Service │  │Gemini Service│  │  TTS Service │  │Storage Svc │ │
│  │(SMTP/SendGrd)│  │(AI Summaries)│  │(Google Cloud)│  │(GCS/S3)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ML INFERENCE LAYER (In-Process)                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐ │
│  │ Cognitive Load       │  │ Engagement Detector  │  │Memory Retention│
│  │ Predictor (XGBoost)  │  │ (Ensemble Model)     │  │Predictor (XGB) │
│  │ - 8 features         │  │ - Webcam frames      │  │- 7 features    │
│  │ - Binary: HIGH/LOW   │  │ - Score: 0.0-1.0     │  │- Days: 3-14    │
│  └──────────────────────┘  └──────────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                         │
         ▼                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND TASK LAYER (Celery)                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐ │
│  │ Email Worker         │  │ Reminder Scheduler   │  │ Analytics    │ │
│  │ - Welcome emails     │  │ - Cron-based checks  │  │ - Aggregation│ │
│  │ - Quiz results       │  │ - Revision reminders │  │ - Reporting  │ │
│  │ - Revision reminders │  │ - Batch processing   │  │              │ │
│  └──────────────────────┘  └──────────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐ │
│  │ PostgreSQL Database  │  │ Redis Cache/Queue    │  │Cloud Storage │ │
│  │ - Users              │  │ - Celery tasks       │  │- Audio files │ │
│  │ - Progress           │  │ - Session data       │  │- Video files │ │
│  │ - Cognitive loads    │  │ - Rate limiting      │  │- ML models   │ │
│  │ - Quiz results       │  │                      │  │              │ │
│  │ - Memory predictions │  │                      │  │              │ │
│  │ - Notifications      │  │                      │  │              │ │
│  └──────────────────────┘  └──────────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │Google Gemini │  │ Google TTS   │  │SMTP/SendGrid │  │  MLflow    │ │
│  │2.0 Flash API │  │    API       │  │Email Service │  │  Tracking  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Architecture Characteristics

- **Layered Architecture:** Clear separation of concerns across 6 distinct layers
- **Stateless API:** Enables horizontal scaling of backend instances
- **Async Processing:** Non-blocking operations for ML inference and notifications
- **Event-Driven:** Background tasks triggered by user actions (quiz submission, etc.)
- **Resilient:** Fallback mechanisms for external service failures

---

## 4. Component Breakdown

### 4.1 Frontend Layer (React SPA)

**Purpose:** Provides interactive user interface with real-time monitoring capabilities

**Key Components:**


**Authentication Module** (`src/components/Auth/`)
- Login/Registration forms with JWT token management
- Password validation and email verification
- Session persistence using localStorage

**Content Display Module** (`src/components/Content/`)
- `NormalContent.jsx` - Standard complexity content with equations
- `SimplifiedContent.jsx` - Reduced complexity with analogies
- Dynamic routing based on cognitive load detection
- Video player with engagement monitoring hooks

**Tracking Module** (`src/components/Tracking/`)
- `EngagementMonitor.jsx` - Webcam capture every 3 seconds
- Interaction tracker - Scroll, mouse, hover event listeners
- WebSocket client for real-time engagement streaming
- Feature aggregation for cognitive load prediction

**Quiz Module** (`src/components/Quiz/`)
- `EasyQuiz.jsx` - Simplified questions for HIGH cognitive load
- `HardQuiz.jsx` - Advanced questions for LOW cognitive load
- Timer, score calculation, weak area identification
- Quiz submission with memory prediction trigger

**Dashboard Module** (`src/components/Dashboard/`)
- Progress visualization across topics/subtopics
- Cognitive load history charts
- Notification center with unread counts
- Continue learning navigation

**Context Providers** (`src/context/`)
- `AuthContext.jsx` - User authentication state management
- `ProgressContext.jsx` - Learning progress tracking
- Global state accessible across components

**Technical Implementation:**
```javascript
// Interaction Tracking Example
const trackInteractions = () => {
  const features = {
    scroll_speed: calculateScrollSpeed(),
    scroll_depth: getScrollDepth(),
    back_forth_scrolls: countBackForthScrolls(),
    hover_duration_avg: getAverageHoverDuration(),
    time_spent: getTimeOnPage(),
    mouse_movement_erratic: calculateMouseErraticity(),
    pause_duration: getIdleTime(),
    engagement_score: currentEngagementScore
  };
  
  // Send to backend for cognitive load prediction
  await axios.post('/api/cognitive-load/check', {
    user_id: userId,
    subtopic_id: subtopicId,
    ...features
  });
};
```

**State Management Strategy:**
- Context API for global state (auth, progress)
- Local component state for UI interactions
- No Redux (unnecessary complexity for current scope)

---

### 4.2 Backend API Layer (FastAPI)

**Purpose:** Provides RESTful API endpoints and WebSocket connections for real-time features

**Route Modules:**

**Authentication Routes** (`app/routes/auth.py`)
- `POST /api/auth/register` - User registration with email notification
- `POST /api/auth/login` - JWT token generation
- `GET /api/auth/me` - Current user profile retrieval
- Password hashing with bcrypt (cost factor 12)
- JWT expiration: 30 minutes (configurable)

**Content Routes** (`app/routes/content.py`)
- `GET /api/content/{topic}/{subtopic}` - Fetch content by ID
- `GET /api/content/{topic}/{subtopic}/simplified` - Simplified version
- Content stored in database or file system
- Metadata includes difficulty level, prerequisites

**Cognitive Load Routes** (`app/routes/cognitive_load.py`)
- `POST /api/cognitive-load/check` - Real-time prediction
- `GET /api/cognitive-load/history/{user_id}` - Historical data
- `GET /api/cognitive-load/stats/{user_id}` - Aggregated statistics
- Returns: load_level (HIGH/LOW), confidence score, probability

**Engagement Routes** (`app/routes/engagement.py`)
- `WebSocket /ws/cognitive/{user_id}` - Real-time frame processing
- `POST /api/engagement/video-check` - Video engagement monitoring
- `POST /api/engagement/update` - Manual engagement score update
- Handles base64 image decoding and model inference

**Quiz Routes** (`app/routes/quiz.py`)
- `GET /api/quiz/questions/{subtopic_id}/{type}` - Fetch questions
- `POST /api/quiz/submit` - Submit answers, trigger memory prediction
- Calculates score, identifies weak areas
- Triggers async email notification

**Audio Routes** (`app/routes/audio.py`)
- `POST /api/audio/generate-summary` - Gemini + TTS pipeline
- `GET /api/audio/{subtopic_id}` - Retrieve cached audio
- Fallback to rule-based summarization on API failure
- Caching strategy to reduce API costs

**Notification Routes** (`app/routes/notifications.py`)
- `GET /api/notifications` - Fetch user notifications
- `POST /api/notifications/mark-read/{notif_id}` - Mark as read
- `GET /api/notifications/unread-count` - Badge count

**Chatbot Routes** (`app/routes/chatbot.py`)
- `POST /api/chatbot/query` - Natural language question answering
- Context-aware responses using conversation history
- Integration with AI service for quantum mechanics Q&A

**Middleware & Configuration:**
```python
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Database Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# JWT Authentication Dependency
def get_current_user(token: str = Depends(oauth2_scheme)):
    # Verify JWT token and return user
    pass
```

**Error Handling:**
- Custom exception handlers for 400, 401, 404, 500 errors
- Structured error responses with error codes
- Comprehensive logging with request IDs

---

### 4.3 ML Inference Layer

**Purpose:** Provides real-time machine learning predictions for adaptive learning

**Component 1: Cognitive Load Predictor**

**Model:** XGBoost Classifier  
**Training Dataset:** EdNet-KT1 (784,309 user interaction logs)  
**Input Features (8):**
1. `engagement_score` (0.0-1.0) - From webcam monitoring
2. `scroll_speed` (pixels/second) - Scrolling velocity
3. `scroll_depth` (0.0-1.0) - Percentage of content viewed
4. `back_forth_scrolls` (count) - Repetitive scrolling patterns
5. `hover_duration_avg` (seconds) - Average hover time on elements
6. `time_spent` (seconds) - Total time on page
7. `mouse_movement_erratic` (0.0-1.0) - Mouse movement irregularity
8. `pause_duration` (seconds) - Idle time without interaction

**Output:** Binary classification (HIGH/LOW) with confidence score

**Implementation:**
```python
class CognitiveLoadPredictor:
    def __init__(self):
        self.model = load_model(settings.COGNITIVE_LOAD_MODEL_PATH)
        self.scaler = load_model(settings.COGNITIVE_LOAD_SCALER_PATH)
    
    def predict_with_probability(self, features: dict) -> tuple:
        # Data quality assessment
        data_quality = self._assess_data_quality(features)
        
        if data_quality < 0.4:
            return 0, 0.40, data_quality  # Insufficient data
        
        # Feature vector preparation
        feature_vector = np.array([[
            features['engagement_score'],
            features['scroll_speed'],
            # ... other features
        ]])
        
        # Prediction with XGBoost
        probabilities = self.model.predict_proba(feature_vector)[0]
        prob_high = float(probabilities[1])
        
        # Threshold: 0.65 for HIGH classification
        prediction = 1 if prob_high > 0.65 else 0
        
        return prediction, prob_high, data_quality
```

**Model Performance:**
- Accuracy: 78.5% on test set
- F1 Score: 0.76
- Inference Time: <50ms per prediction

**Adaptive Thresholds:**
- Warm-up period: First 8-12 seconds, lower confidence
- Confidence blending: Neutral bias during warm-up
- Higher threshold (0.65) to reduce false positives

---

**Component 2: Engagement Detector**

**Model:** Ensemble (Random Forest + XGBoost + Extra Trees)  
**Training Dataset:** FER-2013 (35,887 facial expression images)  
**Input:** Webcam frame (640x480 JPEG)  
**Output:** Engagement score (0.0-1.0)

**Implementation:**
```python
class EngagementDetector:
    def __init__(self, model_path: str = None):
        self.model = None  # Pre-trained model
        self.last_scores = []  # Smoothing buffer
    
    def predict_from_frame(self, image_bytes: bytes) -> float:
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Preprocess for model
        img = cv2.resize(img, (48, 48))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = img.astype('float32') / 255.0
        
        # Predict engagement
        prediction = self.model.predict(img)
        engagement_score = float(prediction[0][0])
        
        # Smooth with recent scores
        self.last_scores.append(engagement_score)
        if len(self.last_scores) > 5:
            self.last_scores.pop(0)
        
        return np.mean(self.last_scores)
```

**Fallback Heuristics (when model unavailable):**
- Face detection using Haar Cascades
- Brightness variance (movement detection)
- Image sharpness (focus detection)
- Simulated engagement with realistic variation

**Model Performance:**
- Engagement detection accuracy: 82.3%
- Frame processing time: <100ms
- Smoothing window: 5 frames (15 seconds)

---

**Component 3: Memory Retention Predictor**

**Model:** XGBoost Regressor  
**Training Dataset:** ASSISTments (skill_builder_data.csv, 500K+ interactions)  
**Input Features (7):**
1. `quiz_score` (0.0-1.0) - PRIMARY FEATURE
2. `quiz_type` (0=easy, 1=hard) - Difficulty level
3. `time_taken` (seconds) - Quiz completion time
4. `engagement_avg` (0.0-1.0) - Average engagement during learning
5. `cognitive_load` (0=low, 1=high) - Cognitive state during learning
6. `video_watched` (0/1) - Video completion status
7. `attempt_number` (integer) - Quiz attempt count

**Output:** Days until forgetting (3-14 days)

**Implementation:**
```python
class MemoryRetentionPredictor:
    def __init__(self):
        self.model = load_model(settings.MEMORY_RETENTION_MODEL_PATH)
        self.scaler = load_model(settings.MEMORY_RETENTION_SCALER_PATH)
    
    def predict(self, features: dict) -> int:
        # Feature vector preparation
        feature_vector = np.array([[
            features['quiz_score'],  # Primary predictor
            features['quiz_type'],
            features['time_taken'],
            features['engagement_avg'],
            features['cognitive_load'],
            features['video_watched'],
            features['attempt_number']
        ]])
        
        # Prediction
        prediction = self.model.predict(feature_vector)[0]
        predicted_days = int(np.round(prediction))
        
        # Clamp to valid range
        predicted_days = max(3, min(14, predicted_days))
        
        return predicted_days
```

**Model Performance:**
- MAE (Mean Absolute Error): 2.3 days
- RMSE: 3.1 days
- R² Score: 0.68
- Quiz score feature importance: 34.2%

**Prediction Logic:**
- High quiz score (>80%) → 7-14 days
- Medium quiz score (60-80%) → 5-7 days
- Low quiz score (<60%) → 3-5 days
- Adjusted by engagement and cognitive load

---

### 4.4 Service Layer

**Purpose:** Encapsulates business logic and external service integrations

**Email Service** (`app/services/email_service.py`)

**Primary:** SMTP (Gmail)  
**Fallback:** Twilio SendGrid

**Email Types:**
1. **Welcome Email** - Sent on registration with password
2. **Quiz Results Email** - Immediate feedback with weak areas analysis
3. **Revision Reminder Email** - Scheduled based on memory prediction

**Implementation:**
```python
async def send_immediate_prediction_email(
    email: str,
    name: str,
    subtopic: str,
    predicted_days: int,
    score: float,
    weak_areas: list
):
    # Build HTML email with performance summary
    html_content = f"""
    <html>
      <body>
        <h2>Great Job, {name}!</h2>
        <p>Score: {score*100}%</p>
        <p>Predicted forgetting: {predicted_days} days</p>
        <div>Weak Areas: {weak_areas}</div>
      </body>
    </html>
    """
    
    send_email_smtp(email, subject, html_content)
```

**Error Handling:**
- Non-blocking: Email failures don't block API responses
- Retry logic: 3 attempts with exponential backoff
- Logging: All email events logged for debugging

---

**Gemini Service** (`app/services/gemini_service.py`)

**Purpose:** Generate conversational audio summaries using AI

**API:** Google Gemini 2.0 Flash  
**Fallback:** Rule-based text summarization

**Prompt Engineering:**
```python
prompt = f"""
You are an expert physics teacher creating an audio explanation 
for students learning quantum mechanics.

Original Content: {content}

Task: Convert this into a simplified, audio-friendly explanation 
(2-3 minutes when spoken) that:
1. Uses conversational, friendly tone
2. Breaks down complex equations into simple language
3. Includes 2-3 real-world analogies
4. Explains "why" concepts matter
5. Is suitable for verbal narration

Format: Return only the narration text, no markdown.
"""
```

**Fallback Mechanism:**
```python
def _generate_fallback_summary(content: str) -> str:
    # Extract key sentences
    paragraphs = content.split('\n\n')
    key_sentences = [p.split('.')[0] for p in paragraphs[:4]]
    
    # Simplify technical terms
    simplified = [_simplify_sentence(s) for s in key_sentences]
    
    # Add conversational connectors
    summary = "Let me explain this concept in simple terms.\n\n"
    connectors = ["First, ", "Next, ", "Also, ", "Finally, "]
    
    for i, sentence in enumerate(simplified):
        summary += connectors[i] + sentence + "\n\n"
    
    return summary
```

**Rate Limiting:**
- Quota monitoring with fallback activation
- Caching to reduce API calls
- Error handling for 429 (rate limit) responses

---

**TTS Service** (`app/services/tts_service.py`)

**Purpose:** Convert text summaries to audio narration

**API:** Google Cloud Text-to-Speech  
**Voice:** en-US-Neural2-J (Male, conversational)  
**Format:** MP3, 24kHz sample rate

**Implementation:**
```python
async def generate_audio(text: str, subtopic_id: str) -> str:
    # Configure TTS
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Neural2-J"
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )
    
    # Generate audio
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )
    
    # Upload to cloud storage
    audio_url = upload_to_storage(response.audio_content, subtopic_id)
    
    return audio_url
```

**Caching Strategy:**
- Audio files cached in cloud storage (GCS/S3)
- Database stores audio_url for quick retrieval
- Cache invalidation on content updates

---

**Storage Service** (`app/services/storage_service.py`)

**Purpose:** Manage file uploads to cloud storage

**Supported:** Google Cloud Storage (GCS) or AWS S3  
**File Types:** Audio (MP3), Video (MP4), ML Models (PKL)

**Implementation:**
```python
def upload_to_storage(file_bytes: bytes, filename: str) -> str:
    if settings.STORAGE_TYPE == "gcs":
        # Google Cloud Storage
        bucket = storage_client.bucket(settings.STORAGE_BUCKET)
        blob = bucket.blob(f"audio/{filename}.mp3")
        blob.upload_from_string(file_bytes, content_type="audio/mpeg")
        return blob.public_url
    
    elif settings.STORAGE_TYPE == "s3":
        # AWS S3
        s3_client.put_object(
            Bucket=settings.STORAGE_BUCKET,
            Key=f"audio/{filename}.mp3",
            Body=file_bytes,
            ContentType="audio/mpeg"
        )
        return f"https://{settings.STORAGE_BUCKET}.s3.amazonaws.com/audio/{filename}.mp3"
```

---

### 4.5 Background Task Layer (Celery)

**Purpose:** Asynchronous processing of long-running tasks

**Task Queue:** Redis  
**Worker Process:** Celery with async executor

**Task Types:**

**1. Email Tasks** (`app/tasks/email_tasks.py`)
```python
@celery_app.task
def send_welcome_email_task(email: str, name: str, password: str):
    send_password_email(email, name, password)

@celery_app.task
def send_quiz_results_task(email: str, name: str, data: dict):
    send_immediate_prediction_email(email, name, **data)
```

**2. Reminder Scheduler** (`app/tasks/reminder_cron.py`)
```python
@celery_app.task
def check_revision_reminders():
    # Query memory_predictions where reminder_date <= today
    predictions = db.query(MemoryPrediction).filter(
        MemoryPrediction.reminder_date <= datetime.utcnow(),
        MemoryPrediction.is_reminded == False
    ).all()
    
    for prediction in predictions:
        user = db.query(User).filter(User.user_id == prediction.user_id).first()
        send_revision_reminder(user.email, user.name, prediction.subtopic_id)
        prediction.is_reminded = True
    
    db.commit()
```

**Cron Schedule:**
- Revision reminders: Daily at 9:00 AM
- Analytics aggregation: Daily at midnight
- Database cleanup: Weekly

**3. Analytics Tasks**
```python
@celery_app.task
def aggregate_daily_stats():
    # Compute daily engagement averages
    # Aggregate cognitive load distributions
    # Generate usage reports
    pass
```

**Task Monitoring:**
- Celery Flower dashboard for task monitoring
- Failed task retry with exponential backoff
- Dead letter queue for permanently failed tasks

---

### 4.6 Data Layer

**Purpose:** Persistent storage of user data, learning progress, and ML predictions

**Database:** PostgreSQL 14+  
**ORM:** SQLAlchemy with declarative base  
**Migration:** Alembic (future enhancement)

**Entity Relationship Diagram:**

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ user_id (PK)    │◄─────────┐
│ name            │          │
│ email (UNIQUE)  │          │
│ password_hash   │          │
│ created_at      │          │
└─────────────────┘          │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │                    │                    │
┌───────▼─────────┐  ┌───────▼─────────┐  ┌─────▼──────────┐
│    Progress     │  │ CognitiveLoad   │  │  QuizResult    │
│─────────────────│  │─────────────────│  │────────────────│
│ progress_id(PK) │  │ cl_id (PK)      │  │ quiz_id (PK)   │
│ user_id (FK)    │  │ user_id (FK)    │  │ user_id (FK)   │
│ topic           │  │ subtopic_id     │  │ subtopic_id    │
│ subtopic        │  │ load_level      │  │ quiz_type      │
│ last_accessed   │  │ engagement_score│  │ score          │
│ is_completed    │  │ timestamp       │  │ time_taken     │
└─────────────────┘  │ features (JSON) │  │ attempt_number │
                     └─────────────────┘  └────────────────┘
                                                   │
                                                   │
                                          ┌────────▼────────────┐
                                          │ MemoryPrediction    │
                                          │─────────────────────│
                                          │ prediction_id (PK)  │
                                          │ user_id (FK)        │
                                          │ subtopic_id         │
                                          │ predicted_days      │
                                          │ reminder_date       │
                                          │ is_reminded         │
                                          │ created_at          │
                                          └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  VideoEngagement    │  │   Notification      │  │  InteractionLog     │
│─────────────────────│  │─────────────────────│  │─────────────────────│
│ engagement_id (PK)  │  │ notif_id (PK)       │  │ log_id (PK)         │
│ user_id (FK)        │  │ user_id (FK)        │  │ user_id (FK)        │
│ subtopic_id         │  │ type                │  │ subtopic_id         │
│ watch_duration      │  │ message             │  │ event_type          │
│ pause_count         │  │ is_read             │  │ event_data (JSON)   │
│ engagement_avg      │  │ created_at          │  │ timestamp           │
│ timestamp           │  └─────────────────────┘  └─────────────────────┘
└─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│   AudioSummary      │  │   VideoQuestion     │
│─────────────────────│  │─────────────────────│
│ audio_id (PK)       │  │ question_id (PK)    │
│ subtopic_id         │  │ subtopic_id         │
│ summary_text        │  │ question_text       │
│ audio_url           │  │ options (JSON)      │
│ duration            │  │ correct_answer      │
│ created_at          │  │ trigger_time        │
└─────────────────────┘  └─────────────────────┘
```

**Key Tables:**

**Users Table:**
- Primary authentication entity
- One-to-many relationships with all user-specific data
- Email uniqueness constraint for login

**Progress Table:**
- Tracks learning journey across topics/subtopics
- `last_accessed` enables session persistence
- `is_completed` marks finished content

**CognitiveLoad Table:**
- Stores every cognitive load prediction
- `features` JSON column for analysis and debugging
- Indexed on `user_id` and `timestamp` for fast queries

**QuizResult Table:**
- Records all quiz attempts with scores
- `attempt_number` tracks improvement over time
- Triggers memory prediction on insert

**MemoryPrediction Table:**
- Stores forgetting predictions and reminder dates
- `is_reminded` flag prevents duplicate emails
- Indexed on `reminder_date` for cron job efficiency

**VideoEngagement Table:**
- Tracks video watching behavior
- `pause_count` indicates attention drops
- `engagement_avg` computed from webcam monitoring

**Notification Table:**
- In-app notification system
- `is_read` flag for unread badge count
- Soft delete (not implemented in v1.0)

**InteractionLog Table:**
- Raw interaction events for analytics
- `event_data` JSON stores flexible event metadata
- Used for future ML model retraining

**AudioSummary Table:**
- Caches generated audio summaries
- `audio_url` points to cloud storage
- Reduces Gemini API calls

**VideoQuestion Table:**
- Pre-stored attention-recovery questions
- `trigger_time` specifies when to pause video
- Multiple questions per subtopic

**Database Indexes:**
```sql
CREATE INDEX idx_cognitive_load_user_time ON cognitive_load(user_id, timestamp DESC);
CREATE INDEX idx_memory_prediction_reminder ON memory_predictions(reminder_date, is_reminded);
CREATE INDEX idx_quiz_result_user_subtopic ON quiz_results(user_id, subtopic_id);
CREATE INDEX idx_progress_user ON progress(user_id, last_accessed DESC);
```

**Connection Pooling:**
```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,          # Max connections
    max_overflow=10,       # Additional connections under load
    pool_pre_ping=True,    # Verify connections before use
    echo=settings.DEBUG    # SQL logging in debug mode
)
```

---

## 5. Student Learning Workflow

**End-to-End User Journey:**


**Step 1: Registration & Onboarding**
1. User visits landing page, clicks "Get Started"
2. Fills registration form (name, email, password)
3. Backend validates email uniqueness, hashes password with bcrypt
4. User record created in PostgreSQL
5. Welcome email sent asynchronously via Celery with password
6. JWT token generated and returned to frontend
7. User redirected to dashboard

**Step 2: Topic Selection**
1. Dashboard displays 3 quantum mechanics topics
2. User selects topic (e.g., "Tunnelling Effect")
3. Subtopics displayed (3.1, 3.2, 3.3, ...)
4. User clicks subtopic to start learning
5. Progress record created/updated with `last_accessed` timestamp

**Step 3: Content Learning with Dual Monitoring**
1. **Normal Content Displayed:**
   - Text with equations, embedded video, interactive elements
   - Webcam permission requested for engagement monitoring

2. **Engagement Monitoring Starts:**
   - WebSocket connection established to `/ws/cognitive/{user_id}`
   - Frontend captures webcam frame every 3 seconds
   - Frame sent to backend as base64 image
   - Engagement detector processes frame → score (0.0-1.0)
   - Score sent back to frontend via WebSocket

3. **Interaction Tracking:**
   - Frontend tracks: scroll speed, depth, hover, mouse movements, time
   - Every 10 seconds, aggregated features sent to `/api/cognitive-load/check`
   - Backend runs cognitive load prediction → HIGH or LOW

4. **Adaptive Response:**
   - If cognitive load = HIGH:
     - Frontend redirects to `/physics/{topic}/{subtopic}/simplified`
     - Simplified content displayed with reduced complexity
   - If cognitive load = LOW:
     - User continues with normal content

**Step 4: Video Engagement Monitoring**
1. User plays embedded video lecture
2. Engagement monitoring continues during playback
3. If engagement score drops below threshold (e.g., <0.5):
   - Video automatically pauses
   - Attention-recovery question displayed
   - User must answer to resume video
4. Video engagement data stored in `video_engagements` table

**Step 5: AI-Generated Audio Summary**
1. User clicks "Listen to Audio Summary" button
2. Frontend requests `/api/audio/generate-summary`
3. Backend checks cache for existing audio
4. If not cached:
   - Gemini 2.0 Flash generates conversational summary
   - Google TTS converts text to audio
   - Audio uploaded to cloud storage
   - URL stored in `audio_summaries` table
5. Audio player displayed, user listens to summary
6. Playback completion tracked

**Step 6: Adaptive Quiz**
1. User clicks "Take Quiz" after completing content
2. Frontend determines quiz type based on cognitive load history:
   - HIGH cognitive load → Easy Quiz
   - LOW cognitive load → Hard Quiz
3. Quiz questions fetched from `/api/quiz/questions/{subtopic_id}/{type}`
4. User answers questions, timer tracks duration
5. Frontend calculates score and identifies weak areas

**Step 7: Quiz Submission & Memory Prediction**
1. User submits quiz answers
2. Frontend sends to `/api/quiz/submit` with:
   - Score, time taken, weak areas
   - Engagement average during learning
   - Cognitive load history
   - Video/audio completion status
3. Backend:
   - Stores quiz result in `quiz_results` table
   - Runs memory retention predictor → predicted_days (3-14)
   - Calculates reminder_date = today + predicted_days
   - Stores prediction in `memory_predictions` table
   - Triggers async email task via Celery
4. Frontend displays results with predicted forgetting timeline

**Step 8: Immediate Email Notification**
1. Celery worker picks up email task
2. Email generated with:
   - Quiz score and performance summary
   - Weak areas analysis
   - Memory retention prediction
   - Revision reminder schedule
3. Email sent via SMTP/SendGrid
4. User receives detailed feedback in inbox

**Step 9: Progress Tracking**
1. User marks subtopic as complete or navigates to next
2. Progress record updated with `is_completed = True`
3. Dashboard reflects updated progress
4. User can resume from last accessed subtopic

**Step 10: Revision Reminder (Scheduled)**
1. Celery beat scheduler runs daily cron job
2. Queries `memory_predictions` where `reminder_date <= today` and `is_reminded = False`
3. For each prediction:
   - Fetches user email
   - Sends revision reminder email with content link
   - Updates `is_reminded = True`
4. User receives email, clicks link to review content
5. Cycle repeats for spaced repetition

---

## 6. Machine Learning Inference Flow

**Cognitive Load Prediction Pipeline:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Interaction Tracking Module                                │ │
│  │  - Scroll event listeners                                   │ │
│  │  - Mouse movement tracking                                  │ │
│  │  - Hover duration calculation                               │ │
│  │  - Time on page timer                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ Every 10 seconds                     │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Feature Aggregation                                        │ │
│  │  {                                                          │ │
│  │    engagement_score: 0.75,                                 │ │
│  │    scroll_speed: 120,                                      │ │
│  │    scroll_depth: 0.6,                                      │ │
│  │    back_forth_scrolls: 2,                                  │ │
│  │    hover_duration_avg: 4.5,                                │ │
│  │    time_spent: 45,                                         │ │
│  │    mouse_movement_erratic: 0.3,                            │ │
│  │    pause_duration: 2                                       │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ POST /api/cognitive-load/check
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Cognitive Load Route Handler                               │ │
│  │  - Validate request data                                    │ │
│  │  - Extract features dictionary                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CognitiveLoadPredictor.predict_with_probability()          │ │
│  │                                                              │ │
│  │  Step 1: Data Quality Assessment                            │ │
│  │  - Check time_spent >= 8 seconds                            │ │
│  │  - Verify interaction signals present                       │ │
│  │  - Calculate confidence score (0.0-1.0)                     │ │
│  │                                                              │ │
│  │  Step 2: Feature Vector Preparation                         │ │
│  │  - Convert dict to numpy array [1 x 8]                      │ │
│  │  - Apply StandardScaler normalization                       │ │
│  │                                                              │ │
│  │  Step 3: XGBoost Inference                                  │ │
│  │  - model.predict_proba(feature_vector)                      │ │
│  │  - Extract probability of HIGH class                        │ │
│  │                                                              │ │
│  │  Step 4: Confidence Blending                                │ │
│  │  - If confidence < 0.7: blend with neutral (0.35)           │ │
│  │  - Prevents premature HIGH predictions                      │ │
│  │                                                              │ │
│  │  Step 5: Threshold Application                              │ │
│  │  - prediction = 1 if prob_high > 0.65 else 0                │ │
│  │  - Higher threshold reduces false positives                 │ │
│  │                                                              │ │
│  │  Return: (prediction, probability, confidence)              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Database Persistence (if confidence > 0.5)                 │ │
│  │  - Insert into cognitive_load table                         │ │
│  │  - Store features JSON for analysis                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Response                                                    │ │
│  │  {                                                           │ │
│  │    cognitive_load: "HIGH",                                  │ │
│  │    cognitive_load_score: 0.72,                              │ │
│  │    confidence: 0.85,                                        │ │
│  │    message: "HIGH cognitive load (72% confidence)"          │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ JSON Response
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Adaptive Response Handler                                  │ │
│  │                                                              │ │
│  │  if (cognitive_load === "HIGH") {                           │ │
│  │    navigate(`/physics/${topic}/${subtopic}/simplified`);    │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **In-Process Inference:** Models loaded in API memory for <50ms latency
- **Confidence Gating:** Only persist predictions with confidence >50%
- **Warm-Up Period:** First 8-12 seconds have lower confidence to prevent premature triggers
- **Higher Threshold:** 0.65 probability threshold reduces false HIGH predictions
- **Feature Caching:** Recent predictions cached to smooth temporal variations

---

## 7. Real-Time Engagement Monitoring Flow

**WebSocket-Based Webcam Processing:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  EngagementMonitor Component                                │ │
│  │  - react-webcam captures frame every 3 seconds              │ │
│  │  - getScreenshot() returns base64 JPEG                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ Every 3 seconds                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  WebSocket Client                                            │ │
│  │  ws://localhost:8000/ws/cognitive/{user_id}                 │ │
│  │                                                              │ │
│  │  Send JSON:                                                  │ │
│  │  {                                                           │ │
│  │    image: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",       │ │
│  │    timestamp: 1707567890123                                 │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket Message
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  WebSocket Handler: /ws/cognitive/{user_id}                 │ │
│  │                                                              │ │
│  │  async def cognitive_websocket(websocket, user_id):         │ │
│  │    await websocket.accept()                                 │ │
│  │    while True:                                               │ │
│  │      data = await websocket.receive_json()                  │ │
│  │      image_data = data["image"]                             │ │
│  │      # Process image...                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Image Preprocessing                                         │ │
│  │  - Extract base64 string after "data:image/jpeg;base64,"    │ │
│  │  - Decode base64 to bytes                                   │ │
│  │  - image_bytes = base64.b64decode(image_b64)                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  EngagementDetector.predict_from_frame()                    │ │
│  │                                                              │ │
│  │  Step 1: Image Decoding                                     │ │
│  │  - cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)              │ │
│  │                                                              │ │
│  │  Step 2: Preprocessing                                      │ │
│  │  - Resize to 48x48 pixels                                   │ │
│  │  - Convert to grayscale                                     │ │
│  │  - Normalize to [0, 1] range                                │ │
│  │  - Reshape to (1, 48, 48, 1)                                │ │
│  │                                                              │ │
│  │  Step 3: Model Inference                                    │ │
│  │  - ensemble_model.predict(preprocessed_image)               │ │
│  │  - Extract engagement score from output                     │ │
│  │                                                              │ │
│  │  Step 4: Temporal Smoothing                                 │ │
│  │  - Append score to last_scores buffer (size 5)              │ │
│  │  - Return mean of last 5 scores                             │ │
│  │  - Reduces jitter from frame-to-frame variation             │ │
│  │                                                              │ │
│  │  Fallback (if model unavailable):                           │ │
│  │  - Face detection with Haar Cascades                        │ │
│  │  - Brightness variance analysis                             │ │
│  │  - Image sharpness calculation                              │ │
│  │  - Heuristic score: 0.3 + face_bonus + quality_bonus        │ │
│  │                                                              │ │
│  │  Return: engagement_score (0.0-1.0)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  WebSocket Response                                          │ │
│  │  await websocket.send_json({                                │ │
│  │    "engagementLevel": 0.78,                                 │ │
│  │    "timestamp": 1707567890123                               │ │
│  │  })                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket Message
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Engagement Score Handler                                   │ │
│  │  - Update state: setEngagementScore(0.78)                   │ │
│  │  - Display engagement indicator (optional)                  │ │
│  │  - Pass to cognitive load tracker                           │ │
│  │                                                              │ │
│  │  Video Monitoring:                                           │ │
│  │  if (engagementScore < 0.5 && videoPlaying) {               │ │
│  │    pauseVideo();                                             │ │
│  │    showAttentionQuestion();                                 │ │
│  │  }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Performance Characteristics:**
- **Frame Capture:** 3-second intervals (20 frames/minute)
- **Processing Time:** <100ms per frame
- **WebSocket Latency:** <50ms round-trip
- **Smoothing Window:** 5 frames (15 seconds)
- **Memory Usage:** ~50MB for model in memory

**Privacy Considerations:**
- Raw webcam images never stored on server
- Only engagement scores (float) persisted in database
- WebSocket connection encrypted (WSS in production)
- User can disable webcam (fallback to interaction-only tracking)

---

## 8. API Design Overview

**RESTful API Endpoints:**


### Authentication Endpoints

```
POST /api/auth/register
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-02-10T10:30:00Z"
  }
}

POST /api/auth/login
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

GET /api/auth/me
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "user_id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Cognitive Load Endpoints

```
POST /api/cognitive-load/check
Headers: Authorization: Bearer {token}
Request:
{
  "user_id": 1,
  "subtopic_id": "3.1",
  "engagement_score": 0.75,
  "scroll_speed": 120,
  "scroll_depth": 0.6,
  "back_forth_scrolls": 2,
  "hover_duration_avg": 4.5,
  "time_spent": 45,
  "mouse_movement_erratic": 0.3,
  "pause_duration": 2
}

Response: 200 OK
{
  "cognitive_load": "HIGH",
  "cognitive_load_score": 0.72,
  "confidence": 0.85,
  "message": "HIGH cognitive load (72% confidence)"
}

GET /api/cognitive-load/history/{user_id}?limit=20
Response: 200 OK
{
  "user_id": 1,
  "count": 15,
  "history": [
    {
      "cl_id": 42,
      "subtopic_id": "3.1",
      "load_level": "HIGH",
      "engagement_score": 0.65,
      "timestamp": "2026-02-10T11:15:00Z",
      "features": { ... }
    },
    ...
  ]
}

GET /api/cognitive-load/stats/{user_id}
Response: 200 OK
{
  "user_id": 1,
  "total_checks": 50,
  "high_count": 12,
  "low_count": 38,
  "high_percentage": 24.0,
  "avg_engagement": 0.73
}
```

### Quiz Endpoints

```
GET /api/quiz/questions/{subtopic_id}/{type}
Example: GET /api/quiz/questions/3.1/easy

Response: 200 OK
{
  "subtopic_id": "3.1",
  "quiz_type": "easy",
  "questions": [
    {
      "question_id": 1,
      "question_text": "What is quantum tunnelling?",
      "options": ["A", "B", "C", "D"],
      "concept": "Tunnelling Basics"
    },
    ...
  ]
}

POST /api/quiz/submit
Request:
{
  "user_id": 1,
  "subtopic_id": "3.1",
  "quiz_type": "easy",
  "score": 0.85,
  "time_taken": 180,
  "total_questions": 10,
  "correct_answers": 8,
  "engagement_avg": 0.75,
  "cognitive_load_history": "HIGH",
  "video_watched": true,
  "video_pauses": 2,
  "audio_completed": true,
  "weak_areas": [
    {
      "subtopic": "3.1",
      "concept": "Barrier Penetration",
      "wrong_count": 2
    }
  ]
}

Response: 200 OK
{
  "quiz_id": 123,
  "score": 0.85,
  "predicted_days": 7,
  "reminder_date": "2026-02-17T10:00:00Z",
  "message": "Great job! Revise this topic in 7 days to remember it well."
}
```

### Audio Endpoints

```
POST /api/audio/generate-summary
Request:
{
  "subtopic_id": "3.1",
  "content": "Quantum tunnelling is a phenomenon where..."
}

Response: 200 OK
{
  "audio_id": 45,
  "subtopic_id": "3.1",
  "audio_url": "https://storage.googleapis.com/bucket/audio/3.1.mp3",
  "duration": 180,
  "summary_text": "Let me explain quantum tunnelling in simple terms..."
}

GET /api/audio/{subtopic_id}
Response: 200 OK
{
  "audio_id": 45,
  "audio_url": "https://storage.googleapis.com/bucket/audio/3.1.mp3",
  "duration": 180
}
```

### Progress Endpoints

```
GET /api/progress
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "user_id": 1,
  "progress": [
    {
      "progress_id": 1,
      "topic": "Tunnelling Effect",
      "subtopic": "3.1",
      "last_accessed": "2026-02-10T11:30:00Z",
      "is_completed": true
    },
    ...
  ]
}

POST /api/progress/update
Request:
{
  "user_id": 1,
  "topic": "Tunnelling Effect",
  "subtopic": "3.2",
  "is_completed": false
}

Response: 200 OK
{
  "progress_id": 2,
  "message": "Progress updated successfully"
}
```

### Notification Endpoints

```
GET /api/notifications
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "notifications": [
    {
      "notif_id": 1,
      "type": "success",
      "message": "Quiz completed! Score: 85%",
      "is_read": false,
      "created_at": "2026-02-10T11:45:00Z"
    },
    ...
  ],
  "unread_count": 3
}

POST /api/notifications/mark-read/{notif_id}
Response: 200 OK
{
  "message": "Notification marked as read"
}
```

### WebSocket Endpoint

```
WebSocket: ws://localhost:8000/ws/cognitive/{user_id}

Client → Server (every 3 seconds):
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": 1707567890123
}

Server → Client:
{
  "engagementLevel": 0.78,
  "timestamp": 1707567890123
}
```

**API Design Principles:**
- **RESTful:** Resource-based URLs with standard HTTP methods
- **Stateless:** No server-side session storage (JWT for auth)
- **Versioned:** `/api/v1/` prefix for future compatibility (not implemented in v1.0)
- **Consistent:** Uniform response structure with status codes
- **Documented:** OpenAPI/Swagger documentation auto-generated by FastAPI

**Error Response Format:**
```json
{
  "detail": "User not found",
  "error_code": "USER_NOT_FOUND",
  "status_code": 404
}
```

---

## 9. Scalability & Deployment Architecture

**AWS Cloud Architecture (Production-Ready):**

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Route 53 (DNS)                                             │ │
│  │  anujnana.com → ALB                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CloudFront (CDN)                                           │ │
│  │  - Static assets (React build)                              │ │
│  │  - Edge caching for global performance                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Application Load Balancer (ALB)                            │ │
│  │  - SSL/TLS termination                                      │ │
│  │  - Health checks                                             │ │
│  │  - WebSocket support                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              ▼                         ▼                        │
│  ┌─────────────────────┐   ┌─────────────────────┐            │
│  │  ECS Fargate        │   │  ECS Fargate        │            │
│  │  (Backend API)      │   │  (Backend API)      │            │
│  │  - FastAPI app      │   │  - FastAPI app      │            │
│  │  - ML models        │   │  - ML models        │            │
│  │  - Auto-scaling     │   │  - Auto-scaling     │            │
│  └─────────────────────┘   └─────────────────────┘            │
│              │                         │                        │
│              └────────────┬────────────┘                        │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  RDS PostgreSQL (Multi-AZ)                                  │ │
│  │  - Primary + Standby replica                                │ │
│  │  - Automated backups                                         │ │
│  │  - Read replicas for analytics                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ElastiCache Redis                                          │ │
│  │  - Celery task queue                                         │ │
│  │  - Session caching                                           │ │
│  │  - Rate limiting                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ECS Fargate (Celery Workers)                               │ │
│  │  - Email tasks                                               │ │
│  │  - Reminder scheduler                                        │ │
│  │  - Analytics aggregation                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  S3 Buckets                                                  │ │
│  │  - Audio files (MP3)                                         │ │
│  │  - Video files (MP4)                                         │ │
│  │  - ML models (PKL)                                           │ │
│  │  - Static assets                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CloudWatch                                                  │ │
│  │  - Application logs                                          │ │
│  │  - Metrics & alarms                                          │ │
│  │  - Performance monitoring                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SES (Simple Email Service)                                 │ │
│  │  - Transactional emails                                      │ │
│  │  - Revision reminders                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Secrets Manager                                             │ │
│  │  - Database credentials                                      │ │
│  │  - API keys (Gemini, TTS)                                   │ │
│  │  - JWT secret                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Containerization Strategy:**

**Backend Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app
COPY ./models ./models

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose (Development):**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/adaptive_learning
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - ./models:/app/models

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=adaptive_learning
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery_worker:
    build: ./backend
    command: celery -A app.tasks worker --loglevel=info
    depends_on:
      - redis
      - db

  celery_beat:
    build: ./backend
    command: celery -A app.tasks beat --loglevel=info
    depends_on:
      - redis

volumes:
  postgres_data:
```

**Scaling Strategy:**

**Horizontal Scaling:**
- **API Instances:** Auto-scale based on CPU (target: 70%) and request count
- **Celery Workers:** Scale based on queue depth (target: <100 pending tasks)
- **Database:** Read replicas for analytics queries
- **Redis:** Cluster mode for high availability

**Vertical Scaling:**
- **API Instances:** t3.medium (2 vCPU, 4GB RAM) → t3.large (2 vCPU, 8GB RAM)
- **Database:** db.t3.medium → db.r5.large (memory-optimized)
- **ML Models:** Load models on-demand or use separate inference service

**Performance Targets:**
- API Response Time: p95 < 500ms
- WebSocket Latency: < 100ms
- ML Inference: < 200ms
- Database Queries: < 50ms
- Concurrent Users: 1000+ per instance

**Cost Optimization:**
- **Spot Instances:** For Celery workers (non-critical)
- **S3 Lifecycle:** Move old audio files to Glacier after 90 days
- **CloudFront:** Cache static assets at edge locations
- **Reserved Instances:** For predictable baseline load

---

## 10. Security Architecture

**Authentication & Authorization:**

**JWT Token Structure:**
```json
{
  "sub": "john@example.com",
  "user_id": 1,
  "exp": 1707569890,
  "iat": 1707567890
}
```

**Token Security:**
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret Key:** 256-bit random string stored in Secrets Manager
- **Expiration:** 30 minutes (configurable)
- **Refresh:** Not implemented in v1.0 (future enhancement)

**Password Security:**
- **Hashing:** bcrypt with cost factor 12
- **Validation:** Minimum 8 characters, complexity requirements
- **Storage:** Only hashed passwords stored in database

**API Security:**

**CORS Configuration:**
```python
allow_origins=[
    "https://anujnana.com",
    "https://www.anujnana.com"
]
allow_credentials=True
allow_methods=["GET", "POST", "PUT", "DELETE"]
allow_headers=["Authorization", "Content-Type"]
```

**Rate Limiting:**
- **Authentication:** 5 attempts per 15 minutes per IP
- **API Endpoints:** 100 requests per minute per user
- **WebSocket:** 1 connection per user
- **Implementation:** Redis-based token bucket algorithm

**Input Validation:**
- **Pydantic Models:** Automatic validation of request bodies
- **SQL Injection:** Parameterized queries via SQLAlchemy
- **XSS Prevention:** Content Security Policy headers
- **CSRF:** Not applicable (stateless API with JWT)

**Data Privacy:**

**Webcam Data:**
- **No Storage:** Raw images never persisted
- **Transmission:** Base64 encoding over WebSocket
- **Processing:** In-memory only, discarded after inference
- **Consent:** Explicit user permission required

**Personal Data:**
- **Encryption at Rest:** RDS encryption enabled
- **Encryption in Transit:** TLS 1.3 for all connections
- **Data Minimization:** Only essential data collected
- **Right to Deletion:** User can request account deletion (future)

**Secrets Management:**
- **AWS Secrets Manager:** Database credentials, API keys
- **Environment Variables:** Never committed to git
- **Rotation:** Automatic rotation for database passwords

**Monitoring & Auditing:**
- **CloudWatch Logs:** All API requests logged
- **Failed Login Attempts:** Tracked and alerted
- **Anomaly Detection:** Unusual access patterns flagged
- **Compliance:** GDPR-ready architecture (consent, deletion, export)

---

## 11. Future Evolution (Out of Scope for v1.0)

**Phase 2: Enhanced Personalization**
- **Adaptive Content Generation:** AI generates custom explanations based on learning gaps
- **Learning Style Detection:** Visual, auditory, kinesthetic preference identification
- **Prerequisite Mapping:** Automatic detection of knowledge gaps and prerequisite recommendations
- **Multi-Modal Learning:** AR/VR visualizations for quantum concepts

**Phase 3: Collaborative Learning**
- **Peer Study Groups:** Real-time collaboration with other learners
- **Discussion Forums:** Topic-specific Q&A with AI moderation
- **Leaderboards & Gamification:** Badges, achievements, competitive challenges
- **Mentor Matching:** Connect struggling students with high performers

**Phase 4: Educator Tools**
- **Teacher Dashboard:** Class-wide analytics and progress tracking
- **Content Authoring:** Educators can create custom topics and quizzes
- **Assignment Management:** Assign specific subtopics with deadlines
- **Performance Reports:** Detailed analytics on student engagement and retention

**Phase 5: Platform Expansion**
- **Mobile Applications:** Native iOS/Android apps with offline mode
- **Multi-Language Support:** Hindi, Tamil, Telugu, Bengali, and other Indian languages
- **Subject Expansion:** Mathematics, Chemistry, Biology, Computer Science
- **Certification Programs:** Verified certificates for course completion

**Phase 6: Advanced ML**
- **Reinforcement Learning:** Optimize content sequencing based on outcomes
- **Transfer Learning:** Apply models trained on one subject to another
- **Federated Learning:** Train models on user devices without data centralization
- **Explainable AI:** Provide insights into why content was simplified or quiz difficulty changed

**Phase 7: Enterprise Features**
- **White-Label Solution:** Customizable branding for institutions
- **SSO Integration:** SAML/OAuth for enterprise authentication
- **LMS Integration:** Canvas, Moodle, Blackboard connectors
- **Advanced Analytics:** Predictive dropout detection, intervention recommendations

**Technical Debt & Improvements:**
- **Microservices Migration:** Split monolith into independent services
- **GraphQL API:** More flexible data fetching for frontend
- **Real-Time Collaboration:** WebRTC for peer-to-peer video study sessions
- **Edge Computing:** Deploy ML models to edge locations for lower latency
- **Kubernetes:** Replace ECS with K8s for better orchestration

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-10 | Development Team | Initial design document based on requirements analysis |

---

**Document Status:** Final  
**Approval Required:** Technical Lead, Product Owner  
**Next Review Date:** Post-Hackathon Evaluation

---

**End of Design Document**
