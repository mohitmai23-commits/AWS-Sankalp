# Requirements Document: AnuJnana - Adaptive Learning Platform

## Project Overview

**Project Name:** AnuJnana  
**Hackathon:** AWS AI for Bharat  
**Domain:** Educational Technology (EdTech) - Quantum Mechanics Learning  
**Version:** 1.0.0

---

## 1. Problem Statement

Traditional e-learning platforms deliver static, one-size-fits-all content that fails to adapt to individual learners' cognitive states and retention patterns. This approach leads to:

- **Cognitive Overload:** Students struggle with complex quantum mechanics concepts without real-time difficulty adjustment
- **Poor Retention:** Lack of personalized revision schedules results in forgetting learned material
- **Disengagement:** No mechanism to detect and respond to declining student attention during video lectures
- **Ineffective Assessment:** Fixed-difficulty quizzes don't match students' current comprehension levels
- **Limited Accessibility:** Complex technical content lacks simplified alternatives for struggling learners

In the context of Bharat's growing digital education landscape, there is a critical need for AI-powered adaptive learning systems that can democratize access to advanced STEM education, particularly in challenging subjects like quantum mechanics.

---

## 2. Proposed Solution

AnuJnana is an AI-powered adaptive learning platform that dynamically adjusts educational content based on real-time cognitive load detection and predicts optimal revision intervals using machine learning. The system implements a dual-monitoring approach combining webcam-based engagement detection with interaction pattern analysis to provide personalized learning experiences.

### Core Innovation

The platform employs three specialized ML models working in concert:

1. **Cognitive Load Predictor (XGBoost Classifier)** - Analyzes user interaction patterns to detect cognitive overload
2. **Engagement Detector (Ensemble Model)** - Monitors facial expressions via webcam to assess attention levels
3. **Memory Retention Predictor (XGBoost Regressor)** - Forecasts forgetting curves and schedules personalized revision reminders

### Key Differentiators

- Real-time content simplification when cognitive load is detected as HIGH
- Automatic video pausing with attention-recovery questions when engagement drops
- AI-generated audio summaries using Google Gemini 2.0 Flash with analogies and simplified explanations
- Adaptive quiz difficulty selection based on cognitive state
- Automated email reminders at scientifically predicted optimal revision intervals

---

## 3. Objectives

### Primary Objectives

1. **Adaptive Content Delivery:** Automatically adjust content complexity based on real-time cognitive load assessment
2. **Engagement Optimization:** Maintain student attention through proactive intervention during video lectures
3. **Memory Retention Enhancement:** Predict and prevent knowledge decay through timely revision reminders
4. **Personalized Assessment:** Deliver quizzes matched to individual cognitive capacity
5. **Accessibility Improvement:** Provide simplified content alternatives with AI-generated audio explanations

### Secondary Objectives

1. Track and visualize learning progress across quantum mechanics topics
2. Identify weak areas through quiz performance analysis
3. Enable session persistence for seamless learning continuity
4. Provide comprehensive analytics on cognitive load patterns and engagement trends

---

## 4. Target Users

### Primary Users

- **Undergraduate Physics Students:** Learning quantum mechanics fundamentals (Infinite Potential Well, Finite Potential Well, Tunnelling Effect)
- **Self-Learners:** Individuals pursuing quantum physics education independently
- **Students in Tier 2/3 Cities:** Learners with limited access to quality physics instruction

### User Characteristics

- Age: 18-25 years
- Education Level: Undergraduate (B.Sc./B.Tech Physics/Engineering)
- Technical Proficiency: Basic computer literacy, comfortable with web applications
- Learning Context: Self-paced online learning, potentially with limited instructor support
- Device Access: Laptop/desktop with webcam, stable internet connection

---

## 5. Functional Requirements

### 5.1 User Authentication & Management

**FR-1.1:** User Registration
- System shall allow new users to register with name, email, and password
- System shall send auto-generated password to user's email upon successful registration
- System shall validate email uniqueness before account creation
- System shall hash passwords using bcrypt before storage

**FR-1.2:** User Login
- System shall authenticate users using email and password credentials
- System shall generate JWT access tokens with configurable expiration (default: 30 minutes)
- System shall maintain user session across page refreshes

**FR-1.3:** User Profile
- System shall store user information including name, email, and creation timestamp
- System shall provide API endpoint to retrieve current user details

### 5.2 Content Delivery & Adaptation

