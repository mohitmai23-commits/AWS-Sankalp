import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { TOPICS } from '../utils/constants';
import { calculateProgress } from '../utils/helpers';
import Navbar from '../components/Common/Navbar';

export default function PhysicsHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress } = useProgress();

  const handleSubtopicClick = (topic, subtopic) => {
    navigate(`/physics/${topic}/${subtopic}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Quantum Mechanics Topics
        </h1>

        <div className="space-y-6">
          {Object.entries(TOPICS).map(([topicKey, topicData]) => (
            <div key={topicKey} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {topicData.name}
                </h2>
                <div className="text-sm text-gray-600">
                  {calculateProgress(progress, topicData.name)}% Complete
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topicData.subtopics.map((subtopic) => {
                  const isCompleted = progress.find(
                    p => p.topic === topicData.name && p.subtopic === subtopic && p.is_completed
                  );

                  return (
                    <button
                      key={subtopic}
                      onClick={() => handleSubtopicClick(topicKey, subtopic)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCompleted
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-blue-500 bg-white'
                      }`}
                    >
                      <div className="text-lg font-semibold">
                        Subtopic {subtopic}
                      </div>
                      {isCompleted && (
                        <div className="text-green-600 text-sm mt-1">✓ Completed</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}