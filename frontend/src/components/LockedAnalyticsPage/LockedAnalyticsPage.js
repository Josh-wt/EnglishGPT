import React from 'react';
import { motion } from 'framer-motion';

const LockedAnalyticsPage = ({ onBack, upgradeType, page = 'analytics' }) => {
  const features = [
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed charts and insights'
    },
    {
      icon: '🎯',
      title: 'Performance Trends',
      description: 'See how you improve over time with trend analysis'
    },
    {
      icon: '🤖',
      title: 'AI Recommendations',
      description: 'Get personalized study recommendations based on your performance'
    },
    {
      icon: '📈',
      title: 'Detailed Breakdowns',
      description: 'Understand your strengths and weaknesses in detail'
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={onBack}
              className="text-white hover:text-purple-200 flex items-center font-fredoka transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </motion.button>
            
            <motion.h1 
              className="text-xl font-bold text-white font-fredoka"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {page === 'analytics' ? 'Analytics Dashboard' : 'Advanced Features'}
            </motion.h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.div 
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <span className="text-4xl">🔒</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-4 font-fredoka"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Unlock Advanced Analytics
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Upgrade to unlock powerful analytics, AI recommendations, and detailed insights to accelerate your learning.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <motion.div 
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold mb-4">Ready to accelerate your progress?</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Join thousands of students who are already using advanced analytics to improve their English skills faster.
          </p>
          
          <motion.button
            onClick={upgradeType}
            className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade Now - Just $4.99/month
          </motion.button>
          
          <p className="text-purple-200 text-sm mt-4">
            Cancel anytime • 7-day free trial
          </p>
        </motion.div>

        {/* Testimonials */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">What students say</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "The analytics helped me identify exactly where I needed to improve. My grades went from C to A in just 6 weeks!",
                author: "Sarah, IGCSE Student"
              },
              {
                quote: "The AI recommendations are spot-on. I finally understood what 'analysis' really meant in my essays.",
                author: "Michael, A-Level Student"
              },
              {
                quote: "Being able to track my progress over time kept me motivated. The detailed breakdowns are incredibly helpful.",
                author: "Emma, IGCSE Student"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
              >
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-sm text-gray-500 font-semibold">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LockedAnalyticsPage;
