import React from 'react';
import { motion } from 'framer-motion';
import { formatQuestionTypeName } from '../../utils/questionTypeFormatter';

const Header = ({ evaluation, gradeInfo, letterGrade, onNewEvaluation, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.div 
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                gradeInfo.percentage >= 80 ? 'bg-green-100 text-green-800' :
                gradeInfo.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {letterGrade}
            </motion.div>
            
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatQuestionTypeName(evaluation.question_type)}
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Score: {gradeInfo.score}/{gradeInfo.maxScore} ({gradeInfo.percentage}%)
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {new Date(evaluation.timestamp).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={onNewEvaluation}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ New Evaluation
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Header;
