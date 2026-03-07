import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Trophy, RefreshCw, Home, ChevronDown, Sparkles, Calendar, Target, Quote } from 'lucide-react';
import { TOPICS } from '../../utils/constants';

export default function QuizResult({ result, topic, subtopic }) {
  const navigate = useNavigate();

  const scorePercentage = Math.round(result.score * 100);
  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'from-green-500 to-emerald-500';
    if (scorePercentage >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreBg = () => {
    if (scorePercentage >= 80) return 'bg-green-50 border-green-200';
    if (scorePercentage >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreMessage = () => {
    if (scorePercentage >= 80) return 'Excellent work!';
    if (scorePercentage >= 60) return 'Good job!';
    return 'Keep practicing!';
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
      <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200/50 p-8 text-center">
        {/* Score display */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-36 h-36 rounded-3xl border-2 mb-6 ${getScoreBg()}`}>
            <div className="text-center">
              <span className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent`}>
                {scorePercentage}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold text-amber-950">
              {getScoreMessage()}
            </h2>
          </div>
          <p className="text-amber-700">
            You scored {scorePercentage}% on this quiz
          </p>
        </div>

        {/* Memory prediction */}
        <div className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-2xl p-6 mb-8 border border-amber-200/50">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-amber-900">
              Memory Prediction
            </h3>
          </div>
          <p className="text-amber-700 text-lg mb-3">
            Based on your performance and engagement, you should revise this topic in:
          </p>
          <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            {result.predicted_days} days
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
            <Calendar className="w-4 h-4" />
            <span>Reminder on {new Date(result.reminder_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Email notification */}
        <div className="bg-lime-50/80 border border-lime-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-amber-900 mb-1">
                Check Your Email!
              </p>
              <p className="text-sm text-amber-700">
                We've sent a memory prediction summary to your registered email. 
                You'll also receive a reminder when it's time to revise.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="text-left mb-8 bg-white/50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-amber-900">Performance Breakdown</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-amber-100">
              <span className="text-amber-700">Quiz Type:</span>
              <span className="font-semibold text-amber-900 capitalize">{result.quiz_id ? 'Completed' : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-amber-100">
              <span className="text-amber-700">Your Score:</span>
              <span className="font-semibold text-amber-900">{scorePercentage}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-amber-700">Retention Prediction:</span>
              <span className="font-semibold text-amber-900">{result.predicted_days} days</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={handleNextSubtopic}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Continue to Next Subtopic
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="border-2 border-amber-400 text-amber-700 hover:bg-amber-50 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-8 pt-6 border-t border-amber-200">
          <div className="flex items-start gap-3 text-left">
            <Quote className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-600 italic">
              {scorePercentage >= 80 
                ? 'Excellence is not a destination; it is a continuous journey that never ends. Keep going!' 
                : 'Every expert was once a beginner. Keep practicing and you\'ll master this!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}