import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import EngagementMonitor from '../Tracking/EngagementMonitor';
import AttentionPopup from './AttentionPopup';
import api from '../../utils/api';

export default function VideoPlayer({ videoUrl, onClose }) {
  const { user } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const videoRef = useRef(null);
  const videoId = videoUrl.split('/').pop();

  const handleEngagementUpdate = async (score) => {
    if (score < 0.3 && !isPaused) {
      // Low engagement detected
      const currentTime = Math.floor(videoRef.current?.currentTime || 0);
      
      try {
        const response = await api.checkVideoEngagement({
          user_id: user.user_id,
          video_id: videoId,
          timestamp: currentTime,
          engagement_score: score
        });

        if (response.data.action === 'pause' && response.data.question) {
          videoRef.current?.pause();
          setIsPaused(true);
          setCurrentQuestion(response.data.question);
          setShowQuestion(true);
        }
      } catch (error) {
        console.error('Failed to check video engagement:', error);
      }
    }
  };

  const handleAnswerSubmit = async (isCorrect) => {
    const currentTime = Math.floor(videoRef.current?.currentTime || 0);
    
    try {
      const response = await api.recordVideoAnswer({
        user_id: user.user_id,
        video_id: videoId,
        timestamp: currentTime,
        answer_correct: isCorrect
      });

      if (!isCorrect && response.data.rewind_seconds > 0) {
        // Rewind video
        videoRef.current.currentTime -= response.data.rewind_seconds;
      }

      setShowQuestion(false);
      setIsPaused(false);
      videoRef.current?.play();
    } catch (error) {
      console.error('Failed to record answer:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <EngagementMonitor onEngagementUpdate={handleEngagementUpdate} />

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        {showQuestion && currentQuestion && (
          <AttentionPopup
            question={currentQuestion}
            onAnswer={handleAnswerSubmit}
          />
        )}
      </div>
    </div>
  );
}