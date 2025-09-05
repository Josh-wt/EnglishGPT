import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import SignInModal from '../modals/SignInModal';

const ResultsPage = ({ evaluation, onNewEvaluation, userPlan, darkMode, user, signInWithGoogle, signInWithDiscord, navigate }) => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'overall' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackAccurate, setFeedbackAccurate] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const modalRef = useRef(null);
  const firstModalButtonRef = useRef(null);

  const submitFeedback = useCallback(async () => {
    if (!evaluation) return;
    if (feedbackAccurate === null) return;
    setFeedbackSubmitting(true);
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        evaluation_id: evaluation.id || evaluation?.evaluation_id || evaluation?.timestamp || 'unknown',
        user_id: evaluation.user_id,
        category: feedbackModal.category,
        accurate: !!feedbackAccurate,
        comments: feedbackComments || null,
        }),
      });
      setFeedbackModal({ open: false, category: 'overall' });
      setFeedbackAccurate(null);
      setFeedbackComments('');
    } catch (e) {
      console.error('Feedback submit failed', e);
    } finally {
      setFeedbackSubmitting(false);
    }
  }, [evaluation, feedbackAccurate, feedbackComments, feedbackModal.category]);

  useEffect(() => {
    // Keyboard shortcuts: 1/2/3 switch tabs; Esc closes modal; Enter submits when modal open
    const handler = (e) => {
      if (feedbackModal.open) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setFeedbackModal({ open: false, category: 'overall' });
          setFeedbackAccurate(null);
          setFeedbackComments('');
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!feedbackSubmitting && feedbackAccurate !== null) {
            submitFeedback();
          }
        }
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        return;
      }
      if (e.key === '1') setActiveTab('Summary');
      if (e.key === '2') setActiveTab('Strengths');
      if (e.key === '3') setActiveTab('Improvements');
      if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => prev === 'Strengths' ? 'Summary' : prev === 'Improvements' ? 'Strengths' : 'Improvements');
      }
      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => prev === 'Summary' ? 'Strengths' : prev === 'Improvements' ? 'Summary' : 'Summary');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feedbackModal.open, feedbackSubmitting, feedbackAccurate, submitFeedback]);

  useEffect(() => {
    // Focus trap when modal opens
    if (feedbackModal.open) {
      setTimeout(() => {
        firstModalButtonRef.current?.focus();
      }, 0);
    }
  }, [feedbackModal.open]);
  
  // Extract submarks dynamically per question type and present as "xx/xx"
  const getSubmarks = (evaluation) => {
    console.log('🔍 DEBUG: getSubmarks called with evaluation:', evaluation);
    
    if (!evaluation) {
      console.log('❌ No evaluation provided to getSubmarks');
      return [];
    }

    const metricsByType = {
      igcse_writers_effect: ['READING'],
      igcse_descriptive: ['CONTENT_STRUCTURE', 'STYLE_ACCURACY'],
      igcse_narrative: ['CONTENT_STRUCTURE', 'STYLE_ACCURACY'],
      igcse_summary: ['READING', 'WRITING'],
      igcse_directed: ['READING', 'WRITING'],
      alevel_directed: ['AO1', 'AO2'],
      alevel_comparative: ['AO1', 'AO2'], // AO3 is stored in ao2_marks field
      alevel_text_analysis: ['AO1', 'AO2'], // AO3 is stored in ao2_marks field
      alevel_language_change: ['AO2', 'AO1', 'READING'], // AO4 stored in ao1_marks, AO5 stored in reading_marks
      sat_essay: ['READING', 'WRITING']
    };

    const questionType = evaluation.question_type;
    console.log('🔍 DEBUG: Question type:', questionType);
    
    const metrics = metricsByType[questionType] || [];
    console.log('🔍 DEBUG: Metrics for this question type:', metrics);

    const submarks = metrics.map(metric => {
      let value = 'N/A';
      
      console.log('🔍 DEBUG: Processing metric:', metric);
      
      if (metric === 'CONTENT_STRUCTURE') {
        value = evaluation.content_structure_marks || 'N/A';
        console.log('🔍 DEBUG: Content Structure marks:', value);
      } else if (metric === 'STYLE_ACCURACY') {
        value = evaluation.style_accuracy_marks || 'N/A';
        console.log('🔍 DEBUG: Style Accuracy marks:', value);
      } else if (metric === 'AO3') {
        // AO3 is stored in ao2_marks field for some question types
        value = evaluation.ao2_marks || 'N/A';
        console.log('🔍 DEBUG: AO3 marks (from ao2_marks):', value);
      } else {
        const fieldName = `${metric.toLowerCase()}_marks`;
        value = evaluation[fieldName] || 'N/A';
        console.log('🔍 DEBUG: Field name:', fieldName, 'Value:', value);
      }
      
      return {
        label: metric.replace('_', ' '),
        value: value
      };
    }).filter(submark => {
      const isValid = submark.value !== 'N/A' && submark.value !== null && submark.value !== undefined;
      console.log('🔍 DEBUG: Submark validation:', submark.label, submark.value, 'Valid:', isValid);
      return isValid;
    });

    console.log('🔍 DEBUG: Final submarks:', submarks);
    return submarks;
  };
  // Parse grade to get score
  const parseGrade = (gradeString) => {
    console.log('🔍 DEBUG: parseGrade called with:', gradeString);
    console.log('🔍 DEBUG: evaluation object:', evaluation);
    
    // Always try to calculate from submarks first, as they're more accurate
    const submarks = getSubmarks(evaluation);
    console.log('🔍 DEBUG: Submarks found:', submarks);
    
    if (submarks.length > 0) {
      let totalScore = 0;
      let maxScore = 0;
      submarks.forEach(submark => {
        console.log('🔍 DEBUG: Processing submark:', submark);
        // Handle different formats: "5/16 |", "6/24", etc.
        const cleanValue = submark.value.replace(/\|/g, '').trim();
        const [score, max] = cleanValue.split('/').map(Number);
        console.log('🔍 DEBUG: Parsed submark - score:', score, 'max:', max);
        if (!isNaN(score) && !isNaN(max)) {
          totalScore += score;
          maxScore += max;
        }
      });
      console.log('🔍 DEBUG: Calculated from submarks - totalScore:', totalScore, 'maxScore:', maxScore);
      
      if (maxScore > 0) {
        return { 
          score: totalScore, 
          maxScore, 
          percentage: (totalScore / maxScore * 100).toFixed(1) 
        };
      }
    }
    
    // Fallback to parsing grade string if no submarks available
    if (gradeString) {
      console.log('🔍 DEBUG: Falling back to grade string parsing');
      const matches = gradeString.match(/(\d+)\/(\d+)/g);
      if (matches) {
        let totalScore = 0;
        let maxScore = 0;
        matches.forEach(match => {
          const [score, max] = match.split('/').map(Number);
          totalScore += score;
          maxScore += max;
        });
        console.log('🔍 DEBUG: Parsed from grade string - score:', totalScore, 'maxScore:', maxScore);
        return { score: totalScore, maxScore, percentage: (totalScore / maxScore * 100).toFixed(1) };
      }
    }
    
    console.log('🔍 DEBUG: No valid grade format found, using defaults');
    return { score: 0, maxScore: 40, percentage: 0 };
  };
  
  const gradeInfo = parseGrade(evaluation?.grade);
  
  // Determine letter grade
  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A*';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'U';
  };
  
  const letterGrade = getLetterGrade(gradeInfo.percentage);
  
  // Add loading state for when evaluation is not available
  if (!evaluation) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading results..." size="default" />
      </div>
    );
  }

  // Parse feedback text into bullet points
  const parseFeedbackToBullets = (feedback) => {
    if (!feedback) return [];
    
    // Split by common delimiters
    const sentences = feedback
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Only meaningful sentences
      .slice(0, 10); // Limit to 10 points
    
    return sentences;
  };

  // Note: handleNewEvaluation is now passed as a prop from App.js


  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Overall Score Card */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 mb-6 shadow-sm border`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Overall Score</h2>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Grade {letterGrade}</div>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-6xl font-extrabold text-blue-600 mb-2">{gradeInfo.score}/{gradeInfo.maxScore}</div>
            <div className="text-blue-600 text-lg font-semibold">Total Score</div>
            </div>
          <div className={`w-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-2 mb-1`}>
            <div 
              className="h-3 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(gradeInfo.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {(() => {
              const submarks = getSubmarks(evaluation);
              console.log('🔍 DEBUG: Rendering submarks:', submarks);
              console.log('🔍 DEBUG: Submarks length:', submarks.length);
              
              if (submarks.length === 0) {
                console.log('⚠️ No submarks to display');
                return (
                  <div className="text-center px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="text-gray-500 text-sm">No detailed marks available</div>
                  </div>
                );
              }
              
              return submarks.map((submark, idx) => {
                console.log('🔍 DEBUG: Rendering submark:', submark, 'index:', idx);
                return (
                  <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-200" key={submark.label + idx}>
                    <div className="text-2xl font-extrabold text-green-700 tracking-tight">{submark.value}</div>
                    <div className="text-green-700 text-sm mt-0.5">{submark.label}</div>
                  </div>
                );
              });
            })()}
          </div>
                </div>

        {/* Overall feedback prompt (separate box) */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 mb-6 border flex items-center justify-between`}>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
            Was this marking accurate?
          </div>
          <button
            onClick={() => setFeedbackModal({ open: true, category: 'overall' })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Give feedback
          </button>
        </div>
        

        
        {/* Detailed Feedback Card */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 mb-6 shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Feedback</h2>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {['Summary', 'Strengths', 'Improvements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'Summary' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4">Detailed Feedback</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="list-disc pl-5 text-gray-700 leading-relaxed space-y-2">
                    {parseFeedbackToBullets(evaluation.feedback)}
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'Strengths' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 mb-4">What You Did Well</h4>
                <div className="space-y-3">
                  {(() => {
                    // Completely new strengths processing
                    let strengthsArray = [];
                    
                    if (evaluation.strengths && Array.isArray(evaluation.strengths)) {
                      strengthsArray = evaluation.strengths.filter(s => s && s.trim() && s.trim().length > 0);
                    } else if (evaluation.strengths && typeof evaluation.strengths === 'string') {
                      const strengthsText = evaluation.strengths.trim();
                      
                      // Try multiple parsing methods
                      if (strengthsText.includes('|')) {
                        // Split by pipe
                        strengthsArray = strengthsText.split('|').map(s => s.trim()).filter(s => s && s.length > 0);
                      } else if (strengthsText.includes('\n')) {
                        // Split by newlines
                        strengthsArray = strengthsText.split('\n').map(s => s.trim()).filter(s => s && s.length > 0);
                      } else {
                        // Use as single strength only if not empty
                        if (strengthsText && strengthsText.length > 0) {
                          strengthsArray = [strengthsText];
                        }
                      }
                    }
                    
                    // Additional filter to remove any remaining empty strings
                    strengthsArray = strengthsArray.filter(s => s && s.trim() && s.trim().length > 0);
                    
                    return strengthsArray.length > 0 ? (
                      strengthsArray.map((strength, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-green-800 font-medium leading-relaxed">
                                {strength}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-700 text-center">
                          No specific strengths identified in this evaluation.
                          {evaluation.strengths && (
                            <span className="block text-xs text-gray-500 mt-2">

                            </span>
                          )}
                        </p>
                  </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {activeTab === 'Improvements' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-yellow-800 mb-4">Areas for Improvement</h4>
                <div className="space-y-3">
                {evaluation.improvement_suggestions && evaluation.improvement_suggestions.length > 0 ? (
                    evaluation.improvement_suggestions.flatMap((suggestion, idx) => {
                      // Split by numbered points (e.g., 1. 2. 3.)
                      const split = suggestion.split(/\s*(?=\d+\.)/g).map(s => s.trim()).filter(Boolean);
                      return split.map((point, i) => (
                        <div key={idx + '-' + i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {i + 1}
                    </div>
                            <div className="flex-1">
                              <p className="text-yellow-800 font-medium leading-relaxed">
                                {point.replace(/^(\d+\.)\s*/, '')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-700 text-center">No specific improvements suggested. Great work!</p>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onNewEvaluation}
            className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Start New Question
          </button>
        </div>
      </div>

      {/* Strengths feedback prompt (separate box) */}
      {activeTab === 'Strengths' && (
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 mb-6 border flex items-center justify-between`}>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
            Was this strengths summary accurate?
          </div>
          <button
            onClick={() => setFeedbackModal({ open: true, category: 'strengths' })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Give feedback
          </button>
        </div>
      )}

      {/* Improvements feedback prompt (separate box) */}
      {activeTab === 'Improvements' && (
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 mb-6 border flex items-center justify-between`}>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
            Was this improvements summary accurate?
          </div>
          <button
            onClick={() => setFeedbackModal({ open: true, category: 'improvements' })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Give feedback
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Feedback on marking accuracy">
          <div ref={modalRef} className={`${darkMode ? 'bg-black text-white border-gray-700' : 'bg-white text-gray-900'} border rounded-2xl p-6 max-w-md mx-4 shadow-xl w-full`}>
            <h3 className="text-lg font-semibold mb-2">
              {feedbackModal.category === 'overall' && 'Was this marking accurate?'}
              {feedbackModal.category === 'strengths' && 'Was this strengths summary accurate?'}
              {feedbackModal.category === 'improvements' && 'Was this improvements summary accurate?'}
            </h3>
            <div className="flex gap-3 mt-3">
              <button ref={firstModalButtonRef} onClick={() => setFeedbackAccurate(true)} className={`px-4 py-2 rounded-lg border ${feedbackAccurate === true ? 'bg-green-600 text-white' : 'bg-transparent'}`} aria-pressed={feedbackAccurate === true}>Yes</button>
              <button onClick={() => setFeedbackAccurate(false)} className={`px-4 py-2 rounded-lg border ${feedbackAccurate === false ? 'bg-red-600 text-white' : 'bg-transparent'}`} aria-pressed={feedbackAccurate === false}>No</button>
            </div>
            <textarea
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              placeholder="Optional comments"
              className={`${darkMode ? 'bg-black border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} mt-4 w-full border rounded-lg p-3`}
              rows={3}
              aria-label="Additional comments"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setFeedbackModal({ open: false, category: 'overall' }); setFeedbackAccurate(null); setFeedbackComments(''); }} className="px-4 py-2 rounded-lg border" aria-label="Cancel feedback">Cancel</button>
              <button onClick={submitFeedback} disabled={feedbackSubmitting || feedbackAccurate === null} className={`px-4 py-2 rounded-lg ${feedbackSubmitting || feedbackAccurate === null ? 'bg-gray-300' : 'bg-blue-600 text-white'}`} aria-disabled={feedbackSubmitting || feedbackAccurate === null}>
                {feedbackSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
        darkMode={darkMode}
        onGoogle={signInWithGoogle}
        onDiscord={signInWithDiscord}
        user={user}
        navigate={navigate}
      />
    </div>
  );
};

export default ResultsPage;