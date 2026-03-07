import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setShowResend(false);
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      // Show resend button if email not verified
      if (result.error && result.error.includes('verify your email')) {
        setShowResend(true);
      }
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setInfo('');
    try {
      await axios.post('/api/auth/resend-verification', { email });
      setInfo('Verification email sent! Check your inbox.');
      setError('');
    } catch (err) {
      setInfo(err.response?.data?.detail || 'Could not resend. Try again.');
    }
    setResending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {info && (
        <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-sm">
          {info}
        </div>
      )}
      {showResend && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full bg-amber-50 text-amber-700 border border-amber-200 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}