import { Routes, Route } from 'react-router-dom';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PhysicsHome from './pages/PhysicsHome';
import ContentPage from './pages/ContentPage';
import QuizPage from './pages/QuizPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/physics" element={<PhysicsHome />} />
      <Route path="/physics/:topic/:subtopic" element={<ContentPage />} />
      <Route
        path="/physics/:topic/:subtopic/simplified"
        element={<ContentPage simplified />}
      />
      <Route
        path="/physics/:topic/:subtopic/quiz/:quizType"
        element={<QuizPage />}
      />
    </Routes>
  );
}

export default App;