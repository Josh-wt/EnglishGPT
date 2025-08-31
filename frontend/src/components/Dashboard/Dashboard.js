import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = ({ questionTypes, onStartQuestion, onPricing, onHistory, onAnalytics, onAccountSettings, onSubscription, userStats, user, darkMode, onSignOut }) => {
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userStats.currentPlan?.toLowerCase();
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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email || 'Student'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to improve your English writing skills? Let's get started!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg text-white text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={action.locked ? onPricing : action.action}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${action.color} rounded-lg text-white text-xl`}>
                    {action.icon}
                  </div>
                  {action.locked && (
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Premium
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600 mb-4">No recent essays yet</p>
            <motion.button
              onClick={onStartQuestion}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your First Essay
            </motion.button>
          </div>
        </div>

        {/* Upgrade Prompt for Free Users */}
        {!hasUnlimitedAccess() && (
          <motion.div 
            className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Unlock Unlimited Access</h3>
                <p className="text-purple-100">Get unlimited essays, advanced analytics, and AI recommendations</p>
              </div>
              <motion.button
                onClick={onPricing}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Upgrade Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