**FR-2.1:** Topic Structure
- System shall organize content into 3 main topics:
  - Infinite Potential Well
  - Finite Potential Well
  - Tunnelling Effect
- Each topic shall contain multiple subtopics (e.g., 1.1, 1.2, 2.1, 3.1)

**FR-2.2:** Normal Content Display
- System shall display standard complexity content including:
  - Text explanations with mathematical equations
  - Embedded video lectures
  - Interactive elements (hover, scroll)
- System shall track user interactions (scroll speed, depth, hover duration, mouse movements)

**FR-2.3:** Simplified Content Display
- System shall provide simplified versions of all content
- Simplified content shall:
  - Use conversational language
  - Break down complex equations into plain language
  - Include visual analogies
  - Reduce mathematical notation density

**FR-2.4:** Content Routing
- System shall automatically redirect users to simplified content when HIGH cognitive load is detected
- System shall allow manual navigation between normal and simplified versions

### 5.3 Cognitive Load Detection

**FR-3.1:** Real-Time Monitoring
- System shall continuously monitor user interactions during content consumption:
  - Scroll speed (pixels/second)
  - Scroll depth (percentage of content viewed)
  - Back-and-forth scrolling patterns
  - Hover duration on elements
  - Time spent on page
  - Mouse movement patterns (erratic vs. smooth)
  - Pause duration (time without interaction)

**FR-3.2:** Cognitive Load Prediction
- System shall use XGBoost Classifier trained on EdNet-KT1 dataset
- System shall predict cognitive load as binary classification: HIGH or LOW
- System shall provide confidence score for each prediction
- System shall only persist predictions with confidence > 50%

**FR-3.3:** Feature Engineering
- System shall compute 8 key features for prediction:
  - engagement_score (from webcam monitoring)
  - scroll_speed
  - scroll_depth
  - back_forth_scrolls
  - hover_duration_avg
  - time_spent
  - mouse_movement_erratic
  - pause_duration

**FR-3.4:** Adaptive Response
- System shall trigger content simplification when cognitive load is HIGH
- System shall store cognitive load history in database with timestamp and features
- System shall provide API endpoints to retrieve cognitive load history and statistics

### 5.4 Engagement Monitoring

**FR-4.1:** Webcam-Based Detection
- System shall capture webcam frames every 3 seconds during learning sessions
- System shall use pre-trained ensemble model (Random Forest + XGBoost + Extra Trees) trained on FER-2013 dataset
- System shall predict engagement score (0.0 to 1.0) from facial expressions
- System shall implement fallback heuristics using:
  - Face detection (presence indicates engagement)
  - Brightness variance (movement detection)
  - Image sharpness (focus detection)

**FR-4.2:** WebSocket Communication
- System shall establish WebSocket connection for real-time engagement streaming
- System shall send engagement scores to frontend every 3 seconds
- System shall handle connection failures gracefully

**FR-4.3:** Video Engagement Monitoring
- System shall track engagement during video playback
- System shall detect low engagement (score < threshold)
- System shall automatically pause video when engagement drops
- System shall display attention-recovery questions to re-engage learner

**FR-4.4:** Engagement Data Storage
- System shall store video engagement data including:
  - Video watch duration
  - Pause events
  - Engagement score trends
  - Attention question responses

### 5.5 AI-Generated Audio Summaries

**FR-5.1:** Summary Generation
- System shall use Google Gemini 2.0 Flash API to generate audio-friendly explanations
- Generated summaries shall:
  - Use conversational, friendly tone
  - Break down complex equations into simple language
  - Include 2-3 real-world analogies
  - Explain "why" concepts matter, not just "what"
  - Be suitable for 2-3 minute verbal narration
  - Avoid references to visual elements

**FR-5.2:** Fallback Mechanism
- System shall implement rule-based summarization when Gemini API fails or quota is exceeded
- Fallback shall:
  - Extract key sentences from content
  - Simplify technical terminology
  - Add conversational connectors
  - Maintain factual accuracy

**FR-5.3:** Text-to-Speech Conversion
- System shall use Google Cloud Text-to-Speech API to convert summaries to audio
- System shall cache generated audio files to avoid redundant API calls

**FR-5.4:** Audio Playback
- System shall provide audio player interface in content pages
- System shall track audio playback completion status

### 5.6 Adaptive Quiz System

