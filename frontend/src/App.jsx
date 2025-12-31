import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PhysicsHome from './pages/PhysicsHome';
import ContentPage from './pages/ContentPage';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/physics" element={<PhysicsHome />} />
            <Route path="/physics/:topic/:subtopic" element={<ContentPage />} />
            <Route path="/physics/:topic/:subtopic/simplified" element={<ContentPage simplified />} />
            <Route path="/physics/:topic/:subtopic/quiz/:quizType" element={<QuizPage />} />
          </Routes>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;