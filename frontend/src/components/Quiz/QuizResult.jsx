import { useNavigate } from 'react-router-dom';
import { TOPICS } from '../../utils/constants';

export default function QuizResult({ result, topic, subtopic }) {
  const navigate = useNavigate();

  const scorePercentage = Math.round(result.score * 100);
  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'text-green-600';
    if (scorePercentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (scorePercentage >= 80) return 'Excellent work! 🎉';
    if (scorePercentage >= 60) return 'Good job! 👍';
    return 'Keep practicing! 💪';
  };

  const handleNextSubtopic = () => {
    const topicData = TOPICS[topic];
    if (!topicData) return;

    const currentIndex = topicData.subtopics.indexOf(subtopic);
    if (currentIndex < topicData.subtopics.length - 1) {
      const nextSubtopic = topicData.subtopics[currentIndex + 1];
      navigate(`/physics/${topic}/${nextSubtopic}`);
    } else {
      // Completed all subtopics in this topic
      navigate('/physics');
    }
  };

  const handleRetakeQuiz = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Score display */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-50 mb-4">
            <span className={`text-5xl font-bold ${getScoreColor()}`}>
              {scorePercentage}%
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getScoreMessage()}
          </h2>
          <p className="text-gray-600">
            You scored {scorePercentage}% on this quiz
          </p>
        </div>

        {/* Memory prediction */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-3">
            <span className="text-4xl mr-3">🧠</span>
            <h3 className="text-xl font-semibold text-gray-900">
              Memory Prediction
            </h3>
          </div>
          <p className="text-gray-700 text-lg mb-2">
            Based on your performance and engagement, you should revise this topic in:
          </p>
          <p className="text-4xl font-bold text-blue-600 mb-3">
            {result.predicted_days} days
          </p>
          <p className="text-sm text-gray-600">
            We'll send you a reminder on {new Date(result.reminder_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Email notification */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <span className="text-2xl mr-3">📧</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900 mb-1">
                Check Your Email!
              </p>
              <p className="text-sm text-gray-700">
                We've sent a memory prediction summary to your registered email. 
                You'll also receive a reminder when it's time to revise.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="text-left mb-8">
          <h4 className="font-semibold text-gray-900 mb-3">Performance Breakdown:</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quiz Type:</span>
              <span className="font-semibold capitalize">{result.quiz_id ? 'Completed' : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your Score:</span>
              <span className="font-semibold">{scorePercentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retention Prediction:</span>
              <span className="font-semibold">{result.predicted_days} days</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleNextSubtopic}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-lg font-semibold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
          >
            Continue to Next Subtopic
            <span className="ml-2 text-2xl">⬇️</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleRetakeQuiz}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            {scorePercentage >= 80 
              ? '"Excellence is not a destination; it is a continuous journey that never ends." - Keep going!' 
              : '"Every expert was once a beginner. Keep practicing and you\'ll master this!"'}
          </p>
        </div>
      </div>
    </div>
  );
}