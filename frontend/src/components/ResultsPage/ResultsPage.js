import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import ResultsTabs from './ResultsTabs';
import FeedbackModal from './FeedbackModal';

const ResultsPage = ({ evaluation, onNewEvaluation, userPlan, darkMode }) => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'overall' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackAccurate, setFeedbackAccurate] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const routerLocation = useLocation();
  const modalRef = useRef(null);
  const firstModalButtonRef = useRef(null);

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
        setActiveTab((prev) => prev === 'Summary' ? 'Strengths' : prev === 'Strengths' ? 'Improvements' : 'Summary');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feedbackModal.open, feedbackSubmitting, feedbackAccurate]);

  useEffect(() => {
    // Focus trap when modal opens
    if (feedbackModal.open) {
      setTimeout(() => {
        firstModalButtonRef.current?.focus();
      }, 0);
    }
  }, [feedbackModal.open]);
  
  // Parse grade to get score
  const parseGrade = (gradeString) => {
    // Extract numbers from grade string
    const matches = gradeString.match(/(\d+)\/(\d+)/g);
    if (matches) {
      let totalScore = 0;
      let maxScore = 0;
      matches.forEach(match => {
        const [score, max] = match.split('/').map(Number);
          totalScore += score;
          maxScore += max;
      });
        return { score: totalScore, maxScore, percentage: (totalScore / maxScore * 100).toFixed(1) };
      }
    return { score: 0, maxScore: 40, percentage: 0 };
  };
  
  const gradeInfo = parseGrade(evaluation.grade);
  
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

  const submitFeedback = async () => {
    if (feedbackAccurate === null) return;
    
    setFeedbackSubmitting(true);
    try {
      // Submit feedback logic here
      console.log('Feedback submitted:', { feedbackAccurate, feedbackComments, category: feedbackModal.category });
      
      setFeedbackModal({ open: false, category: 'overall' });
      setFeedbackAccurate(null);
      setFeedbackComments('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <Header 
        evaluation={evaluation} 
        gradeInfo={gradeInfo} 
        letterGrade={letterGrade}
        onNewEvaluation={onNewEvaluation}
        darkMode={darkMode}
      />
      
      <ResultsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        evaluation={evaluation}
        gradeInfo={gradeInfo}
        letterGrade={letterGrade}
        darkMode={darkMode}
        onFeedback={(category) => setFeedbackModal({ open: true, category })}
      />
      
      <FeedbackModal
        isOpen={feedbackModal.open}
        category={feedbackModal.category}
        onClose={() => setFeedbackModal({ open: false, category: 'overall' })}
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
  );
};

export default ResultsPage;
