import { useNavigate } from 'react-router-dom';
import { Brain, BarChart3, Target, Sparkles, BookOpen, Star, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-20 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-2xl"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/60 backdrop-blur-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900">Quantum</h1>
              <p className="text-xs text-amber-600">Physics Lab</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100/60 backdrop-blur-sm text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-amber-200/50">
            <Sparkles className="w-4 h-4" />
            Welcome to Quantum Mechanics
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-amber-950 mb-6 leading-tight">
            Explore the Quantum World
          </h1>
          <p className="text-lg text-amber-800/70 max-w-2xl mx-auto leading-relaxed">
            Master Quantum Mechanics with personalized, intelligent tutoring that adapts to your learning style
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Card 1 - Adaptive Content */}
          <div className="group bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm p-8 rounded-3xl border border-amber-200/50 hover:border-amber-300 transition-all hover:shadow-xl hover:shadow-amber-100 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-3">Adaptive Content</h3>
            <p className="text-amber-700/70 mb-6 leading-relaxed">
              Content automatically simplifies when you need help
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-900 hover:gap-3 transition-all"
            >
              Start Learning
              <span className="text-lg">›</span>
            </button>
          </div>

          {/* Card 2 - Smart Predictions */}
          <div className="group bg-gradient-to-br from-lime-50/80 to-emerald-50/80 backdrop-blur-sm p-8 rounded-3xl border border-lime-200/50 hover:border-lime-300 transition-all hover:shadow-xl hover:shadow-lime-100 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-lime-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-lime-200 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-3">Smart Predictions</h3>
            <p className="text-amber-700/70 mb-6 leading-relaxed">
              AI predicts when you'll forget and sends reminders
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-900 hover:gap-3 transition-all"
            >
              Start Learning
              <span className="text-lg">›</span>
            </button>
          </div>

          {/* Card 3 - Engagement Tracking */}
          <div className="group bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm p-8 rounded-3xl border border-orange-200/50 hover:border-orange-300 transition-all hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-3">Engagement Tracking</h3>
            <p className="text-amber-700/70 mb-6 leading-relaxed">
              Real-time monitoring keeps you focused and engaged
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-900 hover:gap-3 transition-all"
            >
              Start Learning
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center justify-center gap-12 py-8">
          <div className="flex items-center gap-3 text-amber-800">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-2xl font-bold text-amber-900">3</span>
              <span className="text-sm text-amber-600 ml-1">Chapters</span>
            </div>
          </div>
          <div className="w-px h-8 bg-amber-200"></div>
          <div className="flex items-center gap-3 text-amber-800">
            <Star className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-2xl font-bold text-amber-900">12</span>
              <span className="text-sm text-amber-600 ml-1">Subtopics</span>
            </div>
          </div>
          <div className="w-px h-8 bg-amber-200"></div>
          <div className="flex items-center gap-3 text-amber-800">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-2xl font-bold text-amber-900">100%</span>
              <span className="text-sm text-amber-600 ml-1">Interactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating decoration */}
      <div className="fixed bottom-8 left-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-amber-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-amber-900 text-sm">Keep Learning!</p>
          <p className="text-xs text-amber-600">3 chapters to explore</p>
        </div>
      </div>
    </div>
  );
}