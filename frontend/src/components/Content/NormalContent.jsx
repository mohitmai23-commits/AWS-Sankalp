import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PLACEHOLDER_CONTENT, COGNITIVE_LOAD_CHECK_INTERVAL } from '../../utils/constants';
import BottomActionBar from './BottomActionBar';
import ContentSidebar from './ContentSidebar';
import IntersectionObserverWrapper from '../Tracking/IntersectionObserverWrapper';
import EngagementMonitor from '../Tracking/EngagementMonitor';
import api from '../../utils/api';

export default function NormalContent({ topic, subtopic }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cognitiveLoad, setCognitiveLoad] = useState(null);
  const [engagementScore, setEngagementScore] = useState(0.7);
  const [interactionData, setInteractionData] = useState({});
  const checkInterval = useRef(null);

  const content = PLACEHOLDER_CONTENT[subtopic] || {
    title: `Subtopic ${subtopic}`,
    normal: '<p>Content coming soon...</p>',
    video_url: ''
  };

  useEffect(() => {
    // Start periodic cognitive load checks
    checkInterval.current = setInterval(() => {
      checkCognitiveLoad();
    }, COGNITIVE_LOAD_CHECK_INTERVAL);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [engagementScore, interactionData]);

  const checkCognitiveLoad = async () => {
    if (!user) return;

    try {
      const response = await api.checkCognitiveLoad({
        user_id: user.user_id,
        subtopic_id: subtopic,
        engagement_score: engagementScore,
        scroll_data: interactionData.scroll || {},
        hover_data: interactionData.hover || {},
        time_data: interactionData.time || {},
        mouse_data: interactionData.mouse || {}
      });

      const { cognitive_load, action, quiz_type } = response.data;
      
      if (action === 'simplify') {
        // Show transition message
        alert("Let's simplify this for better understanding...");
        navigate(`/physics/${topic}/${subtopic}/simplified`);
      }

      setCognitiveLoad(cognitive_load);
    } catch (error) {
      console.error('Failed to check cognitive load:', error);
    }
  };

  const handleInteractionUpdate = (data) => {
    setInteractionData(prev => ({ ...prev, ...data }));
  };

  const handleEngagementUpdate = (score) => {
    setEngagementScore(score);
  };

  const handleTakeQuiz = () => {
    const quizType = cognitiveLoad === 'HIGH' ? 'easy' : 'hard';
    navigate(`/physics/${topic}/${subtopic}/quiz/${quizType}`);
  };

  return (
    <div className="flex h-screen">
      <ContentSidebar topic={topic} currentSubtopic={subtopic} />
      
      <div className="flex-1 overflow-y-auto pb-20">
        <EngagementMonitor onEngagementUpdate={handleEngagementUpdate} />
        
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">{content.title}</h1>
          
          <IntersectionObserverWrapper onInteractionUpdate={handleInteractionUpdate}>
            <div dangerouslySetInnerHTML={{ __html: content.normal }} />
          </IntersectionObserverWrapper>
        </div>
      </div>

      <div className="w-80 border-l border-gray-200 p-4">
        <h3 className="font-semibold mb-4">Chat Assistant</h3>
        <p className="text-sm text-gray-600">Chatbot coming soon...</p>
      </div>

      <BottomActionBar
        videoUrl={content.video_url}
        subtopicId={subtopic}
        onTakeQuiz={handleTakeQuiz}
      />
    </div>
  );
}