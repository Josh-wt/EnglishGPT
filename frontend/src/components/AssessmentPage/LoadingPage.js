import React from 'react';
import LoadingSpinner from '../../ui/LoadingSpinner';

const LoadingPage = ({ selectedQuestionType, loadingMessages, currentMessageIndex, darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'} flex items-center justify-center`}>
      <div className="text-center max-w-md">
        <LoadingSpinner 
          message={loadingMessages && loadingMessages[currentMessageIndex] ? loadingMessages[currentMessageIndex] : "🤖 AI is analyzing your essay..."} 
          size="large" 
        />
        
        <div className="loading-subtext mt-4">
          Our AI is carefully analyzing your {selectedQuestionType?.name} submission. This may take up to 60 seconds.
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
