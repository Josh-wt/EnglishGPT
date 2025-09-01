import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Enhanced Locked Analytics Page
const LockedAnalyticsPage = ({ onBack, upgradeType, page = 'analytics' }) => {
  const isAnalytics = page === 'analytics';
  const isHistory = page === 'history';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 flex items-center font-fredoka"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-fredoka font-bold text-gray-900">
              {isAnalytics ? 'Analytics Dashboard' : 'Marking History'}
            </h1>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-fredoka font-medium">
              🔒 Locked
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-fredoka font-bold text-gray-900 mb-4">
            {isAnalytics ? '📊 Analytics Dashboard' : '📚 Marking History'}
          </h1>
          <p className="text-xl font-fredoka text-gray-600 max-w-2xl mx-auto mb-8">
            {isAnalytics 
              ? 'Unlock detailed insights into your writing progress, skill development, and personalized recommendations.'
              : 'Access your complete marking history and track your progress over time.'
            }
          </p>
        </div>

        {/* Upgrade Options */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-fredoka font-bold text-gray-900 mb-6 text-center">
            🚀 Upgrade to Unlock {isAnalytics ? 'Analytics' : 'History'}
          </h2>
          
          <div className="text-center">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-fredoka font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// History Page
const HistoryPage = ({ onBack, evaluations, userPlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userPlan?.toLowerCase();
    return plan === 'unlimited';
  };

  if (!hasUnlimitedAccess()) {
    return <LockedAnalyticsPage onBack={onBack} upgradeType="unlimited" page="history" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">Marking History</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCompare(true)}
                disabled={selectedForCompare.length !== 2}
                className={`px-3 py-2 rounded-lg ${selectedForCompare.length === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 cursor-not-allowed'}`}
              >
                Compare (2)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search essays, feedback, or grades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="igcse">IGCSE</option>
                <option value="alevel">A-Level</option>
                <option value="summary">Summary</option>
                <option value="narrative">Narrative</option>
                <option value="descriptive">Descriptive</option>
                <option value="directed">Directed Writing</option>
              </select>
            </div>
            
            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="grade_high">Highest Grade</option>
                <option value="grade_low">Lowest Grade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Evaluations List */}
        {evaluations && evaluations.length > 0 ? (
          <div className="space-y-4">
            {evaluations.map((evaluation, index) => (
              <motion.div
                key={evaluation.id || index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {evaluation.question_type?.replace(/_/g, ' ').toUpperCase() || 'Essay Evaluation'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(evaluation.created_at || evaluation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {evaluation.grade || 'N/A'}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedForCompare.includes(evaluation.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedForCompare.length < 2) {
                            setSelectedForCompare([...selectedForCompare, evaluation.id]);
                          }
                        } else {
                          setSelectedForCompare(selectedForCompare.filter(id => id !== evaluation.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">
                    {evaluation.student_response?.substring(0, 200)}...
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📊 Score: {evaluation.grade || 'N/A'}</span>
                    <span>📝 Type: {evaluation.question_type?.replace(/_/g, ' ') || 'Unknown'}</span>
                  </div>
                  <button
                    onClick={() => window.open(`/results/${evaluation.short_id || evaluation.id}`, '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Evaluations Yet</h2>
            <p className="text-gray-600 mb-6">Start by writing your first essay to see your history here.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write Your First Essay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
