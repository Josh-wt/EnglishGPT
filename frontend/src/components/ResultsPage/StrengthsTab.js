import React from 'react';
import { motion } from 'framer-motion';

const StrengthsTab = ({ evaluation, darkMode, onFeedback }) => {
  // Extract strengths directly from strengths
  const getStrengths = () => {
    return evaluation.strengths || [];
  };

  const strengths = getStrengths();

  return (
    <div className="space-y-8">
      {/* Strengths List */}
      <motion.div 
        className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ✅ Key Strengths
        </h2>
        
        {strengths && strengths.length > 0 ? (
          <div className="space-y-4">
            {strengths.map((strength, index) => (
              <motion.div 
                key={index}
                className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    ✓
                  </div>
                  <p className={`${darkMode ? 'text-green-200' : 'text-green-800'} font-medium`}>
                    {strength}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>No specific strengths identified for this evaluation.</p>
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
          onClick={() => onFeedback('strengths')}
          className={`px-8 py-4 rounded-xl font-semibold transition-colors ${
            darkMode 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          💬 Feedback on Strengths Analysis
        </motion.button>
      </motion.div>
    </div>
  );
};

export default StrengthsTab;