**FR-6.1:** Quiz Type Selection
- System shall offer two quiz difficulty levels:
  - **Easy Quiz:** For users with HIGH cognitive load
  - **Hard Quiz:** For users with LOW cognitive load
- System shall recommend quiz type based on current cognitive state

**FR-6.2:** Quiz Content
- System shall store pre-defined questions for each subtopic
- Questions shall include:
  - Question text
  - Multiple choice options
  - Correct answer
  - Concept/topic tag
  - Difficulty level

**FR-6.3:** Quiz Submission
- System shall calculate quiz score (percentage correct)
- System shall track time taken to complete quiz
- System shall identify weak areas (concepts with wrong answers)
- System shall store quiz results with attempt number

**FR-6.4:** Quiz Analytics
- System shall provide detailed performance summary:
  - Score percentage
  - Correct/incorrect answer count
  - Time taken
  - Weak areas with concept names

### 5.7 Memory Retention Prediction

**FR-7.1:** Prediction Model
- System shall use XGBoost Regressor trained on ASSISTments dataset
- System shall predict days until forgetting (range: 3-14 days)
- System shall consider 7 input features:
  - quiz_score (primary feature)
  - quiz_type (easy=0, hard=1)
  - time_taken
  - engagement_avg
  - cognitive_load (low=0, high=1)
  - video_watched (boolean)
  - attempt_number

**FR-7.2:** Prediction Trigger
- System shall automatically generate memory prediction upon quiz submission
- System shall calculate reminder_date = current_date + predicted_days

**FR-7.3:** Prediction Storage
- System shall store predictions in database with:
  - user_id
  - subtopic_id
  - predicted_days
  - reminder_date
  - is_reminded flag
  - creation timestamp

### 5.8 Email Notification System

**FR-8.1:** Welcome Email
- System shall send password to user's email immediately after registration
- Email shall include:
  - Welcome message
  - User's password
  - Security reminder

**FR-8.2:** Immediate Quiz Results Email
- System shall send detailed quiz results email after quiz submission
- Email shall include:
  - Score percentage with visual formatting
  - Time taken
  - Correct/incorrect answer counts
  - Weak areas analysis with specific concepts
  - Memory retention prediction
  - Reminder schedule notification

**FR-8.3:** Revision Reminder Email
- System shall send automated revision reminders on predicted dates
- Email shall include:
  - Subtopic name
  - Motivational message
  - Direct link to content
  - Call-to-action button

**FR-8.4:** Email Delivery
- System shall use SMTP (Gmail) as primary email service
- System shall support Twilio SendGrid as alternative
- System shall handle email failures gracefully without blocking user operations

### 5.9 Progress Tracking

**FR-9.1:** Progress Recording
- System shall track user progress for each subtopic:
  - Last accessed timestamp
  - Completion status
  - Topic and subtopic identifiers

**FR-9.2:** Session Persistence
- System shall save progress automatically
- System shall allow users to resume from last accessed subtopic
- System shall update last_accessed timestamp on each visit

**FR-9.3:** Progress Dashboard
- System shall display user's learning progress
- System shall show completed and in-progress topics
- System shall provide navigation to continue learning

### 5.10 Notification System

**FR-10.1:** In-App Notifications
- System shall create notifications for:
  - Quiz completion
  - Memory predictions
  - Revision reminders
  - Cognitive load alerts

**FR-10.2:** Notification Management
- System shall store notifications with:
  - Type (info, warning, success)
  - Message content
  - Read/unread status
  - Timestamp

**FR-10.3:** Notification Display
- System shall provide API to fetch user notifications
- System shall allow marking notifications as read
- System shall display unread notification count

### 5.11 Chatbot Integration

**FR-11.1:** AI Chatbot
- System shall provide chatbot interface for student queries
- System shall integrate with AI service for natural language responses
- System shall maintain conversation context

**FR-11.2:** Chatbot Features
- System shall answer questions about quantum mechanics concepts
- System shall provide clarifications on content
- System shall suggest relevant learning resources

---

## 6. Non-Functional Requirements

### 6.1 Performance

**NFR-1.1:** Response Time
- API endpoints shall respond within 500ms for 95% of requests
- Cognitive load prediction shall complete within 200ms
- Engagement detection shall process frames within 1 second

**NFR-1.2:** Scalability
- System shall support at least 1000 concurrent users
- Database shall handle 10,000+ user records efficiently
- ML model inference shall scale horizontally

