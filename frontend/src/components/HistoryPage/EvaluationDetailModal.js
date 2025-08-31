import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EvaluationDetailModal = ({ evaluation, isOpen, onClose, parseFeedbackToBullets, getSubmarks }) => {
  if (!isOpen || !evaluation) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{evaluation.questionType || 'Essay Evaluation'}</h2>
                <p className="text-gray-600">
                  {new Date(evaluation.timestamp || evaluation.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Grade and Score */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{evaluation.grade || 'N/A'}</div>
                <p className="text-gray-600">Overall Grade</p>
              </div>
              
              {/* Submarks */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {getSubmarks(evaluation).map((submark, idx) => (
                  <span key={idx} className="px-3 py-2 bg-white text-purple-700 font-semibold rounded-lg shadow-sm">
                    {submark}
                  </span>
                ))}
              </div>
            </div>

            {/* Student Response */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Essay</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{evaluation.studentResponse}</p>
              </div>
            </div>

            {/* Feedback */}
            {evaluation.feedback && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {parseFeedbackToBullets(evaluation.feedback).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-800">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Strengths */}
            {evaluation.strengths && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {parseFeedbackToBullets(evaluation.strengths).map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-800">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {evaluation.improvements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {parseFeedbackToBullets(evaluation.improvements).map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">→</span>
                        <span className="text-gray-800">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EvaluationDetailModal;
