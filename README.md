# AnuJnana - Adaptive Learning Platform

An AI-powered adaptive learning platform for Quantum Mechanics that dynamically adjusts content complexity based on real-time cognitive load detection and predicts memory retention for personalized revision reminders.

## 🎯 Features

- **Dual Model Monitoring**: Real-time cognitive load prediction using engagement detection (webcam) + interaction tracking
- **Adaptive Content**: Automatic UI simplification when high cognitive load detected
- **AI-Generated Audio Summaries**: Gemini 2.0 Flash generates simplified explanations with analogies
- **Video Engagement Monitoring**: Auto-pause videos when attention drops + attention-recovery questions
- **Memory Retention Prediction**: ML-powered prediction of when users will forget content
- **Automated Revision Reminders**: Email notifications via Twilio SendGrid at optimal intervals
- **Session Persistence**: Resume learning from exactly where you left off

## 🏗️ Architecture

### Backend Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **ML Models**: 
  - Cognitive Load Predictor (XGBoost Classifier)
  - Engagement Detector (Pre-trained Ensemble on FER-2013)
  - Memory Retention Predictor (XGBoost Regressor)
- **ML Tracking**: MLflow
- **AI Services**:
  - Google Gemini 2.0 Flash (audio summary generation)
  - Google Cloud Text-to-Speech (audio narration)
- **Email**: Twilio SendGrid
- **Storage**: Google Cloud Storage / AWS S3
- **Background Jobs**: Celery + Redis

### Frontend Stack
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API
- **Video/Audio**: HTML5 Media APIs
- **Webcam**: react-webcam

### ML Models

1. **Cognitive Load Prediction Model**
   - **Algorithm**: XGBoost Classifier
   - **Input Features**: Engagement score, scroll patterns, hover duration, reading time, mouse movements, etc.
   - **Output**: Binary (HIGH/LOW cognitive load)
   - **Training**: EdNet-KT1 dataset

2. **Engagement Detection Model** (Pre-trained)
   - **Algorithm**: Ensemble (Random Forest + XGBoost + Extra Trees)
   - **Training Dataset**: FER-2013
   - **Output**: Engagement score (0.0 to 1.0)

3. **Memory Retention Prediction Model**
   - **Algorithm**: XGBoost Regressor
   - **Input Features**: Quiz score, quiz type, engagement, cognitive load history, video/audio usage
   - **Output**: Days until revision needed (1-30)
   - **Training**: EdNet-KT3 or synthetic data based on Ebbinghaus curve

## 📁 Project Structure

```
adaptive-learning-platform/
│
├── backend/
│   ├── app/
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routes/              # API endpoints
│   │   ├── ml_models/           # ML model loaders & predictors
│   │   ├── services/            # External services (Gemini, TTS, Email, Storage)
│   │   ├── tasks/               # Celery background tasks
│   │   ├── config.py            # Settings
│   │   ├── database.py          # DB connection
│   │   └── main.py              # FastAPI app
│   │
│   ├── ml_training/             # Model training scripts
│   │   ├── train_cognitive_load.py
│   │   ├── train_memory_retention.py
│   │   └── mlflow_config.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Content/
│   │   │   ├── Quiz/
│   │   │   └── Tracking/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── tailwind.config.js
│
├── models/                      # Trained ML models
├── data/                        # Datasets (not in git)
├── mlruns/                      # MLflow experiments
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis (for Celery)
- Google Cloud Account (for Gemini API, TTS, Storage)
- Twilio SendGrid Account

### Backend Setup

1. **Clone repository and navigate to backend**
   ```bash
   cd adaptive-learning-platform/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Setup PostgreSQL database**
   ```bash
   createdb adaptive_learning
   ```

6. **Run database migrations** (creates all tables)
   ```bash
   python -c "from app.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
   ```

7. **Train ML models**
   ```bash
   # Start MLflow server first
   mlflow server --host 0.0.0.0 --port 5000

   # In another terminal
   cd ml_training
   python train_cognitive_load.py
   python train_memory_retention.py
   ```

