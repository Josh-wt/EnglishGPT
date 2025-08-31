import React from 'react';
import { motion } from 'framer-motion';

const WritingInterface = ({
  studentResponse,
  setStudentResponse,
  selectedQuestionType,
  showNextButton,
  onProceed,
  onBack,
  darkMode,
  essayRef,
  applyFormat,
  insertParagraphBreak,
  wordCount,
  lastSavedAt,
  restoredDraft
}) => {
  return (
    <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>✍️ Write Your Response</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyFormat('**')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => applyFormat('*')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            onClick={insertParagraphBreak}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Paragraph Break"
          >
            ¶ Paragraph
          </button>
        </div>
      </div>

      {/* Word Count and Save Status */}
      <div className="flex items-center justify-between mb-4">
        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="font-semibold">{wordCount} words</span>
          {lastSavedAt && (
            <span className="ml-2">• Saved {Math.max(0, Math.floor((Date.now() - lastSavedAt) / 60000))} min ago</span>
          )}
        </div>
        {restoredDraft && (
          <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            ✓ Draft restored
          </div>
        )}
      </div>

      {/* Text Area */}
      <textarea
        ref={essayRef}
        value={studentResponse}
        onChange={(e) => setStudentResponse(e.target.value)}
        placeholder="Start writing your response here..."
        className={`w-full h-96 p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          darkMode
            ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400'
            : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
        }`}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <motion.button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode
              ? 'text-gray-300 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </motion.button>

        {showNextButton && selectedQuestionType && studentResponse.trim() && (
          <motion.button
            onClick={onProceed}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Get AI Feedback Now</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default WritingInterface;
