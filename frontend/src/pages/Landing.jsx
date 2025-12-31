import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Physics Whisperer</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Adaptive Learning
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Master Quantum Mechanics with personalized, intelligent tutoring that adapts to your learning style
          </p>
          
          <button
            onClick={() => navigate('/auth')}
            className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Adaptive Content</h3>
            <p className="text-gray-600">
              Content automatically simplifies when you need help
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Smart Predictions</h3>
            <p className="text-gray-600">
              AI predicts when you'll forget and sends reminders
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Engagement Tracking</h3>
            <p className="text-gray-600">
              Real-time monitoring keeps you focused and engaged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}