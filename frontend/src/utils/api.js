import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

axios.defaults.baseURL = API_URL;

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const api = {
  // Auth
  register: (data) => axios.post('/auth/register', data),
  login: (data) => axios.post('/auth/login', data),
  
  // Content
  getProgress: (userId) => axios.get(`/content/progress/${userId}`),
  updateProgress: (data) => axios.post('/content/progress/update', data),
  trackInteraction: (data) => axios.post('/content/track', data),
  
  // Cognitive Load
  checkCognitiveLoad: (data) => axios.post('/cognitive-load/check', data),
  
  // Engagement
  checkVideoEngagement: (data) => axios.post('/engagement/video-check', data),
  recordVideoAnswer: (data) => axios.post('/engagement/video-answer', data),
  
  // Quiz
  submitQuiz: (data) => axios.post('/quiz/submit', data),
  
  // Audio
  generateAudio: (data) => axios.post('/audio/generate-summary', data),
  getCachedAudio: (subtopicId) => axios.get(`/audio/${subtopicId}`),
  
  // Notifications
  getNotifications: (userId) => axios.get(`/notifications/${userId}`),
  markNotificationRead: (notifId) => axios.post(`/notifications/${notifId}/mark-read`)
};

export default api;