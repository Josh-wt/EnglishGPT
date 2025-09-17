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
                <p className="text-gray-800 whitespace-pre-wrap">{evaluation.student_response}</p>
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
                    {parseFeedbackToBullets(evaluation.strengths)
                      .filter(strength => {
                        // Filter out NEXT STEPS content from strengths
                        const lowerStrength = strength.toLowerCase();
                        return !lowerStrength.includes('next steps') && 
                               !lowerStrength.includes('next step') &&
                               !lowerStrength.includes('practice writing') &&
                               !lowerStrength.includes('create a checklist') &&
                               !lowerStrength.includes('read examples');
                      })
                      .map((strength, idx) => (
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

            {/* Next Steps */}
            {(() => {
              // Extract NEXT STEPS content from strengths if it's not in next_steps
              const extractNextStepsFromStrengths = (strengths) => {
                if (!strengths || !Array.isArray(strengths)) return [];
                
                return strengths.filter(strength => {
                  const lowerStrength = strength.toLowerCase();
                  return lowerStrength.includes('next steps') || 
                         lowerStrength.includes('next step') ||
                         lowerStrength.includes('practice writing') ||
                         lowerStrength.includes('create a checklist') ||
                         lowerStrength.includes('read examples');
                }).map(strength => {
                  // Clean up the strength text to make it a proper next step
                  return strength.replace(/^.*?next steps?:?\s*/i, '').trim();
                });
              };

              // Get next steps from both the dedicated field and from strengths
              const nextStepsFromField = evaluation.next_steps || [];
              const nextStepsFromStrengths = extractNextStepsFromStrengths(evaluation.strengths);
              const allNextSteps = [...nextStepsFromField, ...nextStepsFromStrengths];

              return allNextSteps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Next Steps</h3>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {allNextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600 mt-1 font-bold">{idx + 1}.</span>
                          <span className="text-gray-800">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  const content = `
Essay Evaluation Report
======================

Date: ${new Date(evaluation.timestamp || evaluation.created_at).toLocaleDateString()}
Question Type: ${evaluation.questionType || 'Essay'}
Grade: ${evaluation.grade || 'N/A'}

Your Essay:
-----------
${evaluation.student_response}

Feedback:
---------
${evaluation.feedback || 'No feedback available'}

Strengths:
----------
${evaluation.strengths ? parseFeedbackToBullets(evaluation.strengths).map(s => `• ${s}`).join('\n') : 'No strengths listed'}

Areas for Improvement:
---------------------
${evaluation.improvements ? parseFeedbackToBullets(evaluation.improvements).map(i => `• ${i}`).join('\n') : 'No improvements listed'}

Next Steps:
-----------
${evaluation.next_steps ? evaluation.next_steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n') : 'No next steps provided'}

Submarks:
---------
${getSubmarks(evaluation).join('\n')}
                  `.trim();
                  
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `essay-evaluation-${new Date(evaluation.timestamp || evaluation.created_at).toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EvaluationDetailModal;
