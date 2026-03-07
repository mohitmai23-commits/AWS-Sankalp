import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target, BookOpen, Trophy, Clock, Zap, Atom, Waves,
  Play, ArrowRight, Bell, CheckCircle, AlertCircle,
  ChevronRight, Sparkles, TrendingUp, Calendar
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import NotificationPanel from './NotificationPanel';
import { TOPICS } from '../../utils/constants';
import { calculateProgress } from '../../utils/helpers';

/* ---------------------- UI COMPONENTS (UNCHANGED) ---------------------- */

const StatCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-100/50"
  >
    <Icon className="w-6 h-6 text-amber-500 mb-2" />
    <div className="text-2xl font-bold text-amber-900">{value}</div>
    <div className="text-sm text-amber-600/70">{label}</div>
  </motion.div>
);

const ChapterProgressItem = ({ icon: Icon, title, progress, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-4"
  >
    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
      <Icon className="w-5 h-5 text-amber-600" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{title}</span>
        <span className="font-semibold">{progress}%</span>
      </div>
      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#92a17d] to-[#a8b896]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8 }}
        />
      </div>
    </div>
  </motion.div>
);

const TopicCard = ({ name, progress, icon: Icon, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -4 }}
    onClick={onClick}
    className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-100/50 cursor-pointer"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-600" />
      </div>
      <h3 className="font-semibold">{name}</h3>
    </div>

    <div className="h-2 bg-amber-100 rounded-full mb-2">
      <motion.div
        className="h-full bg-gradient-to-r from-[#92a17d] to-[#a8b896]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />
    </div>

    <div className="flex justify-between text-sm">
      <span>{progress}% Complete</span>
      <ChevronRight className="w-4 h-4" />
    </div>
  </motion.div>
);

/* ---------------------- MAIN DASHBOARD ---------------------- */

export default function Dashboard() {
  const { user } = useAuth();
  const { progress, lastTopic, lastSubtopic, loading, refreshProgress } = useProgress();
  const navigate = useNavigate();

  /* ---- SAME LOGIC AS OLD CODE ---- */

  useEffect(() => {
    if (user?.user_id) {
      refreshProgress();
    }
  }, [user?.user_id]);

  useEffect(() => {
    const onFocus = () => {
      if (user?.user_id) refreshProgress();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user?.user_id, refreshProgress]);

  const handleContinueLearning = () => {
    if (lastTopic && lastSubtopic) {
      const topicKey = Object.keys(TOPICS).find(
        key => TOPICS[key].name === lastTopic
      );
      navigate(`/physics/${topicKey}/${lastSubtopic}`);
    } else {
      navigate('/physics');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your progress...
      </div>
    );
  }

  /* ---- DERIVED DATA (REAL) ---- */

  const stats = [
    {
      icon: Target,
      value: `${Math.round(
        Object.values(TOPICS).reduce(
          (acc, t) => acc + calculateProgress(progress, t.name), 0
        ) / Object.keys(TOPICS).length
      )}%`,
      label: 'Progress'
    },
    {
      icon: BookOpen,
      value: `${Object.keys(TOPICS).length}`,
      label: 'Topics'
    },
    {
      icon: Trophy,
      value: progress?.streak || '—',
      label: 'Streak'
    },
    {
      icon: Clock,
      value: progress?.time_spent || '—',
      label: 'Time'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mb-8">
          Continue your quantum mechanics journey
        </p>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.1} />
          ))}
        </div>

        {/* PROGRESS CARD */}
        <div className="bg-white/60 rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Continue Learning</h2>

          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-gray-500">Last studied</div>
              <div className="font-semibold">
                {lastTopic} {lastSubtopic && `- ${lastSubtopic}`}
              </div>
            </div>
            <button
              onClick={handleContinueLearning}
              className="flex items-center gap-2 px-5 py-3 bg-[#92a17d] text-white rounded-xl"
            >
              <Play className="w-4 h-4" />
              Continue
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(TOPICS).map(([key, topic], i) => (
              <ChapterProgressItem
                key={key}
                icon={Atom}
                title={topic.name}
                progress={calculateProgress(progress, topic.name)}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>

        {/* TOPICS */}
        <div className="grid md:grid-cols-3 gap-5">
          {Object.entries(TOPICS).map(([key, topic], i) => (
            <TopicCard
              key={key}
              name={topic.name}
              icon={Atom}
              progress={calculateProgress(progress, topic.name)}
              delay={i * 0.1}
              onClick={() => navigate('/physics')}
            />
          ))}
        </div>

        {/* NOTIFICATIONS */}
        <div className="mt-10">
          <NotificationPanel userId={user.user_id} />
        </div>
      </div>
    </div>
  );
}
