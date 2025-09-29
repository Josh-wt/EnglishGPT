import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from '../ui/Footer';
import SearchFilters from './SearchFilters';
import EvaluationsGrid from './EvaluationsGrid';
import EvaluationDetailModal from './EvaluationDetailModal';
import CompareModal from './CompareModal';

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check if user has unlimited access
  const hasUnlimitedAccess = useMemo(() => {
    const plan = userPlan?.toLowerCase();
    // For now, we'll allow access to history for all users
    // You can add credit checks here if needed: || credits >= 99999
    return plan === 'unlimited';
  }, [userPlan]);

  // Handle loading and empty states
  const hasEvaluations = evaluations && evaluations.length > 0;
  const isLoadingEvaluations = evaluations === undefined || evaluations === null;

  // Filter and sort evaluations
  const filteredAndSortedEvaluations = useMemo(() => {
    if (!evaluations) return [];

    let filtered = evaluations.filter(evaluation => {
      // Search filter
      const matchesSearch = !searchTerm || 
        evaluation.student_response?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.question_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.feedback?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = filterType === 'all' || 
        evaluation.question_type?.toLowerCase().includes(filterType.toLowerCase());

      return matchesSearch && matchesType;
    });

    // Sort evaluations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp);
        case 'oldest':
          return new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp);
        case 'grade_high':
          const aGrade = parseInt(a.grade?.match(/\d+/)?.[0] || '0');
          const bGrade = parseInt(b.grade?.match(/\d+/)?.[0] || '0');
          return bGrade - aGrade;
        case 'grade_low':
          const aGradeLow = parseInt(a.grade?.match(/\d+/)?.[0] || '0');
          const bGradeLow = parseInt(b.grade?.match(/\d+/)?.[0] || '0');
          return aGradeLow - bGradeLow;
        default:
          return 0;
      }
    });

    return filtered;
  }, [evaluations, searchTerm, filterType, sortBy]);

  // If user doesn't have unlimited access, show locked page
  if (!hasUnlimitedAccess) {
    return <LockedAnalyticsPage onBack={onBack} page="history" />;
  }

  // Utility functions for modals
  const parseFeedbackToBullets = (feedback) => {
    if (!feedback) return [];
    
    // If feedback is already an array, return it as is
    if (Array.isArray(feedback)) {
      return feedback.filter(item => item && item.trim());
    }
    
    // If feedback is a string, split it by newlines
    if (typeof feedback === 'string') {
      return feedback.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '').trim());
    }
    
    // Fallback for other types
    return [];
  };

  const getSubmarks = (evaluation) => {
    const submarks = [];
    if (evaluation.reading_marks) submarks.push(`Reading: ${evaluation.reading_marks}`);
    if (evaluation.writing_marks) submarks.push(`Writing: ${evaluation.writing_marks}`);
    if (evaluation.ao1_marks) submarks.push(`AO1: ${evaluation.ao1_marks}`);
    if (evaluation.ao2_marks) submarks.push(`AO2: ${evaluation.ao2_marks}`);
    if (evaluation.ao3_marks) submarks.push(`AO3: ${evaluation.ao3_marks}`);
    if (evaluation.ao4_marks) submarks.push(`AO4: ${evaluation.ao4_marks}`);
    if (evaluation.ao5_marks) submarks.push(`AO5: ${evaluation.ao5_marks}`);
    if (evaluation.content_structure_marks) submarks.push(`Content: ${evaluation.content_structure_marks}`);
    if (evaluation.style_accuracy_marks) submarks.push(`Style: ${evaluation.style_accuracy_marks}`);
    return submarks;
  };

  const handleSelectEvaluation = (evaluation) => {
    if (evaluation.short_id) {
      navigate(`/history/${evaluation.short_id}`);
    } else {
      // Fallback to modal if no short_id
      setSelectedEvaluation(evaluation);
      setShowDetailModal(true);
    }
  };

  const handleSelectForCompare = (selectedEvaluations) => {
    setSelectedForCompare(selectedEvaluations);
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      setShowCompare(true);
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Stats Bar */}
        {hasEvaluations && (
          <motion.div 
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{filteredAndSortedEvaluations.length}</div>
                  <div className="text-sm text-gray-600">Total Essays</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredAndSortedEvaluations.length > 0 
                      ? Math.round(filteredAndSortedEvaluations.reduce((sum, evaluation) => {
                          const grade = parseInt(evaluation.grade?.match(/\d+/)?.[0] || '0');
                          return sum + grade;
                        }, 0) / filteredAndSortedEvaluations.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedForCompare.length}/2
                  </div>
                  <div className="text-sm text-gray-600">Selected for Compare</div>
                </div>
              </div>
              
              {selectedForCompare.length === 2 && (
                <motion.button
                  onClick={handleCompare}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔍 Compare Essays
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Evaluations Content */}
        {isLoadingEvaluations ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Load. Loading. Loading... Loading...</h2>
            <p className="text-gray-600">Getting your evaluation history ready</p>
          </div>
        ) : hasEvaluations ? (
          <EvaluationsGrid
            evaluations={filteredAndSortedEvaluations}
            viewMode={viewMode}
            onSelectEvaluation={handleSelectEvaluation}
            onSelectForCompare={handleSelectForCompare}
            selectedForCompare={selectedForCompare}
            parseFeedbackToBullets={parseFeedbackToBullets}
            getSubmarks={getSubmarks}
          />
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

      {/* Modals */}
      <EvaluationDetailModal
        evaluation={selectedEvaluation}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        parseFeedbackToBullets={parseFeedbackToBullets}
      />

      <CompareModal
        evaluations={selectedForCompare}
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        parseFeedbackToBullets={parseFeedbackToBullets}
        getSubmarks={getSubmarks}
      />
      <Footer />
    </div>
  );
};

export default HistoryPage;
