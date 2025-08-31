import React from 'react';

const LoadingPage = ({ selectedQuestionType, loadingMessages, currentMessageIndex, darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'} flex items-center justify-center`}>
      <div className="text-center max-w-md">
        <div className="loading-animation">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          
          <div className="loading-text">
            {loadingMessages && loadingMessages[currentMessageIndex] ? loadingMessages[currentMessageIndex] : "🤖 AI is analyzing your essay..."}
          </div>
          
          <div className="loading-subtext">
            Our AI is carefully analyzing your {selectedQuestionType?.name} submission. This may take up to 60 seconds.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
