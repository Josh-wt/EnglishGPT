import React from 'react';
import LoadingSpinner from '../../ui/LoadingSpinner';

const LoadingPage = ({ selectedQuestionType, loadingMessages, currentMessageIndex, darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'} flex items-center justify-center p-4`}>
      <div className="text-center max-w-lg">
        {/* Book Loader */}
        <div className="mb-8">
          <LoadingSpinner 
            message="" 
            size="large" 
          />
        </div>
        
        {/* Small text with spacing */}
        <div className="text-gray-600 text-lg font-fredoka mb-8">
          Our AI is doing the magic, please wait
        </div>
        
        {/* Pink box modal with changing text */}
        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg border border-pink-300 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl mb-3">✨</div>
            <div className="text-gray-800 font-fredoka text-lg font-medium">
              {loadingMessages && loadingMessages[currentMessageIndex] ? loadingMessages[currentMessageIndex] : "🤖 AI is analyzing your essay..."}
            </div>
            <div className="text-gray-600 text-sm mt-2 font-fredoka">
              Our AI is carefully analyzing your {selectedQuestionType?.name} submission. This may take up to 60 seconds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
