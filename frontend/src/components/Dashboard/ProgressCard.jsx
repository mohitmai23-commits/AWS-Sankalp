import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Atom, 
  Waves, 
  Zap,
  Trophy,
  Clock,
  Target,
  Play
} from 'lucide-react';

// Dynamic Quantum Wave Background
const QuantumWaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Multiple animated wave layers */}
      <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
        {/* Wave 1 - Bottom */}
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
        
        {/* Wave 2 - Middle */}
        <motion.path
          d="M0 650 Q240 600, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z"
          fill="rgba(120, 140, 100, 0.06)"
          animate={{
            d: [
              "M0 650 Q240 600, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z",
              "M0 650 Q240 700, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z",
              "M0 650 Q240 600, 480 650 T960 650 T1440 650 L1440 800 L0 800 Z"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Wave 3 - Top accent */}
        <motion.path
          d="M0 700 Q300 680, 600 700 T1200 700 T1440 700 L1440 800 L0 800 Z"
          fill="rgba(217, 119, 6, 0.04)"
          animate={{
            d: [
              "M0 700 Q300 680, 600 700 T1200 700 T1440 700 L1440 800 L0 800 Z",
              "M0 700 Q300 720, 600 700 T1200 700 T1440 700 L1440 800 L0 800 Z",
              "M0 700 Q300 680, 600 700 T1200 700 T1440 700 L1440 800 L0 800 Z"
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </svg>

      {/* Horizontal quantum wave lines */}
      <svg className="absolute top-20 left-0 w-full h-32 opacity-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <motion.path
          d="M0 50 Q50 30, 100 50 T200 50 T300 50 T400 50 T500 50 T600 50 T700 50 T800 50 T900 50 T1000 50 T1100 50 T1200 50"
          fill="none"
          stroke="#92a17d"
          strokeWidth="2"
          animate={{
            d: [
              "M0 50 Q50 30, 100 50 T200 50 T300 50 T400 50 T500 50 T600 50 T700 50 T800 50 T900 50 T1000 50 T1100 50 T1200 50",
              "M0 50 Q50 70, 100 50 T200 50 T300 50 T400 50 T500 50 T600 50 T700 50 T800 50 T900 50 T1000 50 T1100 50 T1200 50",
              "M0 50 Q50 30, 100 50 T200 50 T300 50 T400 50 T500 50 T600 50 T700 50 T800 50 T900 50 T1000 50 T1100 50 T1200 50"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Side quantum wave */}
      <svg className="absolute right-10 top-1/4 w-24 h-64 opacity-15" viewBox="0 0 50 200">
        <motion.path
          d="M25 0 Q40 25, 25 50 T25 100 T25 150 T25 200"
          fill="none"
          stroke="#92a17d"
          strokeWidth="2"
          animate={{
            d: [
              "M25 0 Q40 25, 25 50 T25 100 T25 150 T25 200",
              "M25 0 Q10 25, 25 50 T25 100 T25 150 T25 200",
              "M25 0 Q40 25, 25 50 T25 100 T25 150 T25 200"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Probability cloud circles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 100 + i * 30,
            height: 100 + i * 30,
            left: `${10 + i * 18}%`,
            top: `${60 + (i % 2) * 10}%`,
            background: `radial-gradient(circle, rgba(146, 161, 125, ${0.08 - i * 0.01}) 0%, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Floating wave particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${8 + i * 8}%`,
            top: `${15 + (i % 5) * 18}%`,
            backgroundColor: i % 2 === 0 ? 'rgba(146, 161, 125, 0.4)' : 'rgba(217, 119, 6, 0.3)'
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
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
    </div>
  );
};

// Animated gradient blob component
const GradientBlob = ({ className, color1, color2, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${className}`}
    style={{
      background: `radial-gradient(circle, ${color1} 0%, ${color2} 70%, transparent 100%)`
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.4, 0.6, 0.4],
      x: [0, 20, 0],
      y: [0, -20, 0]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Floating particle
const FloatingParticle = ({ delay, x, y, size }) => (
  <motion.div
    className="absolute rounded-full bg-amber-300/30"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.2, 0.5, 0.2],
      scale: [1, 1.2, 1]
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

export default function ProgressCard({ lastTopic = "Quantum Tunneling", lastSubtopic = "3.2", onContinue }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Sample progress data
  const progressData = {
    overallProgress: 68,
    chaptersCompleted: 2,
    totalChapters: 3,
    streakDays: 5,
    timeSpent: "4h 32m"
  };

  const chapters = [
    { name: 'Infinite Potential Well', progress: 100, icon: Atom, color: '#d97706' },
    { name: 'Finite Potential Well', progress: 75, icon: Waves, color: '#92a17d' },
    { name: 'Quantum Tunneling', progress: 30, icon: Zap, color: '#b45309' }
  ];

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fef7ed 0%, #fef3e2 30%, #fdf6e3 50%, #f5f5dc 70%, #faf8f0 100%)'
      }}
    >
      {/* Google Font */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Quicksand:wght@400;500;600;700&display=swap" 
        rel="stylesheet"
      />

      {/* Animated Gradient Blobs */}
      <GradientBlob 
        className="w-[600px] h-[600px] -top-40 -left-40"
        color1="rgba(251, 191, 36, 0.3)"
        color2="rgba(245, 158, 11, 0.1)"
        delay={0}
      />
      <GradientBlob 
        className="w-[500px] h-[500px] top-1/4 -right-20"
        color1="rgba(180, 180, 150, 0.25)"
        color2="rgba(160, 160, 140, 0.1)"
        delay={2}
      />
      <GradientBlob 
        className="w-[400px] h-[400px] bottom-20 left-1/4"
        color1="rgba(217, 119, 6, 0.2)"
        color2="rgba(180, 83, 9, 0.1)"
        delay={4}
      />
      <GradientBlob 
        className="w-[350px] h-[350px] bottom-0 right-1/3"
        color1="rgba(146, 161, 125, 0.2)"
        color2="rgba(120, 140, 100, 0.1)"
        delay={3}
      />

      {/* Dynamic Quantum Wave Background */}
      <QuantumWaveBackground />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <FloatingParticle 
          key={i}
          delay={i * 0.5}
          x={`${15 + i * 10}%`}
          y={`${20 + (i % 4) * 20}%`}
          size={6 + (i % 3) * 4}
        />
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          {/* Welcome Header */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-full mb-6 border border-amber-200/50"
              whileHover={{ scale: 1.05 }}
            >
              <span 
                className="text-sm text-amber-700 font-medium"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Welcome back, Learner!
              </span>
            </motion.div>
            
            <h1 
              className="text-5xl font-bold text-amber-900 mb-3"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Continue Your Journey
            </h1>
            <p 
              className="text-amber-700/80 text-lg"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              You're making great progress in quantum mechanics
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            className="bg-white/40 backdrop-blur-xl rounded-3xl border border-amber-100/60 shadow-2xl shadow-amber-900/5 overflow-hidden"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-8">
              {/* Top Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Target, label: 'Progress', value: `${progressData.overallProgress}%`, color: 'amber' },
                  { icon: BookOpen, label: 'Chapters', value: `${progressData.chaptersCompleted}/${progressData.totalChapters}`, color: 'amber' },
                  { icon: Trophy, label: 'Streak', value: `${progressData.streakDays} days`, color: 'amber' },
                  { icon: Clock, label: 'Time', value: progressData.timeSpent, color: 'amber' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 rounded-2xl p-4 border border-amber-200/40"
                  >
                    <stat.icon className="w-5 h-5 text-amber-600 mb-2" />
                    <p 
                      className="text-2xl font-bold text-amber-900"
                      style={{ fontFamily: "'Patrick Hand', cursive" }}
                    >
                      {stat.value}
                    </p>
                    <p 
                      className="text-xs text-amber-600"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Chapter Progress */}
              <div className="mb-8">
                <h3 
                  className="text-lg font-semibold text-amber-800 mb-4"
                  style={{ fontFamily: "'Patrick Hand', cursive" }}
                >
                  Chapter Progress
                </h3>
                <div className="space-y-4">
                  {chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: chapter.color + '20', border: `1px solid ${chapter.color}40` }}
                      >
                        <chapter.icon className="w-5 h-5" style={{ color: chapter.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span 
                            className="text-sm font-medium text-amber-800"
                            style={{ fontFamily: "'Quicksand', sans-serif" }}
                          >
                            {chapter.name}
                          </span>
                          <span 
                            className="text-sm text-amber-600"
                            style={{ fontFamily: "'Patrick Hand', cursive" }}
                          >
                            {chapter.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: chapter.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${chapter.progress}%` }}
                            transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Continue Learning Section */}
              <motion.div
                className="bg-gradient-to-r from-amber-100/80 via-orange-50/60 to-yellow-50/80 rounded-2xl p-6 border border-amber-200/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p 
                        className="text-sm text-amber-600 mb-1"
                        style={{ fontFamily: "'Quicksand', sans-serif" }}
                      >
                        Last studied
                      </p>
                      <h4 
                        className="text-xl font-bold text-amber-900"
                        style={{ fontFamily: "'Patrick Hand', cursive" }}
                      >
                        {lastTopic} - {lastSubtopic}
                      </h4>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onContinue}
                    className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#92a17d] to-[#7d8f6a] text-white rounded-xl font-semibold shadow-lg shadow-[#92a17d]/30 hover:shadow-xl hover:shadow-[#92a17d]/40 transition-all"
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    <Play className="w-5 h-5" />
                    Continue Learning
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Bottom Wave Decoration */}
            <div className="h-2 bg-gradient-to-r from-[#a8b896] via-[#92a17d] to-[#a8b896]" />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="flex justify-center gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {[
              { icon: BookOpen, label: 'Browse Topics' },
              { icon: Trophy, label: 'Achievements' },
              { icon: Target, label: 'Set Goals' }
            ].map((action, index) => (
              <motion.button
                key={action.label}
                className="flex items-center gap-2 px-5 py-3 bg-white/50 backdrop-blur-sm rounded-xl border border-[#92a17d]/30 text-[#6b7a5a] hover:bg-[#92a17d]/10 hover:border-[#92a17d]/50 transition-all"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}