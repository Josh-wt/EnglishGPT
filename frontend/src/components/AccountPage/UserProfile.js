import React from 'react';
import { motion } from 'framer-motion';

const UserProfile = ({ user, userStats }) => {
  // Calculate member since date
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Recently joined';

  // Get avatar initial
  const getInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitial()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm text-gray-500">Member since {memberSince}</p>
          </div>
        </div>
        {/* Plan Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          userStats?.currentPlan === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
          userStats?.currentPlan === 'pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
          'bg-gray-100 text-gray-700'
        }`}>
          {userStats?.currentPlan?.toUpperCase() || 'FREE'} Plan
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
          <p className="text-gray-900 font-medium">{user?.email || 'Not provided'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Essays Marked</label>
          <p className="text-2xl font-bold text-indigo-600">{userStats?.questionsMarked || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Account ID</label>
          <p className="text-gray-900 font-mono text-xs">{user?.id?.substring(0, 8) || 'N/A'}...</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{userStats?.questionsMarked || 0}</p>
            <p className="text-xs text-gray-500">Total Essays</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{userStats?.streak || 0}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{userStats?.badges?.length || 0}</p>
            <p className="text-xs text-gray-500">Badges Earned</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{userStats?.averageScore || 'N/A'}</p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
