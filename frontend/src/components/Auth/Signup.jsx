import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Atom, Eye, EyeOff, Check } from 'lucide-react';

// Dynamic Quantum Wave Background
const QuantumWaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated wave layers */}
      <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
        <motion.path
          d="M0 600 Q180 550, 360 600 T720 600 T1080 600 T1440 600 L1440 800 L0 800 Z"
          fill="rgba(146, 161, 125, 0.08)"
          animate={{
            d: [
              "M0 600 Q180 550, 360 600 T720 600 T1080 600 T1440 600 L1440 800 L0 800 Z",
              "M0 600 Q180 650, 360 600 T720 600 T1080 600 T1440 600 L1440 800 L0 800 Z",
              "M0 600 Q180 550, 360 600 T720 600 T1080 600 T1440 600 L1440 800 L0 800 Z"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 650 Q240 600, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z"
          fill="rgba(217, 119, 6, 0.05)"
          animate={{
            d: [
              "M0 650 Q240 600, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z",
              "M0 650 Q240 700, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z",
              "M0 650 Q240 600, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      {/* Top wave line */}
      <svg className="absolute top-20 left-0 w-full h-20 opacity-20" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <motion.path
          d="M0 30 Q50 15, 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30"
          fill="none"
          stroke="#92a17d"
          strokeWidth="2"
          animate={{
            d: [
              "M0 30 Q50 15, 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30",
              "M0 30 Q50 45, 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30",
              "M0 30 Q50 15, 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${10 + i * 9}%`,
            top: `${15 + (i % 4) * 20}%`,
            backgroundColor: i % 2 === 0 ? 'rgba(146, 161, 125, 0.4)' : 'rgba(217, 119, 6, 0.3)'
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Gradient blobs */}
      <motion.div
        className="absolute w-[400px] h-[400px] -top-20 -left-20 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] bottom-20 -right-20 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(146, 161, 125, 0.2) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
};

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 4) return { strength: 25, label: 'Weak', color: '#ef4444' };
    if (password.length < 6) return { strength: 50, label: 'Fair', color: '#f59e0b' };
    if (password.length < 8) return { strength: 75, label: 'Good', color: '#92a17d' };
    return { strength: 100, label: 'Strong', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      setLoading(false);
      setSuccess('Registration successful! Welcome aboard.');
      console.log('Signup attempted with:', name, email, password);
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #fef7ed 0%, #fef3e2 30%, #fdf6e3 50%, #f5f5dc 70%, #faf8f0 100%)'
      }}
    >
      {/* Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Quicksand:wght@400;500;600;700&display=swap" 
        rel="stylesheet"
      />

      {/* Background */}
      <QuantumWaveBackground />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-amber-100/60 shadow-2xl shadow-amber-900/10 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#92a17d] to-[#7d8f6a] flex items-center justify-center shadow-lg shadow-[#92a17d]/30"
            >
              <Atom className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 
              className="text-4xl font-bold text-amber-900 mb-2"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Join the Journey
            </h1>
            <p 
              className="text-amber-700/70"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Start exploring quantum mechanics today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 text-green-600 p-3 rounded-xl text-sm border border-green-200 flex items-center gap-2"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                <Check className="w-4 h-4" />
                {success}
              </motion.div>
            )}

            {/* Name Input */}
            <div>
              <label 
                className="block text-sm font-medium text-amber-800 mb-2"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl focus:ring-2 focus:ring-[#92a17d]/50 focus:border-[#92a17d] transition-all outline-none text-amber-900 placeholder-amber-400"
                  placeholder="John Doe"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label 
                className="block text-sm font-medium text-amber-800 mb-2"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl focus:ring-2 focus:ring-[#92a17d]/50 focus:border-[#92a17d] transition-all outline-none text-amber-900 placeholder-amber-400"
                  placeholder="you@example.com"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label 
                className="block text-sm font-medium text-amber-800 mb-2"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl focus:ring-2 focus:ring-[#92a17d]/50 focus:border-[#92a17d] transition-all outline-none text-amber-900 placeholder-amber-400"
                  placeholder="••••••••"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-amber-600" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                      Password strength
                    </span>
                    <span className="text-xs font-medium" style={{ color: passwordStrength.color, fontFamily: "'Quicksand', sans-serif" }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: passwordStrength.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.strength}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label 
                className="block text-sm font-medium text-amber-800 mb-2"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-12 pr-12 py-3.5 bg-amber-50/50 border rounded-xl focus:ring-2 focus:ring-[#92a17d]/50 transition-all outline-none text-amber-900 placeholder-amber-400 ${
                    confirmPassword && confirmPassword !== password 
                      ? 'border-red-300 focus:border-red-400' 
                      : confirmPassword && confirmPassword === password 
                        ? 'border-green-300 focus:border-green-400'
                        : 'border-amber-200/60 focus:border-[#92a17d]'
                  }`}
                  placeholder="••••••••"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword === password && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#92a17d] to-[#7d8f6a] text-white rounded-xl font-semibold shadow-lg shadow-[#92a17d]/30 hover:shadow-xl hover:shadow-[#92a17d]/40 transition-all disabled:opacity-50 mt-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Login Link */}
            <p 
              className="text-center text-amber-700/70 pt-2"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Already have an account?{' '}
              <a href="/login" className="text-[#7d8f6a] font-semibold hover:text-[#6b7a5a] transition-colors">
                Login
              </a>
            </p>

            {/* Terms */}
            <p 
              className="text-xs text-amber-600/60 text-center"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              By signing up, you agree to our Terms of Service
            </p>
          </form>

          {/* Bottom Decoration */}
          <div className="h-1.5 bg-gradient-to-r from-[#a8b896] via-[#92a17d] to-[#a8b896]" />
        </div>
      </motion.div>
    </div>
  );
}