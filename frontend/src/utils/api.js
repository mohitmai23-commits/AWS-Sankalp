import axios from 'axios';

// IMPORTANT: Do NOT add /api suffix here, routes already include it
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

axios.defaults.baseURL = API_URL;

// Request interceptor to add token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // Auth - WITH /api prefix
  register: (data) => axios.post('/api/auth/register', data),
  login: (data) => axios.post('/api/auth/login', data),
  
  // Content
  getProgress: (userId) => axios.get(`/api/content/progress/${userId}`),
  updateProgress: (data) => axios.post('/api/content/progress/update', data),
  trackInteraction: (data) => axios.post('/api/content/track', data),
  
  // Cognitive Load
  checkCognitiveLoad: (data) => axios.post('/api/cognitive-load/check', data),
  
  // Engagement
  checkVideoEngagement: (data) => axios.post('/api/engagement/video-check', data),
  recordVideoAnswer: (data) => axios.post('/api/engagement/video-answer', data),
  detectEngagement: (data) => axios.post('/api/engagement/detect', data),
  
  // Quiz
  submitQuiz: (data) => axios.post('/api/quiz/submit', data),
  
  // Audio
  generateAudio: (data) => axios.post('/api/audio/generate-summary', data),
  getCachedAudio: (subtopicId) => axios.get(`/api/audio/${subtopicId}`),
  
  // Notifications
  getNotifications: (userId) => axios.get(`/api/notifications/${userId}`),
  markNotificationRead: (notifId) => axios.post(`/api/notifications/${notifId}/mark-read`),
  
  // Chatbot
  askChatbot: (data) => axios.post('/api/chatbot/ask', data),
  getChatbotTopics: () => axios.get('/api/chatbot/topics')
};

export default api;