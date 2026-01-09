import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { ChevronRight, ChevronLeft, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
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

// Sample hard quiz questions with concept/subtopic links
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
      correct: 0,
      relatedSubtopic: '1.4',
      concept: 'Energy Eigenvalues & Quantum States'
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
      correct: 1,
      relatedSubtopic: '1.3',
      concept: 'Normalization & Probability'
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
      correct: 1,
      relatedSubtopic: '1.4',
      concept: 'Energy Eigenvalues & Quantum States'
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
      correct: 2,
      relatedSubtopic: '1.3',
      concept: 'Normalization & Probability'
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
      correct: 2,
      relatedSubtopic: '1.3',
      concept: 'Normalization & Probability'
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
      correct: 2,
      relatedSubtopic: '1.4',
      concept: 'Energy Eigenvalues & Quantum States'
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
      correct: 1,
      relatedSubtopic: '1.2',
      concept: 'Schrödinger Equation & Assumptions'
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
      correct: 1,
      relatedSubtopic: '1.3',
      concept: 'Normalization & Probability'
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
      correct: 2,
      relatedSubtopic: '1.5',
      concept: 'Physical Implications'
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
      correct: 0,
      relatedSubtopic: '1.4',
      concept: 'Energy Eigenvalues & Quantum States'
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
      correct: 0,
      relatedSubtopic: '3.2',
      concept: 'Tunneling Through Barriers'
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
      correct: 1,
      relatedSubtopic: '3.2',
      concept: 'Tunneling Through Barriers'
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
      correct: 1,
      relatedSubtopic: '3.1',
      concept: 'Quantum Tunneling Basics'
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
      correct: 1,
      relatedSubtopic: '3.3',
      concept: 'Applications of Tunneling'
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
      correct: 0,
      relatedSubtopic: '3.4',
      concept: 'Advanced Tunneling Concepts'
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
      correct: 1,
      relatedSubtopic: '3.3',
      concept: 'Applications of Tunneling'
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
      correct: 2,
      relatedSubtopic: '3.2',
      concept: 'Tunneling Through Barriers'
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
      correct: 0,
      relatedSubtopic: '3.4',
      concept: 'Advanced Tunneling Concepts'
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
      correct: 2,
      relatedSubtopic: '3.4',
      concept: 'Advanced Tunneling Concepts'
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
      correct: 3,
      relatedSubtopic: '3.3',
      concept: 'Applications of Tunneling'
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

  const handleTimeUp = () => {
    // Auto-submit quiz when time is up
    const correctCount = answers.filter(
      (answer, index) => answer === quizData[index].correct
    ).length;
    const score = correctCount / quizData.length;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const weakAreas = calculateWeakAreas(answers);
    submitQuiz(score, timeTaken, correctCount, weakAreas);
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
        quiz_type: 'hard',
        score: score,
        time_taken: timeTaken,
        total_questions: quizData.length,
        correct_answers: correctCount,
        engagement_avg: 0.8, // From engagement tracking
        cognitive_load_history: 'LOW',
        video_watched: false,
        video_pauses: 0,
        audio_completed: false,
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
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with timer */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 p-5 mb-6 flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-amber-700">Question {currentQuestion + 1} of {quizData.length}</span>
          <div className="w-64 bg-amber-100 rounded-full h-2.5 mt-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
          timeRemaining < 60 
            ? 'bg-red-100 text-red-600' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          <Clock className="w-5 h-5" />
          <span className="text-2xl font-bold font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200/50 p-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <AlertTriangle className="w-3 h-3" />
            HARD QUIZ
          </span>
          <h2 className="text-xl font-bold text-amber-950">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex items-center gap-3 ${
                selectedAnswer === index
                  ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
                  : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 bg-white/60'
              }`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                selectedAnswer === index
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-amber-900 text-sm">{option}</span>
              {selectedAnswer === index && (
                <CheckCircle className="w-5 h-5 text-amber-500 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-amber-200">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          >
            {currentQuestion < quizData.length - 1 ? 'Next Question' : 'Submit Quiz'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}