import React from 'react';
import { motion } from 'framer-motion';

const EvaluationsGrid = ({ evaluations, viewMode, onSelectEvaluation, onSelectForCompare, selectedForCompare, parseFeedbackToBullets, getSubmarks }) => {
  const isSelected = (evaluation) => {
    return selectedForCompare.find((e) => e.id === evaluation.id);
  };

  const toggleSelectForCompare = (evaluation) => {
    const exists = selectedForCompare.find((e) => e.id === evaluation.id);
    if (exists) {
      onSelectForCompare(selectedForCompare.filter((e) => e.id !== evaluation.id));
    } else {
      onSelectForCompare([...selectedForCompare, evaluation]);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {evaluations.map((evaluation, index) => (
          <motion.div
            key={evaluation.id || index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectEvaluation(evaluation)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{evaluation.questionType || 'Essay'}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(evaluation.timestamp || evaluation.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-purple-600">{evaluation.grade || 'N/A'}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectForCompare(evaluation);
                  }}
                  className={`p-2 rounded-lg ${
                    isSelected(evaluation) 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 line-clamp-2">
              {evaluation.student_response?.substring(0, 200)}...
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {evaluations.map((evaluation, index) => (
        <motion.div
          key={evaluation.id || index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelectEvaluation(evaluation)}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{evaluation.questionType || 'Essay'}</h3>
              <p className="text-sm text-gray-600">
                {new Date(evaluation.timestamp || evaluation.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-purple-600">{evaluation.grade || 'N/A'}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelectForCompare(evaluation);
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected(evaluation) 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-white border-gray-300 hover:border-purple-400'
                }`}
              >
                {isSelected(evaluation) && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 line-clamp-3 mb-4">
            {evaluation.student_response?.substring(0, 150)}...
          </div>

          {/* Submarks */}
          <div className="flex flex-wrap gap-2">
            {getSubmarks(evaluation).map((submark, idx) => (
              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                {submark}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EvaluationsGrid;
