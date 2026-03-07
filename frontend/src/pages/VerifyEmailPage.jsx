import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import axios from 'axios';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying | success | error | no-token
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      // If backend returned access token, store it for auto-login
      if (response.data.access_token && response.data.user) {
        setUserData({
          token: response.data.access_token,
          user: response.data.user
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Verification failed. The link may be expired or invalid.');
    }
  };

  const handleLoginRedirect = () => {
    if (userData) {
      // Auto-login: store token and user data
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      window.location.href = '/dashboard';
    } else {
      navigate('/auth');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #fef7ed 0%, #fef3e2 30%, #fdf6e3 60%, #faf8f0 100%)'
      }}
    >
      <link 
        href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Quicksand:wght@400;500;600;700&display=swap" 
        rel="stylesheet"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-100/60 p-8 text-center"
      >
        {/* Header */}
        <h1
          className="text-4xl font-bold text-amber-900 mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          AnuJnana
        </h1>

        {/* Verifying State */}
        {status === 'verifying' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto"
            >
              <Loader className="w-16 h-16 text-amber-600" />
            </motion.div>
            <p className="text-amber-700 text-lg font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Verifying your email...
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-700" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Email Verified!
            </h2>
            <p className="text-amber-700" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              {message}
            </p>
            <motion.button
              onClick={handleLoginRedirect}
              className="mt-6 w-full py-3 bg-gradient-to-r from-[#92a17d] to-[#7d8f6a] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {userData ? 'Continue to Dashboard' : 'Go to Login'}
            </motion.button>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <XCircle className="w-20 h-20 mx-auto text-red-400" />
            <h2 className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Verification Failed
            </h2>
            <p className="text-amber-700" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              {message}
            </p>
            <div className="space-y-3 mt-6">
              <motion.button
                onClick={() => navigate('/auth')}
                className="w-full py-3 bg-gradient-to-r from-[#92a17d] to-[#7d8f6a] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Back to Sign Up
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* No Token State */}
        {status === 'no-token' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <Mail className="w-20 h-20 mx-auto text-amber-400" />
            <h2 className="text-2xl font-bold text-amber-700" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              No Verification Token
            </h2>
            <p className="text-amber-600" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Please use the verification link sent to your email.
            </p>
            <motion.button
              onClick={() => navigate('/auth')}
              className="mt-6 w-full py-3 bg-gradient-to-r from-[#92a17d] to-[#7d8f6a] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Go to Sign Up
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
