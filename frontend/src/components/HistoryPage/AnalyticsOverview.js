import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsOverview = ({ analytics, hasUnlimitedAccess, onUpgrade }) => {
  if (!hasUnlimitedAccess) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Unlock Advanced Analytics</h3>
            <p className="text-purple-100 text-sm">Get detailed insights into your writing progress</p>
          </div>
          <motion.button
            onClick={onUpgrade}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade Now
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.avgScore}</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.totalEssays}</div>
          <div className="text-sm text-gray-600">Total Essays</div>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${analytics.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.improvement >= 0 ? '+' : ''}{analytics.improvement}
          </div>
          <div className="text-sm text-gray-600">Score Improvement</div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsOverview;
