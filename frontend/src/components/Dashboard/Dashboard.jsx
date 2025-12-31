import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import ProgressCard from './ProgressCard';
import NotificationPanel from './NotificationPanel';
import { TOPICS } from '../../utils/constants';
import { calculateProgress } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { progress, lastTopic, lastSubtopic, loading } = useProgress();
  const navigate = useNavigate();

  const handleContinueLearning = () => {
    if (lastTopic && lastSubtopic) {
      const topicKey = Object.keys(TOPICS).find(
        key => TOPICS[key].name === lastTopic
      );
      navigate(`/physics/${topicKey}/${lastSubtopic}`);
    } else {
      navigate('/physics');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">Continue your quantum mechanics journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ProgressCard
          lastTopic={lastTopic}
          lastSubtopic={lastSubtopic}
          onContinue={handleContinueLearning}
        />
        <NotificationPanel userId={user.user_id} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Your Topics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(TOPICS).map(([key, topic]) => {
            const progressPercent = calculateProgress(progress, topic.name);
            
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => navigate('/physics')}>
                <h3 className="font-semibold text-lg mb-2">{topic.name}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{progressPercent}% Complete</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}