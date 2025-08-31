import React from 'react';
import { motion } from 'framer-motion';

const SubscriptionInfo = ({ userStats, onPricing, darkMode, toggleDarkMode }) => {
  const hasUnlimitedAccess = () => {
    const plan = userStats?.currentPlan?.toLowerCase();
    return plan === 'unlimited';
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription & Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-600">{userStats?.currentPlan || 'Free'}</p>
          </div>
          {!hasUnlimitedAccess() && (
            <motion.button
              onClick={onPricing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upgrade
            </motion.button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Dark Mode</h3>
            <p className="text-sm text-gray-600">Toggle dark/light theme</p>
          </div>
          <motion.button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-purple-600' : 'bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Credits Remaining</h3>
            <p className="text-sm text-gray-600">
              {hasUnlimitedAccess() ? 'Unlimited' : `${userStats?.credits || 3} credits`}
            </p>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {hasUnlimitedAccess() ? '∞' : userStats?.credits || 3}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionInfo;
