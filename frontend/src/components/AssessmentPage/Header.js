import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ selectedQuestionType, onBack, darkMode }) => {
  return (
    <div className="flex items-center justify-between">
      <motion.button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          darkMode 
            ? 'text-gray-300 hover:text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>

      <div className="text-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          ✨ AI Evaluation
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {selectedQuestionType?.name || 'Essay'} • Ready for feedback
        </p>
      </div>

      <div className="w-20"></div> {/* Spacer for centering */}
    </div>
  );
};

export default Header;
