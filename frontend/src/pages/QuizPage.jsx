import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Navbar from '../components/Common/Navbar';
import EasyQuiz from '../components/Quiz/EasyQuiz';
import HardQuiz from '../components/Quiz/HardQuiz';

export default function QuizPage() {
  const { topic, subtopic, quizType } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {(quizType === 'easy' || quizType === 'simplified') ? (
          <EasyQuiz topic={topic} subtopic={subtopic} />
        ) : (
          <HardQuiz topic={topic} subtopic={subtopic} />
        )}
      </div>
    </div>
  );
}