import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import api from '../../utils/api';
import QuizResult from './QuizResult';

// Sample easy quiz questions (you'll replace with actual content)
const EASY_QUIZ_QUESTIONS = {
  '1.1': [
    {
      id: 1,
      question: "What is an infinite potential well?",
      options: [
        "A well with no bottom",
        "A box with infinitely high walls",
        "A well with finite depth",
        "A circular container"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "Can a particle escape from an infinite potential well?",
      options: [
        "Yes, always",
        "No, never",
        "Only with high energy",
        "Only at low temperature"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "What equation describes the infinite well?",
      options: [
        "Newton's law",
        "Schrödinger equation",
        "Maxwell's equations",
        "Einstein's equations"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "Inside the well, the potential energy is:",
      options: [
        "Infinite",
        "Zero",
        "Negative",
        "Positive"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "The particle's energy in the well is:",
      options: [
        "Continuous",
        "Quantized",
        "Random",
        "Infinite"
      ],
      correct: 1
    }
  ],
  '3.1': [
    {
      id: 1,
      question: "What is quantum tunneling?",
      options: [
        "Digging a tunnel",
        "Particles passing through barriers",
        "Light traveling through glass",
        "Sound moving through air"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "What allows particles to tunnel?",
      options: [
        "High energy",
        "Wave-like nature",
        "Large mass",
        "Fast speed"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "In classical physics, can tunneling occur?",
      options: [
        "Yes",
        "No",
        "Sometimes",
        "At high temperatures"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "Tunneling is important in:",
      options: [
        "Cooking",
        "Semiconductor devices",
        "Photography",
        "Weather"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "The probability of tunneling depends on:",
      options: [
        "Barrier height",
        "Color",
        "Temperature only",
        "Pressure only"
      ],
      correct: 0
    }
  ]
};

export default function EasyQuiz({ topic, subtopic }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress } = useProgress();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    // Get quiz questions for this subtopic
    const questions = EASY_QUIZ_QUESTIONS[subtopic] || EASY_QUIZ_QUESTIONS['3.1'];
    setQuizData(questions);
  }, [subtopic]);

  if (!quizData) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    // Save answer
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    // Move to next question or show results
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed - calculate score
      const correctAnswers = newAnswers.filter(
        (answer, index) => answer === quizData[index].correct
      ).length;
      const score = correctAnswers / quizData.length;
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      submitQuiz(score, timeTaken);
    }
  };

  const submitQuiz = async (score, timeTaken) => {
    try {
      const response = await api.submitQuiz({
        user_id: user.user_id,
        subtopic_id: subtopic,
        quiz_type: 'easy',
        score: score,
        time_taken: timeTaken,
        engagement_avg: 0.7, // From engagement tracking
        cognitive_load_history: 'HIGH',
        video_watched: true,
        video_pauses: 1,
        audio_completed: true
      });

      setQuizData({ ...quizData, result: response.data });
      setShowResult(true);

      // Update progress
      await updateProgress(topic, subtopic, true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (showResult) {
    return <QuizResult result={quizData.result} topic={topic} subtopic={subtopic} />;
  }

  const question = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {quizData.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-6 text-left text-lg rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-bold mr-3 text-blue-600">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion < quizData.length - 1 ? 'Next Question' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}