**NFR-1.3:** Real-Time Processing
- WebSocket connections shall maintain < 100ms latency
- Engagement monitoring shall update every 3 seconds
- Cognitive load checks shall occur every 5-10 seconds

### 6.2 Reliability

**NFR-2.1:** Availability
- System shall maintain 99% uptime during operational hours
- Database backups shall occur daily
- System shall recover from crashes within 5 minutes

**NFR-2.2:** Fault Tolerance
- System shall gracefully handle ML model loading failures
- System shall provide fallback mechanisms for external API failures (Gemini, TTS)
- System shall continue operation if email service is unavailable

**NFR-2.3:** Data Integrity
- System shall ensure ACID properties for database transactions
- System shall validate all user inputs before processing
- System shall prevent data loss during concurrent operations

### 6.3 Security

**NFR-3.1:** Authentication
- System shall use JWT tokens with secure secret keys
- Passwords shall be hashed using bcrypt (cost factor ≥ 10)
- Tokens shall expire after 30 minutes

**NFR-3.2:** Data Protection
- System shall use HTTPS for all client-server communication
- System shall sanitize user inputs to prevent SQL injection
- System shall implement CORS policies to restrict unauthorized access

**NFR-3.3:** Privacy
- System shall not store raw webcam images
- System shall only store engagement scores, not facial data
- System shall comply with data protection regulations

### 6.4 Usability

**NFR-4.1:** User Interface
- UI shall be responsive and work on desktop browsers (Chrome, Firefox, Safari)
- UI shall use intuitive navigation with clear visual hierarchy
- UI shall provide immediate feedback for user actions

**NFR-4.2:** Accessibility
- System shall support keyboard navigation
- System shall use semantic HTML for screen readers
- System shall provide text alternatives for video content (audio summaries)

**NFR-4.3:** Learning Curve
- New users shall complete registration and start learning within 5 minutes
- System shall provide clear instructions for webcam permissions
- System shall display helpful tooltips for key features

### 6.5 Maintainability

**NFR-5.1:** Code Quality
- Backend code shall follow PEP 8 Python style guidelines
- Frontend code shall follow React best practices
- Code shall include docstrings and comments for complex logic

**NFR-5.2:** Modularity
- System shall use modular architecture with clear separation of concerns
- ML models shall be independently trainable and deployable
- Services shall be loosely coupled

**NFR-5.3:** Logging
- System shall log all errors with stack traces
- System shall log ML model predictions with confidence scores
- System shall log API requests and responses for debugging

### 6.6 Compatibility

**NFR-6.1:** Browser Support
- System shall support Chrome 90+, Firefox 88+, Safari 14+
- System shall require webcam access for engagement monitoring
- System shall work on screen resolutions 1280x720 and above

**NFR-6.2:** Database
- System shall use PostgreSQL 14+ for data persistence
- System shall support database migrations for schema updates

**NFR-6.3:** External Services
- System shall integrate with Google Gemini 2.0 Flash API
- System shall integrate with Google Cloud Text-to-Speech API
- System shall integrate with SMTP/SendGrid for email delivery

---

## 7. Assumptions

### 7.1 User Environment

- Users have access to a laptop/desktop with functional webcam
- Users have stable internet connection (minimum 2 Mbps)
- Users grant webcam permissions when prompted
- Users have valid email addresses for notifications

### 7.2 Technical Infrastructure

- PostgreSQL database is properly configured and accessible
- Google Cloud credentials are valid and have sufficient quota
- SMTP/SendGrid credentials are configured correctly
- Redis server is running for background job processing (Celery)

### 7.3 Data Availability

- EdNet-KT1 dataset is available for cognitive load model training
- ASSISTments dataset is available for memory retention model training
- FER-2013 dataset is available for engagement model training (pre-trained model provided)

### 7.4 Content

- Quantum mechanics content (text, videos, quizzes) is pre-created and stored
- Video files are hosted and accessible via URLs
- Quiz questions are manually curated and validated by domain experts

### 7.5 ML Models

- Pre-trained engagement detection model is available
- Cognitive load and memory retention models are trained before deployment
- Model accuracy meets minimum thresholds (>70% for classification, MAE <3 days for regression)

---

## 8. Constraints

### 8.1 Technical Constraints

- **Programming Languages:** Backend must use Python 3.10+, Frontend must use React 18+
- **Framework:** Backend must use FastAPI for API development
- **Database:** Must use PostgreSQL (no NoSQL alternatives)
- **ML Framework:** Must use XGBoost for cognitive load and memory retention models
- **Deployment:** Must be deployable on AWS infrastructure (for hackathon requirement)

