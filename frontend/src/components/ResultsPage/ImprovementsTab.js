import React from 'react';
import { motion } from 'framer-motion';

const ImprovementsTab = ({ evaluation, darkMode, onFeedback }) => {
  // Extract improvements (1st, 2nd, 3rd bullet points from AI response)
  const getImprovements = () => {
    if (!evaluation.improvement_suggestions || !Array.isArray(evaluation.improvement_suggestions)) return [];
    // AI provides 9 points: 1-3 improvements, 4-6 strengths, 7-9 next steps
    return evaluation.improvement_suggestions.slice(0, 3); // Get points 1, 2, 3
  };

  // Extract next steps (7th, 8th, 9th bullet points from AI response)
  const getNextSteps = () => {
    if (!evaluation.next_steps || !Array.isArray(evaluation.next_steps)) return [];
    // AI provides 9 points: 1-3 improvements, 4-6 strengths, 7-9 next steps
    return evaluation.next_steps.slice(6, 9); // Get points 7, 8, 9
  };

  const improvements = getImprovements();
  const nextSteps = getNextSteps();

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
        
        {improvements && improvements.length > 0 ? (
          <div className="space-y-4">
            {improvements.map((improvement, index) => (
              <motion.div 
                key={index}
                className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'} font-medium`}>
                    {improvement}
                  </p>
                </div>
              </motion.div>
            ))}
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
        {nextSteps && nextSteps.length > 0 ? (
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
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
