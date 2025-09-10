import React from 'react';
import { motion } from 'framer-motion';

const ImprovementsTab = ({ evaluation, darkMode, onFeedback }) => {
  return (
    <div className="space-y-8">
      {/* Improvements List */}
      <motion.div 
        className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          💡 Areas for Improvement
        </h2>
        
        {evaluation.improvement_suggestions && evaluation.improvement_suggestions.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              // Flatten all suggestions and split by numbered points, then number them sequentially
              let pointCounter = 1;
              return evaluation.improvement_suggestions.flatMap((suggestion, suggestionIndex) => {
                // Split by numbered points (e.g., 1. 2. 3.)
                const split = suggestion.split(/\s*(?=\d+\.)/g).map(s => s.trim()).filter(Boolean);
                return split.map((point, pointIndex) => (
                  <motion.div 
                    key={`${suggestionIndex}-${pointIndex}`}
                    className={`p-4 rounded-xl border ${
                      darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (pointCounter - 1) * 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        {pointCounter++}
                      </div>
                      <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'} font-medium`}>
                        {point.replace(/^(\d+\.)\s*/, '')}
                      </p>
                    </div>
                  </motion.div>
                ));
              });
            })()}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>No specific improvement suggestions for this evaluation.</p>
          </div>
        )}
      </motion.div>

      {/* Action Plan */}
      <motion.div 
        className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 Next Steps
        </h3>
        {evaluation.next_steps && evaluation.next_steps.length > 0 ? (
          <div className="space-y-3">
            {evaluation.next_steps.map((step, index) => (
              <motion.div 
                key={index}
                className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} font-medium`}>
                    {step}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>No specific next steps provided for this evaluation.</p>
          </div>
        )}
      </motion.div>

      {/* Feedback Button */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={() => onFeedback('improvements')}
          className={`px-8 py-4 rounded-xl font-semibold transition-colors ${
            darkMode 
              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          💬 Feedback on Improvement Suggestions
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ImprovementsTab;