8. **Copy pre-trained engagement model**
   ```bash
   # Copy the engagement model from train_model__1_.py output
   cp path/to/engagement_model.pkl ../models/
   ```

9. **Start Redis** (for Celery)
   ```bash
   redis-server
   ```

10. **Start Celery worker** (for background tasks)
    ```bash
    celery -A app.tasks worker --loglevel=info
    celery -A app.tasks beat --loglevel=info  # For cron jobs
    ```

11. **Run backend server**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd adaptive-learning-platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access application**
   ```
   http://localhost:5173
   ```

## 📊 Database Schema

### Key Tables

- **users**: User accounts
- **progress**: Learning progress tracking
- **cognitive_loads**: Cognitive load readings
- **quiz_results**: Quiz attempts and scores
- **memory_predictions**: Retention predictions and reminders
- **notifications**: In-app notifications
- **interaction_logs**: User interaction data
- **audio_summaries**: Cached audio files
- **video_engagements**: Video watching data
- **video_questions**: Pre-stored attention questions
- **audio_playbacks**: Audio listening data

## 🔄 User Flow

1. **Sign Up** → Password sent to email
2. **Login** → Dashboard with 3 physics topics
3. **Select Topic** → Choose subtopic (e.g., Tunnelling 3.1)
4. **Normal Content** → Dual monitoring starts:
   - Engagement model (webcam)
   - Cognitive load model (interactions)
5. **If HIGH CL** → Redirect to simplified content
6. **Watch Video** → Engagement monitoring continues
   - Low engagement → Video pauses + attention question
7. **Listen to Audio** → Gemini generates + TTS plays
8. **Take Quiz**:
   - HIGH CL → Easy Quiz
   - LOW CL → Hard Quiz
9. **Memory Prediction** → Predicts forgetting in X days
10. **Email Sent** → Immediate notification + Day X reminder
11. **Continue** → Next subtopic or logout (session saved)
12. **Revision Reminder** → Email on Day X → Review content

## 🎓 Physics Topics

1. **Infinite Potential Well** (subtopics 1.1, 1.2, 1.3, ...)
2. **Finite Potential Well** (subtopics 2.1, 2.2, 2.3, ...)
3. **Tunnelling Effect** (subtopics 3.1, 3.2, 3.3, ...)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Cognitive Load
- `POST /api/cognitive-load/check` - Check cognitive load
- `GET /api/cognitive-load/history/{subtopic_id}` - Get history

### Quiz
- `POST /api/quiz/submit` - Submit quiz + trigger memory prediction
- `GET /api/quiz/questions/{subtopic_id}/{type}` - Get quiz questions

### Audio
- `POST /api/audio/generate-summary` - Generate AI audio summary
- `GET /api/audio/{subtopic_id}` - Get cached audio

### Engagement
- `POST /api/engagement/video-check` - Monitor video engagement
- `POST /api/engagement/update` - Update engagement score

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/update` - Update progress

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications/mark-read/{notif_id}` - Mark as read

## 📈 MLflow Tracking

View experiments at: `http://localhost:5000`

Tracked metrics:
- Model accuracy
- Cross-validation scores
- Feature importance
- Training time
- Model parameters

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Example: Heroku/AWS/GCP)
```bash
# Build Docker image
docker build -t physics-whisperer-backend .

# Deploy to cloud
# Follow your cloud provider's documentation
```

### Frontend (Example: Vercel/Netlify)
```bash
# Build production
npm run build

# Deploy dist/ folder
```

## 📝 Environment Variables

See `.env.example` files in backend and frontend directories.

### Critical Variables:
- `DATABASE_URL` - PostgreSQL connection
- `SECRET_KEY` - JWT secret
- `GEMINI_API_KEY` - Gemini 2.0 Flash API key
- `SENDGRID_API_KEY` - SendGrid API key
- `GOOGLE_APPLICATION_CREDENTIALS` - GCP service account JSON

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- EdNet dataset for cognitive load training
- FER-2013 dataset for engagement detection
- Google Gemini and Cloud TTS for AI services
- Twilio SendGrid for email notifications

---

**Built with ❤️ for adaptive learning in Quantum Mechanics**