import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

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
      const response = await api.getProgress(user.user_id);
      setProgress(response.data.progress);
      setLastTopic(response.data.last_topic);
      setLastSubtopic(response.data.last_subtopic);
      console.log('📊 Progress refreshed:', response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (topic, subtopic, isCompleted = false) => {
    if (!user) {
      console.warn('⚠️ No user found, cannot update progress');
      return;
    }
    
    try {
      console.log('📝 Updating progress:', { topic, subtopic, isCompleted });
      
      const response = await api.updateProgress({
        user_id: user.user_id,
        topic,
        subtopic,
        is_completed: isCompleted
      });
      
      console.log('✅ Progress updated:', response.data);
      
      // Immediately refresh progress to update UI
      await fetchProgress();
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update progress:', error);
      throw error;
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