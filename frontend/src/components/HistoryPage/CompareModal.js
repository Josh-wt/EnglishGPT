import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CompareModal = ({ evaluations, isOpen, onClose, parseFeedbackToBullets, getSubmarks }) => {
  if (!isOpen || evaluations.length !== 2) return null;

  const [a, b] = evaluations;

  const StrengthsDiffChip = ({ a, b }) => {
    const aScore = parseInt(a.grade?.match(/\d+/)?.[0] || '0');
    const bScore = parseInt(b.grade?.match(/\d+/)?.[0] || '0');
    const diff = bScore - aScore;
    
    if (diff === 0) return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Same</span>;
    if (diff > 0) return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">+{diff}</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">{diff}</span>;
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Compare Essays</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Essay A */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Essay A</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">{a.questionType || 'Essay'}</p>
                      <p className="text-xs text-blue-600">
                        {new Date(a.timestamp || a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{a.grade || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-800">{a.student_response?.substring(0, 300)}...</p>
                </div>

                {a.strengths && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
                    <div className="bg-green-50 rounded-lg p-3">
                      <ul className="space-y-1">
                        {parseFeedbackToBullets(a.strengths).slice(0, 3).map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="text-gray-800">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Essay B */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Essay B</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700">{b.questionType || 'Essay'}</p>
                      <p className="text-xs text-purple-600">
                        {new Date(b.timestamp || b.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{b.grade || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-800">{b.student_response?.substring(0, 300)}...</p>
                </div>

                {b.strengths && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
                    <div className="bg-green-50 rounded-lg p-3">
                      <ul className="space-y-1">
                        {parseFeedbackToBullets(b.strengths).slice(0, 3).map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="text-gray-800">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{a.grade || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Essay A Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{b.grade || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Essay B Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    <StrengthsDiffChip a={a} b={b} />
                  </div>
                  <div className="text-sm text-gray-600">Difference</div>
                </div>
              </div>
              
              {/* Detailed Comparison */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Essay A Improvements</h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    {a.improvements ? (
                      <ul className="space-y-1">
                        {parseFeedbackToBullets(a.improvements).slice(0, 3).map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600 mt-0.5">→</span>
                            <span className="text-gray-800">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">No improvements listed</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Essay B Improvements</h4>
                  <div className="bg-purple-50 rounded-lg p-3">
                    {b.improvements ? (
                      <ul className="space-y-1">
                        {parseFeedbackToBullets(b.improvements).slice(0, 3).map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-purple-600 mt-0.5">→</span>
                            <span className="text-gray-800">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">No improvements listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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

export default CompareModal;
