import React from 'react';

const Header = ({ onBack, darkMode }) => {
  return (
    <div className="text-center mb-8">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 mb-4 flex items-center mx-auto"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Essay
      </button>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>📋 Add Marking Scheme</h1>
      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your essay is ready! Now add the marking scheme for accurate evaluation.</p>
    </div>
  );
};

export default Header;
