import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔒 SAME REDIRECT LOGIC (UNCHANGED)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(135deg, #fef7ed 0%, #fef3e2 30%, #fdf6e3 60%, #faf8f0 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-100/60 p-8"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold text-amber-900 mb-2"
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            AnuJnana
          </h1>
          <p
            className="text-amber-700/70"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            {isLogin ? 'Welcome back!' : 'Start your learning journey'}
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-amber-50/80 rounded-xl mb-6 overflow-hidden border border-amber-200/50">
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 font-semibold transition-all ${
              !isLogin
                ? 'bg-white text-amber-700 shadow'
                : 'text-amber-500 hover:text-amber-700'
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 font-semibold transition-all ${
              isLogin
                ? 'bg-white text-amber-700 shadow'
                : 'text-amber-500 hover:text-amber-700'
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Login
          </button>
        </div>

        {/* AUTH FORM (UNCHANGED) */}
        <div className="mt-4">
          {isLogin ? <Login /> : <Signup />}
        </div>
      </motion.div>
    </div>
  );
}
