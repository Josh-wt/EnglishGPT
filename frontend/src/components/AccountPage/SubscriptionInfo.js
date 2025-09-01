import React from 'react';
import { motion } from 'framer-motion';

const SubscriptionInfo = ({ userStats, onPricing, darkMode, toggleDarkMode }) => {
  const hasUnlimitedAccess = () => {
    const plan = userStats?.currentPlan?.toLowerCase();
    return plan === 'unlimited' || plan === 'premium';
  };

  const getPlanDetails = () => {
    const plan = userStats?.currentPlan?.toLowerCase() || 'free';
    switch(plan) {
      case 'premium':
        return {
          name: 'Premium',
          color: 'from-yellow-400 to-orange-500',
          features: ['Unlimited evaluations', 'Priority support', 'Advanced analytics', 'Custom rubrics'],
          icon: '👑'
        };
      case 'pro':
        return {
          name: 'Pro',
          color: 'from-purple-500 to-pink-500',
          features: ['50 evaluations/month', 'Analytics dashboard', 'Email support'],
          icon: '⚡'
        };
      default:
        return {
          name: 'Free',
          color: 'from-gray-400 to-gray-500',
          features: ['3 evaluations/month', 'Basic features', 'Community support'],
          icon: '📝'
        };
    }
  };

  const planDetails = getPlanDetails();

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Subscription Details</h2>
        {!hasUnlimitedAccess() && (
          <motion.button
            onClick={onPricing}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade Plan
          </motion.button>
        )}
      </div>
      
      {/* Current Plan Card */}
      <div className={`bg-gradient-to-r ${planDetails.color} rounded-lg p-6 text-white mb-6`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-3xl">{planDetails.icon}</span>
              <h3 className="text-2xl font-bold">{planDetails.name} Plan</h3>
            </div>
            <ul className="space-y-1 text-sm opacity-90">
              {planDetails.features.map((feature, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {hasUnlimitedAccess() ? '∞' : userStats?.credits || 3}
            </p>
            <p className="text-sm opacity-75">
              {hasUnlimitedAccess() ? 'Unlimited' : 'Credits left'}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-900">{userStats?.monthlyUsage || 0}</p>
          <p className="text-xs text-gray-500">evaluations</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Next Renewal</p>
          <p className="text-lg font-bold text-gray-900">
            {userStats?.nextRenewal || 'N/A'}
          </p>
        </div>
      </div>

      {/* Billing Info */}
      {userStats?.currentPlan !== 'free' && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium">•••• {userStats?.lastFour || '****'}</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Manage Billing
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SubscriptionInfo;
