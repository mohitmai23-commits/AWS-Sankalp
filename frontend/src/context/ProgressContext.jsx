import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [lastTopic, setLastTopic] = useState(null);
  const [lastSubtopic, setLastSubtopic] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/content/progress/${user.user_id}`);
      setProgress(response.data.progress);
      setLastTopic(response.data.last_topic);
      setLastSubtopic(response.data.last_subtopic);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (topic, subtopic, isCompleted = false) => {
    if (!user) return;
    
    try {
      await axios.post('/api/content/progress/update', {
        user_id: user.user_id,
        topic,
        subtopic,
        is_completed: isCompleted
      });
      
      await fetchProgress();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const value = {
    progress,
    lastTopic,
    lastSubtopic,
    loading,
    updateProgress,
    refreshProgress: fetchProgress
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};