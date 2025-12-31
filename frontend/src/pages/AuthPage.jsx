import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Physics Whisperer</h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back!' : 'Start your learning journey'}
          </p>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${
              !isLogin
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${
              isLogin
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
        </div>

        {isLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
}