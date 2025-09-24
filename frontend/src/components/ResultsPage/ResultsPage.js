import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import SignInModal from '../modals/SignInModal';
import FeedbackModal from './FeedbackModal';
import SummaryTab from './SummaryTab';
import StrengthsTab from './StrengthsTab';
import ImprovementsTab from './ImprovementsTab';
import { getBackendUrl } from '../../utils/backendUrl';

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
    console.log('🔄 FEEDBACK DEBUG: submitFeedback called');
    console.log('📊 FEEDBACK DEBUG: Current state:', {
      evaluation: evaluation ? {
        id: evaluation.id,
        evaluation_id: evaluation.evaluation_id,
        timestamp: evaluation.timestamp,
        user_id: evaluation.user_id
      } : null,
      feedbackAccurate,
      feedbackComments,
      feedbackModal,
      feedbackSubmitting
    });

    if (!evaluation) {
      console.error('❌ FEEDBACK DEBUG: No evaluation provided');
      return;
    }
    if (feedbackAccurate === null) {
      console.error('❌ FEEDBACK DEBUG: feedbackAccurate is null');
      return;
    }

    console.log('🔄 FEEDBACK DEBUG: Setting feedbackSubmitting to true');
    setFeedbackSubmitting(true);

    const backendUrl = getBackendUrl();
    const feedbackPayload = {
      evaluation_id: evaluation.id || evaluation?.evaluation_id || evaluation?.timestamp || 'unknown',
      user_id: evaluation.user_id,
      category: feedbackModal.category,
      accurate: !!feedbackAccurate,
      comments: feedbackComments || null,
    };

    console.log('📡 FEEDBACK DEBUG: Making request to:', `${backendUrl}/api/feedback`);
    console.log('📦 FEEDBACK DEBUG: Payload:', feedbackPayload);

    try {
      const response = await fetch(`${backendUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackPayload),
      });

      console.log('📈 FEEDBACK DEBUG: Response status:', response.status);
      console.log('📈 FEEDBACK DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ FEEDBACK DEBUG: Response not ok:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.text();
      console.log('✅ FEEDBACK DEBUG: Success response:', responseData);

      console.log('🔄 FEEDBACK DEBUG: Resetting modal state');
      setFeedbackModal({ open: false, category: 'overall' });
      setFeedbackAccurate(null);
      setFeedbackComments('');
      console.log('✅ FEEDBACK DEBUG: Feedback submitted successfully');

    } catch (e) {
      console.error('❌ FEEDBACK DEBUG: Submit failed with error:', e);
      console.error('❌ FEEDBACK DEBUG: Error details:', {
        name: e.name,
        message: e.message,
        stack: e.stack
      });
      
      // Show user-friendly error message
      alert(`Feedback submission failed: ${e.message}. Please try again.`);
    } finally {
      console.log('🔄 FEEDBACK DEBUG: Setting feedbackSubmitting to false');
      setFeedbackSubmitting(false);
    }
  }, [evaluation, feedbackAccurate, feedbackComments, feedbackModal.category]);

  // Function to handle feedback requests from tab components
  const handleFeedback = useCallback((category) => {
    console.log('🔄 FEEDBACK DEBUG: handleFeedback called with category:', category);
    console.log('📊 FEEDBACK DEBUG: Current modal state before update:', feedbackModal);
    setFeedbackModal({ open: true, category });
    console.log('✅ FEEDBACK DEBUG: Modal state updated to open with category:', category);
  }, [feedbackModal]);

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
      alevel_reflective_commentary: ['AO2'], // AO3 is stored in ao2_marks field, out of 10
      alevel_language_change: ['AO2', 'AO1', 'READING'], // AO4 stored in ao1_marks, AO5 stored in reading_marks
      gp_essay: ['AO1', 'AO2', 'AO3'],
      sat_essay: ['READING', 'WRITING']
    };

    // Define the maximum marks for each metric per question type
    const maxMarksByType = {
      igcse_writers_effect: { READING: 15 },
      igcse_descriptive: { CONTENT_STRUCTURE: 16, STYLE_ACCURACY: 24 },
      igcse_narrative: { CONTENT_STRUCTURE: 16, STYLE_ACCURACY: 24 },
      igcse_summary: { READING: 15, WRITING: 25 },
      igcse_directed: { READING: 15, WRITING: 25 },
      alevel_directed: { AO1: 5, AO2: 5 },
      alevel_comparative: { AO1: 5, AO2: 10 },
      alevel_text_analysis: { AO1: 5, AO2: 20 },
      alevel_reflective_commentary: { AO2: 10 }, // AO3 out of 10
      alevel_language_change: { AO2: 5, AO1: 5, READING: 15 },
      gp_essay: { AO1: 6, AO2: 12, AO3: 12 },
      sat_essay: { READING: 8, WRITING: 16 }
    };

    const questionType = evaluation.question_type;
    console.log('🔍 DEBUG: Question type:', questionType);
    
    const metrics = metricsByType[questionType] || [];
    const maxMarks = maxMarksByType[questionType] || {};
    console.log('🔍 DEBUG: Metrics for this question type:', metrics);
    console.log('🔍 DEBUG: Max marks for this question type:', maxMarks);

    const submarks = metrics.map(metric => {
      let value = 'N/A';
      
      console.log('🔍 DEBUG: Processing metric:', metric);
      
      if (metric === 'CONTENT_STRUCTURE') {
        value = evaluation.content_structure_marks || 'N/A';
        console.log('🔍 DEBUG: Content Structure marks:', value);
      } else if (metric === 'STYLE_ACCURACY') {
        value = evaluation.style_accuracy_marks || 'N/A';
        console.log('🔍 DEBUG: Style Accuracy marks:', value);
      } else if (metric === 'AO2') {
        // AO2 is stored in ao2_marks field for gp_essay
        if (questionType === 'gp_essay') {
          value = evaluation.ao2_marks || 'N/A';
          console.log('🔍 DEBUG: AO2 marks (from ao2_marks for gp_essay):', value);
        } else {
          value = evaluation.ao2_marks || 'N/A';
          console.log('🔍 DEBUG: AO2 marks (from ao2_marks for other types):', value);
        }
      } else if (metric === 'AO3') {
        // AO3 is stored in ao3_marks field for gp_essay, ao2_marks for other types
        if (questionType === 'gp_essay') {
          value = evaluation.ao3_marks || 'N/A';
          console.log('🔍 DEBUG: AO3 marks (from ao3_marks for gp_essay):', value);
        } else {
          value = evaluation.ao2_marks || 'N/A';
          console.log('🔍 DEBUG: AO3 marks (from ao2_marks for other types):', value);
        }
      } else {
        const fieldName = `${metric.toLowerCase()}_marks`;
        value = evaluation[fieldName] || 'N/A';
        console.log('🔍 DEBUG: Field name:', fieldName, 'Value:', value);
      }
      
      // Clean the value first to remove any malformed content
      if (value !== 'N/A') {
        // Remove any extra text like "AO3_MARKS:" that might be concatenated
        value = value.replace(/AO\d+_MARKS:\s*/g, '').replace(/\|/g, '').trim();
        
        // If value doesn't contain "/", add the total marks
        if (maxMarks[metric] && !value.includes('/')) {
          value = `${value}/${maxMarks[metric]}`;
          console.log('🔍 DEBUG: Added total to value:', value);
        } else {
          console.log('🔍 DEBUG: Using cleaned value:', value);
        }
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
                // Remove "|" character from submark value for display
                const cleanValue = submark.value.replace(/\|/g, '').trim();
                return (
                  <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-200" key={submark.label + idx}>
                    <div className="text-2xl font-extrabold text-green-700 tracking-tight">{cleanValue}</div>
                    <div className="text-green-700 text-sm mt-0.5">{submark.label}</div>
                  </div>
                );
              });
            })()}
          </div>
                </div>

        {/* Feedback Modal - Positioned between scores and detailed feedback */}
        <div className="my-6">
          <FeedbackModal
            isOpen={feedbackModal.open}
            category={feedbackModal.category}
            onClose={() => {
              setFeedbackModal({ open: false, category: 'overall' });
              setFeedbackAccurate(null);
              setFeedbackComments('');
            }}
            onSubmit={submitFeedback}
            feedbackAccurate={feedbackAccurate}
            setFeedbackAccurate={setFeedbackAccurate}
            feedbackComments={feedbackComments}
            setFeedbackComments={setFeedbackComments}
            feedbackSubmitting={feedbackSubmitting}
            modalRef={modalRef}
            firstModalButtonRef={firstModalButtonRef}
            darkMode={darkMode}
          />
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
              <SummaryTab 
                evaluation={evaluation}
                darkMode={darkMode}
                onFeedback={handleFeedback}
              />
            )}
            
            {activeTab === 'Strengths' && (
              <StrengthsTab 
                evaluation={evaluation} 
                darkMode={darkMode}
                onFeedback={handleFeedback}
              />
            )}
            
            {activeTab === 'Improvements' && (
              <ImprovementsTab 
                evaluation={evaluation} 
                darkMode={darkMode}
                onFeedback={handleFeedback}
              />
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