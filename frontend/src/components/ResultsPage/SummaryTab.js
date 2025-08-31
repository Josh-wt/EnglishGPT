import React from 'react';
import { motion } from 'framer-motion';

const SummaryTab = ({ evaluation, gradeInfo, letterGrade, darkMode, onFeedback }) => {
  return (
    <div className="space-y-8">
      {/* Grade Summary */}
      <motion.div 
        className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Overall Performance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              gradeInfo.percentage >= 80 ? 'text-green-600' :
              gradeInfo.percentage >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {letterGrade}
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Letter Grade</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2 text-purple-600">
              {gradeInfo.percentage}%
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Percentage</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2 text-blue-600">
              {gradeInfo.score}/{gradeInfo.maxScore}
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Raw Score</p>
          </div>
        </div>
      </motion.div>

      {/* Question Details */}
      <motion.div 
        className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📝 Question Details
        </h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Question Type:</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {evaluation.question_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Evaluation Date:</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {new Date(evaluation.timestamp).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Word Count:</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {evaluation.student_response.split(/\s+/).filter(word => word.length > 0).length} words
            </span>
          </div>
        </div>
      </motion.div>

      {/* Feedback Button */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={() => onFeedback('overall')}
          className={`px-8 py-4 rounded-xl font-semibold transition-colors ${
            darkMode 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          💬 Provide Feedback on This Evaluation
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SummaryTab;
