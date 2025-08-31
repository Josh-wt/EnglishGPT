import React from 'react';

const EssayPreview = ({ selectedQuestionType, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} rounded-xl p-4 mb-6 border`}>
      <div className="flex items-center mb-2">
        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Essay Ready ({selectedQuestionType.name})</h3>
      </div>
      <p className={`${darkMode ? 'text-green-200' : 'text-green-700'} text-sm`}>
        {selectedQuestionType.studentResponse.substring(0, 150)}...
      </p>
    </div>
  );
};

export default EssayPreview;
