import React from 'react';
import { motion } from 'framer-motion';

const UserProfile = ({ user, userStats }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <p className="text-gray-900">{user?.user_metadata?.full_name || user?.email || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <p className="text-gray-900">{user?.email || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Essays Marked</label>
          <p className="text-gray-900">{userStats?.questionsMarked || 0}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Plan</label>
          <p className="text-gray-900">{userStats?.currentPlan || 'Free'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
