import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import api from '../../utils/api';
import QuizResult from './QuizResult';

// Sample hard quiz questions (you'll replace with actual content)
const HARD_QUIZ_QUESTIONS = {
  '1.1': [
    {
      id: 1,
      question: "Derive the energy eigenvalues for a particle in an infinite potential well of width L.",
      options: [
        "E_n = n²h²/(8mL²)",
        "E_n = nh/(2mL)",
        "E_n = n²/(mL²)",
        "E_n = h²/(nmL²)"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "What is the normalized wave function for the ground state of an infinite well?",
      options: [
        "ψ(x) = sin(πx/L)",
        "ψ(x) = √(2/L) sin(πx/L)",
        "ψ(x) = (1/L) sin(πx/L)",
        "ψ(x) = cos(πx/L)"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "How does the energy spacing between levels change as n increases?",
      options: [
        "Decreases linearly",
        "Increases linearly",
        "Increases quadratically",
        "Remains constant"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "At what points inside the well is the probability density zero for n=2?",
      options: [
        "x = 0, L",
        "x = L/2",
        "x = 0, L/2, L",
        "x = L/4, 3L/4"
      ],
      correct: 2
    },
    {
      id: 5,
      question: "What is the expectation value of position for the ground state?",
      options: [
        "0",
        "L/4",
        "L/2",
        "L"
      ],
      correct: 2
    },
    {
      id: 6,
      question: "How does doubling the well width affect the ground state energy?",
      options: [
        "Energy doubles",
        "Energy halves",
        "Energy becomes 1/4",
        "Energy quadruples"
      ],
      correct: 2
    },
    {
      id: 7,
      question: "What boundary conditions apply at the walls?",
      options: [
        "ψ continuous, dψ/dx discontinuous",
        "ψ(0) = ψ(L) = 0",
        "dψ/dx(0) = dψ/dx(L) = 0",
        "ψ(0) = ψ(L) = 1"
      ],
      correct: 1
    },
    {
      id: 8,
      question: "For n=3, how many nodes does the wave function have inside the well?",
      options: [
        "1",
        "2",
        "3",
        "4"
      ],
      correct: 1
    },
    {
      id: 9,
      question: "What is the momentum uncertainty for a particle in the ground state?",
      options: [
        "Δp = 0",
        "Δp = h/L",
        "Δp = πℏ/L",
        "Δp = ∞"
      ],
      correct: 2
    },
    {
      id: 10,
      question: "Which quantum number is NOT allowed for the infinite well?",
      options: [
        "n = 0",
        "n = 1",
        "n = 2",
        "n = 100"
      ],
      correct: 0
    }
  ],
  '3.1': [
    {
      id: 1,
      question: "What is the transmission coefficient for quantum tunneling through a rectangular barrier?",
      options: [
        "T ≈ exp(-2κa) where κ = √(2m(V-E))/ℏ",
        "T = E/V",
        "T = 1 - R",
        "T = exp(-a/L)"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "How does tunneling probability depend on barrier width?",
      options: [
        "Linear decrease",
        "Exponential decrease",
        "Quadratic decrease",
        "Independent"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "What happens to tunneling as particle mass increases?",
      options: [
        "Increases",
        "Decreases",
        "No change",
        "Oscillates"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "In alpha decay, what is tunneling through?",
      options: [
        "Electric field",
        "Coulomb barrier",
        "Magnetic field",
        "Gravity well"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "The WKB approximation requires:",
      options: [
        "Slowly varying potential",
        "Constant potential",
        "Infinite potential",
        "Zero potential"
      ],
      correct: 0
    },
    {
      id: 6,
      question: "In scanning tunneling microscopy (STM), tunneling current depends on:",
      options: [
        "Temperature only",
        "Tip-sample distance exponentially",
        "Voltage linearly",
        "Sample color"
      ],
      correct: 1
    },
    {
      id: 7,
      question: "What is the reflection coefficient R if transmission T = 0.01?",
      options: [
        "0.01",
        "0.10",
        "0.99",
        "1.00"
      ],
      correct: 2
    },
    {
      id: 8,
      question: "Resonant tunneling occurs when:",
      options: [
        "E matches bound state energy",
        "Barrier is infinite",
        "Temperature is zero",
        "Mass is zero"
      ],
      correct: 0
    },
    {
      id: 9,
      question: "The tunneling time through a barrier is approximately:",
      options: [
        "Infinite",
        "ℏ/E",
        "a/v where v is velocity",
        "Instantaneous"
      ],
      correct: 2
    },
    {
      id: 10,
      question: "Which device does NOT rely on quantum tunneling?",
      options: [
        "Tunnel diode",
        "STM",
        "Flash memory",
        "Incandescent bulb"
      ],
      correct: 3
    }
  ]
};

export default function HardQuiz({ topic, subtopic }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress } = useProgress();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [quizData, setQuizData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes

  useEffect(() => {
    // Get quiz questions for this subtopic
    const questions = HARD_QUIZ_QUESTIONS[subtopic] || HARD_QUIZ_QUESTIONS['3.1'];
    setQuizData(questions);

    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [subtopic]);

  if (!quizData) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  const handleTimeUp = () => {
    // Auto-submit quiz when time is up
    const correctAnswers = answers.filter(
      (answer, index) => answer === quizData[index].correct
    ).length;
    const score = correctAnswers / quizData.length;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    submitQuiz(score, timeTaken);
  };

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
        quiz_type: 'hard',
        score: score,
        time_taken: timeTaken,
        engagement_avg: 0.8, // From engagement tracking
        cognitive_load_history: 'LOW',
        video_watched: false,
        video_pauses: 0,
        audio_completed: false
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
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with timer */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {quizData.length}</span>
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            HARD QUIZ
          </span>
          <h2 className="text-xl font-bold text-gray-900">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold mr-2 text-blue-600">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-sm">{option}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="text-gray-600 hover:text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion < quizData.length - 1 ? 'Next Question →' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}