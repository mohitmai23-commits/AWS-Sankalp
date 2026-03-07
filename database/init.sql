-- Initialize database schema

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress (
    progress_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255) NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS cognitive_load (
    cl_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subtopic_id VARCHAR(50) NOT NULL,
    load_level VARCHAR(20) NOT NULL,
    engagement_score FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    features JSONB
);

CREATE TABLE IF NOT EXISTS quiz_results (
    quiz_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subtopic_id VARCHAR(50) NOT NULL,
    quiz_type VARCHAR(20) NOT NULL,
    score FLOAT NOT NULL,
    time_taken INTEGER NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subtopic_id VARCHAR(50) NOT NULL,
    predicted_days INTEGER NOT NULL,
    reminder_date TIMESTAMP NOT NULL,
    is_reminded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS video_questions (
    vq_id SERIAL PRIMARY KEY,
    video_id VARCHAR(100) NOT NULL,
    timestamp INTEGER NOT NULL,
    question_text VARCHAR(500) NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audio_summaries (
    audio_id SERIAL PRIMARY KEY,
    subtopic_id VARCHAR(50) NOT NULL,
    content_hash VARCHAR(64) UNIQUE NOT NULL,
    audio_url VARCHAR(500) NOT NULL,
    simplified_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT,
    duration_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS video_engagement (
    ve_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    video_id VARCHAR(100) NOT NULL,
    timestamp INTEGER NOT NULL,
    engagement_score FLOAT NOT NULL,
    was_paused BOOLEAN DEFAULT FALSE,
    question_shown BOOLEAN DEFAULT FALSE,
    answer_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notif_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS interaction_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subtopic_id VARCHAR(50) NOT NULL,
    mouse_data JSONB,
    scroll_data JSONB,
    hover_data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_cognitive_load_user ON cognitive_load(user_id);
CREATE INDEX idx_quiz_user ON quiz_results(user_id);
CREATE INDEX idx_memory_predictions_reminder ON memory_predictions(reminder_date, is_reminded);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);