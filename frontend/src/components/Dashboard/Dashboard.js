import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = ({ questionTypes, onStartQuestion, onPricing, onHistory, onAnalytics, onAccountSettings, onSubscription, userStats, user, darkMode, onSignOut }) => {
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userStats?.currentPlan?.toLowerCase();
    return plan === 'unlimited';
  };

  const stats = [
    {
      label: 'Essays Marked',
      value: userStats?.questionsMarked || 0,
      icon: '📝',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Credits Left',
      value: hasUnlimitedAccess() ? '∞' : (userStats?.credits || 3),
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Current Plan',
      value: userStats?.currentPlan || 'Free',
      icon: '💎',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const quickActions = [
    {
      title: 'Start New Essay',
      description: 'Begin writing and get instant feedback',
      icon: '✍️',
      action: onStartQuestion,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'View History',
      description: 'Review your past essays and progress',
      icon: '📚',
      action: onHistory,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Analytics',
      description: 'Track your performance and insights',
      icon: '📊',
      action: onAnalytics,
      color: 'from-green-500 to-emerald-500',
      locked: !hasUnlimitedAccess()
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile and preferences',
      icon: '⚙️',
      action: onAccountSettings,
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 font-fredoka">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Dark mode toggle */}
              <motion.button
                onClick={() => onSignOut()}
                className="text-gray-600 hover:text-gray-900 flex items-center font-fredoka"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              📚
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EnglishGPT</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Get instant, professional feedback on your English essays and assignments
          </p>
          <button
            onClick={onStartQuestion}
            className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-lg"
          >
            Mark a Question
          </button>
        </motion.div>
        
        {/* Question Types - Rendered explicitly */}
        <div className="space-y-12">
          {/* IGCSE Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg mr-4">
                <span className="font-bold">IGCSE</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">International General Certificate of Secondary Education</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {/* Summary */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#3b82f6'}}>📄</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Summary</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Condensing key information from texts</p>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-1">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                  <span className="font-fredoka text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">Mark scheme required</span>
                </div>
              </div>
              {/* Narrative */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#8b5cf6'}}>📖</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Narrative</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Creative storytelling and structure</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
              {/* Descriptive */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#22c55e'}}>🖼️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Descriptive</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Vivid imagery and atmospheric writing</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
              {/* Writer's Effect */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#f59e42'}}>⚡</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Writer's Effect</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Language analysis and impact</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                  <span className="font-fredoka text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">Mark scheme optional</span>
                </div>
              </div>
              {/* IGCSE Directed Writing */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#6366f1'}}>✍️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Directed Writing</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Transform text into specific formats</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
            </div>
          </div>
          {/* A-Level Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-red-500 text-white px-4 py-2 rounded-lg mr-4">
                <span className="font-bold">A-Level</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Level English</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reflective Commentary */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#ef4444'}}>📊</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Reflective Commentary</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Critical reflection and personal response</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">A-Level English (9093)</span>
                  <span className="font-fredoka text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">Mark scheme required</span>
                </div>
              </div>
              {/* Directed Writing */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#22c55e'}}>✏️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Directed Writing</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Task-specific writing with audience awareness</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">A-Level English (9093)</span>
                </div>
              </div>
              {/* Text Analysis */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#ec4899'}}>🔍</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Text Analysis</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Literary analysis and critical interpretation</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">A-Level English (9093)</span>
                  <span className="font-fredoka text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">Mark scheme required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
