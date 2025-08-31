import React from 'react';

const WritingInterface = ({ 
  selectedQuestionType, 
  studentResponse, 
  setStudentResponse, 
  wordCount, 
  levelData, 
  showNextButton, 
  showMarkingSchemeChoice, 
  onProceed, 
  applyFormat, 
  insertParagraphBreak, 
  essayRef, 
  lastSavedAt 
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📝</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Essay Writing Studio</h2>
            <p className="text-gray-600 text-sm">
              {selectedQuestionType ? `Writing: ${selectedQuestionType.name}` : 'Select a question type to begin'}
            </p>
          </div>
        </div>
        {selectedQuestionType && (
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-xl border border-pink-200">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{selectedQuestionType.icon}</span>
                <span className="text-sm font-bold text-purple-700">{selectedQuestionType.name}</span>
              </div>
            </div>
            {studentResponse.trim() && (
              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm font-medium text-gray-700">{wordCount} words</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Formatting Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyFormat('**')}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => applyFormat('*')}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium"
          >
            <em>I</em>
          </button>
          <button
            onClick={insertParagraphBreak}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium"
          >
            ¶ Paragraph
          </button>
          <div className="border-l border-gray-300 h-8 mx-2"></div>
          <button
            onClick={() => setStudentResponse('')}
            className="px-3 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 font-medium"
          >
            🗑️ Clear
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Format your text:</span>
        </div>
      </div>

      {/* Enhanced Writing Area */}
      <div className="relative">
        <textarea
          value={studentResponse}
          onChange={(e) => setStudentResponse(e.target.value)}
          placeholder={`Start writing your ${levelData.levelName} essay here...\n\nSelect a question type from the left panel and begin writing your response.`}
          className="w-full h-96 p-6 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none text-gray-700 placeholder-gray-400 leading-relaxed bg-gradient-to-br from-white to-gray-50 transition-all duration-200"
          aria-label="Essay input"
          ref={essayRef}
        />
        {studentResponse.trim() && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-700 font-medium">
              {wordCount} words
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Action Buttons */}
      <div className="mt-6 flex items-center justify-end space-x-3">
        {showMarkingSchemeChoice && selectedQuestionType && studentResponse.trim() && (
          <>
            <button
              onClick={() => onProceed(false)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>Skip Scheme</span>
            </button>
            <button
              onClick={() => onProceed(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Add Scheme</span>
            </button>
          </>
        )}

        {showNextButton && selectedQuestionType && studentResponse.trim() && !showMarkingSchemeChoice && (
          <button
            onClick={onProceed}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-3"
          >
            <span className="text-xl">✨</span>
            <span>{selectedQuestionType.requiresScheme === true ? 'Add Marking Scheme' : 'Get AI Feedback Now'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}

        {!selectedQuestionType && (
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 px-8 py-4 rounded-xl font-bold flex items-center space-x-2">
            <span>📚</span>
            <span>Select a question type first</span>
          </div>
        )}

        {selectedQuestionType && !studentResponse.trim() && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 px-8 py-4 rounded-xl font-bold flex items-center space-x-2">
            <span>✍️</span>
            <span>Start writing to continue</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingInterface;