### 8.2 Resource Constraints

- **API Quotas:** Google Gemini API has rate limits (fallback required)
- **Storage:** Limited cloud storage for audio files (caching strategy required)
- **Compute:** ML model inference must run on CPU (no GPU requirement)
- **Email:** SMTP has daily sending limits (batch processing for reminders)

### 8.3 Time Constraints

- **Development Timeline:** Project developed for hackathon (limited time for extensive testing)
- **Model Training:** Training time limited by dataset size and compute resources
- **Content Creation:** Limited to 3 main topics with multiple subtopics

### 8.4 Scope Constraints

- **Subject Domain:** Limited to Quantum Mechanics (3 topics only)
- **Language:** Content and UI in English only
- **Device Support:** Desktop/laptop only (no mobile optimization)
- **Webcam Requirement:** Engagement monitoring requires webcam (no alternative input)

### 8.5 Regulatory Constraints

- **Data Privacy:** Must comply with data protection regulations (no storage of facial images)
- **Educational Standards:** Content must be scientifically accurate
- **Accessibility:** Should follow WCAG guidelines where feasible

---

## 9. Success Metrics

### 9.1 Learning Effectiveness

- **Metric:** Average quiz score improvement across attempts
- **Target:** 15% improvement from first to second attempt
- **Measurement:** Compare quiz scores for same subtopic across attempts

- **Metric:** Retention rate after revision reminders
- **Target:** 70% of users revisit content after receiving reminder email
- **Measurement:** Track content access after reminder_date

### 9.2 Engagement

- **Metric:** Average engagement score during learning sessions
- **Target:** Maintain engagement score > 0.7 for 80% of session duration
- **Measurement:** Calculate mean engagement score from webcam monitoring

- **Metric:** Video completion rate
- **Target:** 75% of users complete video lectures
- **Measurement:** Track video watch duration vs. total video length

### 9.3 Cognitive Load Management

- **Metric:** Percentage of sessions with HIGH cognitive load
- **Target:** < 30% of sessions trigger HIGH cognitive load
- **Measurement:** Count HIGH vs. LOW cognitive load predictions

- **Metric:** Content simplification effectiveness
- **Target:** 60% of users complete simplified content after HIGH cognitive load detection
- **Measurement:** Track completion rate for simplified vs. normal content

### 9.4 System Performance

- **Metric:** API response time (95th percentile)
- **Target:** < 500ms
- **Measurement:** Monitor API endpoint latency

- **Metric:** ML model prediction accuracy
- **Target:** Cognitive Load: >75%, Memory Retention: MAE <3 days
- **Measurement:** Evaluate on test datasets

### 9.5 User Satisfaction

- **Metric:** User retention rate
- **Target:** 60% of users return for second session within 7 days
- **Measurement:** Track unique user logins over time

- **Metric:** Feature adoption rate
- **Target:** 80% of users utilize audio summaries, 70% complete quizzes
- **Measurement:** Track feature usage per user

### 9.6 Business Metrics

- **Metric:** User registration rate
- **Target:** 500+ registrations during hackathon demo period
- **Measurement:** Count new user accounts

- **Metric:** Email delivery success rate
- **Target:** >95% of emails delivered successfully
- **Measurement:** Monitor SMTP/SendGrid delivery reports

---

## 10. Future Enhancements (Out of Scope for v1.0)

- **Mobile Application:** Native iOS/Android apps for mobile learning
- **Multi-Language Support:** Hindi, Tamil, Telugu, and other Indian languages
- **Additional Subjects:** Expand beyond quantum mechanics to other STEM topics
- **Collaborative Learning:** Peer-to-peer discussion forums and study groups
- **Gamification:** Badges, leaderboards, and achievement systems
- **Advanced Analytics:** Detailed learning analytics dashboard for educators
- **Offline Mode:** Download content for offline access
- **Voice-Based Interaction:** Voice commands for hands-free learning
- **AR/VR Integration:** Immersive 3D visualizations of quantum concepts
- **Adaptive Content Generation:** AI-generated content based on individual learning gaps

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-10 | Development Team | Initial requirements document based on codebase analysis |

---

**Document Status:** Final  
**Approval Required:** Product Owner, Technical Lead  
**Next Review Date:** Post-Hackathon Evaluation
