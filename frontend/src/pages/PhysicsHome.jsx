import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Atom, 
  Waves, 
  Zap, 
  Box, 
  Circle, 
  Triangle,
  Square,
  Star,
  Minus,
  Plus,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Sparkles
} from 'lucide-react';

// Big Rotating Orbiting Electrons Component
const RotatingQuantumElement = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Central nucleus */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Glowing core */}
        <div className="w-12 h-12 bg-amber-600 rounded-full opacity-50 blur-md" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-amber-500 rounded-full opacity-70" />
        
        {/* Orbit 1 - Horizontal - LARGE */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border-2 border-amber-700/40 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Electron 1 - Big */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-600 rounded-full opacity-80 shadow-xl shadow-amber-600/60" />
          {/* Wave trail */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-gradient-to-r from-amber-500/50 to-transparent rounded-full blur-sm" />
        </motion.div>
        
        {/* Orbit 2 - Tilted - LARGE */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border-2 border-emerald-700/35 rounded-full"
          style={{ transform: 'rotateX(60deg) rotateZ(30deg)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {/* Electron 2 - Big */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-emerald-600 rounded-full opacity-75 shadow-xl shadow-emerald-600/60" />
        </motion.div>
        
        {/* Orbit 3 - Vertical - LARGE */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border-2 border-amber-600/25 rounded-full"
          style={{ transform: 'rotateY(70deg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {/* Electron 3 - Big */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-500 rounded-full opacity-70 shadow-xl shadow-amber-500/50" />
        </motion.div>
        
        {/* Wave function rings - LARGER */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-2 border-dashed border-amber-600/25 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-dashed border-emerald-600/20 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      {/* Small floating icons - keeping same */}
      {[
        { Icon: Atom, x: '5%', y: '15%', size: 24 },
        { Icon: Waves, x: '92%', y: '20%', size: 20 },
        { Icon: Circle, x: '15%', y: '75%', size: 16 },
        { Icon: Square, x: '88%', y: '70%', size: 14 },
        { Icon: Triangle, x: '8%', y: '45%', size: 18 },
        { Icon: Star, x: '95%', y: '45%', size: 16 },
        { Icon: Minus, x: '20%', y: '25%', size: 12 },
        { Icon: Plus, x: '85%', y: '85%', size: 14 },
      ].map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-gray-800/40"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 4 + index * 0.5,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut"
          }}
        >
          <item.Icon size={item.size} strokeWidth={1.5} />
        </motion.div>
      ))}
      
      {/* Floating wave particles - keep same size */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-amber-600/30 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 12}%`,
          }}
          animate={{
            y: [0, -20, -10, -30, 0],
            x: [0, 10, -10, 5, 0],
            opacity: [0.3, 0.5, 0.3, 0.4, 0.3]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Chapter Card Component
const ChapterCard = ({ title, subtitle, icon: Icon, color, gradientFrom, gradientTo, onClick, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div 
        className={`relative p-8 rounded-3xl shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden transition-all duration-300 ${
          isHovered ? 'shadow-2xl' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        {/* Decorative circles */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
          style={{ background: color }}
          animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-20"
          style={{ background: color }}
          animate={isHovered ? { scale: 1.3 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Icon */}
        <motion.div
          className="relative z-10 mb-6"
          animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: color }}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 
            className="text-2xl font-bold text-gray-800 mb-2"
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{subtitle}</p>
          
          <motion.div
            className="flex items-center gap-2 text-gray-700 font-medium"
            animate={isHovered ? { x: 5 } : { x: 0 }}
          >
            <span style={{ fontFamily: "'Patrick Hand', cursive" }}>Start Learning</span>
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>
        
        {/* Floating particles on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ 
                    background: color,
                    left: `${20 + i * 15}%`,
                    bottom: '20%'
                  }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    y: -30,
                    x: (i - 2) * 10
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ label, subtopics, isExpanded, onToggle, onSubtopicClick, activeSubtopic }) => {
  return (
    <div className="mb-3">
      <motion.button
        onClick={onToggle}
        className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center justify-between ${
          isExpanded 
            ? 'bg-gradient-to-r from-amber-100 to-amber-50 shadow-lg text-amber-900 border border-amber-300/60' 
            : 'bg-gradient-to-r from-amber-50/90 to-amber-100/70 hover:from-amber-100 hover:to-amber-50 text-amber-800 border border-amber-200/50'
        }`}
        whileHover={{ x: 5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span 
          className="font-semibold text-sm"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {label}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pl-4 pt-2 space-y-1">
              {subtopics.map((sub) => (
                <motion.button
                  key={sub}
                  onClick={() => onSubtopicClick(sub)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeSubtopic === sub
                      ? 'bg-gradient-to-r from-amber-200/90 to-amber-100/80 text-amber-900 font-medium border border-amber-300/60 shadow-sm'
                      : 'hover:bg-amber-100/60 text-amber-700 border border-transparent hover:border-amber-200/40'
                  }`}
                  whileHover={{ x: 3 }}
                  style={{ fontFamily: "'Patrick Hand', cursive" }}
                >
                  Subtopic {sub}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Component
export default function PhysicsHome() {
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [activeSubtopic, setActiveSubtopic] = useState(null);

  const topics = {
    'infinite-well': {
      name: 'Infinite Potential Well',
      subtopics: ['1.1', '1.2', '1.3', '1.4', '1.5']
    },
    'finite-well': {
      name: 'Finite Potential Well',
      subtopics: ['2.1', '2.2', '2.3', '2.4']
    },
    'tunneling': {
      name: 'Quantum Tunneling',
      subtopics: ['3.1', '3.2', '3.3']
    }
  };

  const chapters = [
    {
      id: 'infinite-well',
      title: 'Infinite Potential Well',
      subtitle: 'Particles trapped in perfect quantum boxes',
      icon: Box,
      color: '#d97706',
      gradientFrom: 'rgba(254, 243, 199, 0.95)',
      gradientTo: 'rgba(255, 251, 235, 0.95)',
      navigateTo: '1.1'
    },
    {
      id: 'finite-well',
      title: 'Finite Potential Well',
      subtitle: 'When walls allow quantum leakage',
      icon: Waves,
      color: '#92a17d',
      gradientFrom: 'rgba(250, 250, 240, 0.95)',
      gradientTo: 'rgba(245, 248, 235, 0.95)',
      navigateTo: '2.1'
    },
    {
      id: 'tunneling',
      title: 'Quantum Tunneling',
      subtitle: 'The magic of walking through walls',
      icon: Zap,
      color: '#b45309',
      gradientFrom: 'rgba(253, 230, 138, 0.95)',
      gradientTo: 'rgba(254, 249, 195, 0.95)',
      navigateTo: '3.1'
    }
  ];

  const handleSubtopicClick = (topicKey, subtopic) => {
    setActiveSubtopic(subtopic);
    navigate(`/physics/${topicKey}/${subtopic}`);
  };

  const handleChapterClick = (chapter) => {
    navigate(`/physics/${chapter.id}/${chapter.navigateTo}`);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 25%, #fefce8 50%, #ecfdf5 75%, #d1fae5 100%)'
      }}
    >
      {/* Google Font */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" 
        rel="stylesheet"
      />
      
      {/* Big Rotating Orbiting Electrons Background */}
      <RotatingQuantumElement />
      
      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-72 p-6 bg-gradient-to-b from-amber-50/95 via-orange-50/80 to-yellow-50/90 backdrop-blur-lg border-r-4 border-amber-200/60 shadow-2xl shadow-amber-900/10 relative overflow-hidden"
        >
          {/* Quantum Tunneling Animation in Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Tunneling wave animation */}
            <svg className="absolute top-20 -left-10 w-80 h-40 opacity-20" viewBox="0 0 200 80">
              <motion.path
                d="M0 40 Q30 40, 40 20 Q50 0, 60 20 Q70 40, 100 40 Q130 40, 140 60 Q150 80, 160 60 Q170 40, 200 40"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
            
            {/* Barrier with particle tunneling through */}
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2">
              {/* Barrier */}
              <div className="w-4 h-24 bg-gradient-to-b from-amber-300/30 to-amber-400/20 rounded-full" />
              {/* Tunneling particle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500/50 rounded-full shadow-lg shadow-amber-400/30"
                animate={{
                  x: [-40, 0, 40],
                  opacity: [0.8, 0.3, 0.8],
                  scale: [1, 0.6, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            {/* Floating probability clouds */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 rounded-full bg-gradient-radial from-amber-200/20 to-transparent"
                style={{
                  top: `${20 + i * 25}%`,
                  left: `${10 + (i % 2) * 50}%`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
            
            {/* Wave function lines */}
            <svg className="absolute bottom-20 left-0 w-full h-20 opacity-15" viewBox="0 0 300 40">
              <motion.path
                d="M0 20 Q25 5, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20"
                fill="none"
                stroke="#b45309"
                strokeWidth="1.5"
                animate={{
                  d: [
                    "M0 20 Q25 5, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20",
                    "M0 20 Q25 35, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20",
                    "M0 20 Q25 5, 50 20 T100 20 T150 20 T200 20 T250 20 T300 20"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
          </div>
          {/* Logo/Title */}
          <div className="mb-8">
            <motion.div
              className="flex items-center gap-3 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Atom className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold text-amber-900"
                  style={{ fontFamily: "'Patrick Hand', cursive" }}
                >
                  Quantum
                </h1>
                <p className="text-xs text-amber-700 -mt-1">Physics Lab</p>
              </div>
            </motion.div>
          </div>
          
          {/* Navigation */}
          <nav className="relative z-10">
            <p 
              className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-4 px-2"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Course Contents
            </p>
            
            {Object.entries(topics).map(([key, topic], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.4 }}
              >
                <SidebarItem
                  label={topic.name}
                  subtopics={topic.subtopics}
                  isExpanded={expandedTopic === key}
                  onToggle={() => setExpandedTopic(expandedTopic === key ? null : key)}
                  onSubtopicClick={(sub) => handleSubtopicClick(key, sub)}
                  activeSubtopic={activeSubtopic}
                />
              </motion.div>
            ))}
          </nav>
          
          {/* Bottom decoration */}
          <motion.div
            className="absolute bottom-8 left-6 right-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="p-4 bg-gradient-to-r from-amber-100/95 to-amber-50/90 rounded-2xl border border-amber-300/50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold text-gray-800"
                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                  >
                    Keep Learning!
                  </p>
                  <p className="text-xs text-gray-600">3 chapters to explore</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full mb-4 backdrop-blur-sm border border-white/50"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span 
                className="text-sm text-gray-700"
                style={{ fontFamily: "'Patrick Hand', cursive" }}
              >
                Welcome to Quantum Mechanics
              </span>
            </motion.div>
            
            <h1 
              className="text-5xl font-bold text-gray-800 mb-4"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Explore the Quantum World
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Dive into the fascinating realm of quantum mechanics through interactive lessons and visualizations
            </p>
          </motion.div>
          
          {/* Chapter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                title={chapter.title}
                subtitle={chapter.subtitle}
                icon={chapter.icon}
                color={chapter.color}
                gradientFrom={chapter.gradientFrom}
                gradientTo={chapter.gradientTo}
                onClick={() => handleChapterClick(chapter)}
                delay={0.2 * index + 0.3}
              />
            ))}
          </div>
          
          {/* Bottom Stats/Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex justify-center gap-8"
          >
            {[
              { label: 'Chapters', value: '3', icon: BookOpen },
              { label: 'Subtopics', value: '12', icon: Star },
              { label: 'Interactive', value: '100%', icon: Sparkles }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-3 px-6 py-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50"
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <stat.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p 
                    className="text-2xl font-bold text-gray-800"
                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}