import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackModal = ({ 
  isOpen, 
  category, 
  onClose, 
  onSubmit, 
  feedbackAccurate, 
  setFeedbackAccurate, 
  feedbackComments, 
  setFeedbackComments, 
  feedbackSubmitting, 
  modalRef, 
  firstModalButtonRef,
  darkMode 
}) => {
  if (!isOpen) return null;

  const getCategoryTitle = () => {
    switch (category) {
      case 'overall':
        return 'Overall Evaluation';
      case 'strengths':
        return 'Strengths Analysis';
      case 'improvements':
        return 'Improvement Suggestions';
      default:
        return 'Evaluation Feedback';
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          ref={modalRef}
          className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'} rounded-2xl max-w-md w-full p-6 border shadow-xl`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="text-center mb-6">
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💬 Feedback on {getCategoryTitle()}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Help us improve our AI evaluation by providing feedback.
            </p>
          </div>

          <div className="space-y-4">
            {/* Accuracy Question */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Was this evaluation accurate?
              </label>
              <div className="flex space-x-3">
                <button
                  ref={firstModalButtonRef}
                  onClick={() => setFeedbackAccurate(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    feedbackAccurate === true
                      ? 'bg-green-600 text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  onClick={() => setFeedbackAccurate(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    feedbackAccurate === false
                      ? 'bg-red-600 text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  ❌ No
                </button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Additional comments (optional)
              </label>
              <textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Share your thoughts on the evaluation..."
                className={`w-full p-3 rounded-lg border resize-none ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                disabled={feedbackSubmitting}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={feedbackSubmitting || feedbackAccurate === null}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  feedbackAccurate === null || feedbackSubmitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
