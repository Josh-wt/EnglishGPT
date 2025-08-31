import React from 'react';

const QuestionSelection = ({ levelData, selectedQuestionType, onQuestionSelect, onShowExample, onGeneratePrompt }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Choose Question Type</h2>
        <div className={`bg-gradient-to-r ${levelData.gradient} text-white px-3 py-1 rounded-lg shadow-md`}>
          <span className="font-bold text-sm">{levelData.levelName}</span>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 text-sm mb-2">{levelData.fullName}</h3>
        <div className="text-xs text-gray-500">
          {levelData.questions.length} question types available
        </div>
      </div>
      <div className="space-y-3">
        {levelData.questions.length > 0 ? (
          levelData.questions.map((question) => (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(question)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 border group hover:scale-[1.02] ${
                selectedQuestionType?.id === question.id
                  ? 'border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-lg ring-2 ring-pink-200'
                  : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-pink-50'
              }`}
              aria-pressed={selectedQuestionType?.id === question.id}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                  selectedQuestionType?.id === question.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-pink-100 group-hover:to-purple-100'
                }`}>
                  <span className="text-xl">{question.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-base truncate">{question.name}</h4>
                    {selectedQuestionType?.id === question.id && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{question.description}</p>
                  {question.requiresScheme && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        📋 Requires marking scheme
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">📚</div>
            <p className="font-medium text-gray-500">No questions found for {levelData.levelName}</p>
            <p className="text-sm text-gray-400 mt-2">Please select a different level or contact support</p>
          </div>
        )}
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-purple-900 text-lg">Writing Tips</h3>
            <p className="text-purple-700 text-sm">Maximize your {selectedQuestionType?.name || levelData.levelName} performance</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { icon: '📋', tip: 'Plan briefly: outline intro, key points, and conclusion' },
            { icon: '📚', tip: 'Use precise vocabulary and vary sentence structure' },
            { icon: '🎯', tip: 'Keep a consistent tone and answer the prompt directly' },
            { icon: '📊', tip: 'Target the word goal shown in your progress indicator' }
          ].map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-lg mt-0.5">{item.icon}</span>
              <span className="text-gray-700 text-sm leading-relaxed">{item.tip}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button 
            onClick={onShowExample} 
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-300 text-purple-700 font-medium hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
          >
            View Example
          </button>
          <button 
            onClick={onGeneratePrompt} 
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all duration-200"
          >
            Generate Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelection;
