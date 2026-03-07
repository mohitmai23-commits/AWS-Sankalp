import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { ChevronRight, CheckCircle, Circle } from 'lucide-react';
import api from '../../utils/api';
import QuizResult from './QuizResult';

// Concept mapping for subtopics
const CONCEPT_MAP = {
  '1.1': 'Introduction to Infinite Potential Well',
  '1.2': 'Schrödinger Equation & Assumptions',
  '1.3': 'Normalization & Probability',
  '1.4': 'Energy Eigenvalues & Quantum States',
  '1.5': 'Physical Implications',
  '2.1': 'Finite Potential Well Basics',
  '2.2': 'Bound States in Finite Well',
  '2.3': 'Wave Function Matching',
  '2.4': 'Energy Level Comparisons',
  '3.1': 'Quantum Tunneling Basics',
  '3.2': 'Tunneling Through Barriers',
  '3.3': 'Applications of Tunneling',
  '3.4': 'Advanced Tunneling Concepts'
};

// Easy quiz questions with concept links
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
      correct: 1,
      relatedSubtopic: '1.1',
      concept: 'Introduction to Infinite Potential Well'
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
      correct: 1,
      relatedSubtopic: '1.1',
      concept: 'Introduction to Infinite Potential Well'
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
      correct: 1,
      relatedSubtopic: '1.2',
      concept: 'Schrödinger Equation & Assumptions'
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
      correct: 1,
      relatedSubtopic: '1.2',
      concept: 'Schrödinger Equation & Assumptions'
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
      correct: 1,
      relatedSubtopic: '1.4',
      concept: 'Energy Eigenvalues & Quantum States'
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
      correct: 1,
      relatedSubtopic: '3.1',
      concept: 'Quantum Tunneling Basics'
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
      correct: 1,
      relatedSubtopic: '3.1',
      concept: 'Quantum Tunneling Basics'
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
      correct: 1,
      relatedSubtopic: '3.1',
      concept: 'Quantum Tunneling Basics'
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
      correct: 1,
      relatedSubtopic: '3.3',
      concept: 'Applications of Tunneling'
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
      correct: 0,
      relatedSubtopic: '3.2',
      concept: 'Tunneling Through Barriers'
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

  // Calculate weak areas from wrong answers
  const calculateWeakAreas = (userAnswers) => {
    const weakAreasMap = {};
    
    userAnswers.forEach((answer, index) => {
      if (answer !== quizData[index].correct) {
        const question = quizData[index];
        const subtopicKey = question.relatedSubtopic || subtopic;
        const concept = question.concept || CONCEPT_MAP[subtopicKey] || 'General Concepts';
        
        if (weakAreasMap[subtopicKey]) {
          weakAreasMap[subtopicKey].wrong_count += 1;
        } else {
          weakAreasMap[subtopicKey] = {
            subtopic: subtopicKey,
            concept: concept,
            wrong_count: 1
          };
        }
      }
    });
    
    return Object.values(weakAreasMap);
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
      const correctCount = newAnswers.filter(
        (answer, index) => answer === quizData[index].correct
      ).length;
      const score = correctCount / quizData.length;
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const weakAreas = calculateWeakAreas(newAnswers);

      submitQuiz(score, timeTaken, correctCount, weakAreas);
    }
  };

  const submitQuiz = async (score, timeTaken, correctCount, weakAreas) => {
    try {
      const response = await api.submitQuiz({
        user_id: user.user_id,
        subtopic_id: subtopic,
        quiz_type: 'easy',
        score: score,
        time_taken: timeTaken,
        total_questions: quizData.length,
        correct_answers: correctCount,
        engagement_avg: 0.7, // From engagement tracking
        cognitive_load_history: 'HIGH',
        video_watched: true,
        video_pauses: 1,
        audio_completed: true,
        weak_areas: weakAreas
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
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-amber-700 mb-3">
          <span className="font-medium">Question {currentQuestion + 1} of {quizData.length}</span>
          <span className="font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Question dots */}
        <div className="flex justify-center gap-2 mt-4">
          {quizData.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index < currentQuestion
                  ? 'bg-green-500'
                  : index === currentQuestion
                  ? 'bg-amber-500 ring-2 ring-amber-300'
                  : 'bg-amber-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200/50 p-8 mb-6">
        <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          EASY QUIZ
        </div>
        <h2 className="text-2xl font-bold mb-8 text-amber-950">
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-5 text-left text-lg rounded-2xl border-2 transition-all flex items-center gap-4 ${
                selectedAnswer === index
                  ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
                  : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 bg-white/60'
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                selectedAnswer === index
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-amber-900">{option}</span>
              {selectedAnswer === index && (
                <CheckCircle className="w-6 h-6 text-amber-500 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
        >
          {currentQuestion < quizData.length - 1 ? 'Next Question' : 'Submit Quiz'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}