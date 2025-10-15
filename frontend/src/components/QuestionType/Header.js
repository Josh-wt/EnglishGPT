import React from 'react';

const Header = ({ onBack, levelData }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-pink-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-pink-600 hover:text-pink-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Essay Writing Studio
            </h1>
            <p className="text-sm text-gray-600">Choose a question type and start writing</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg`}>
              <span className="font-bold text-sm">{levelData.levelName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
