import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import QuestionSelection from './QuestionSelection';
import WritingInterface from './WritingInterface';
import ExampleModal from './ExampleModal';

const QuestionTypePage = ({ questionTypes, onSelectQuestionType, onBack, onEvaluate, selectedLevel, darkMode }) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const essayRef = useRef(null);

  // Restore draft on mount
  useEffect(() => {
    const key = 'draft_student_response';
    const saved = localStorage.getItem(key);
    if (saved && !studentResponse) {
      setStudentResponse(saved);
      setRestoredDraft(true);
      setTimeout(() => setRestoredDraft(false), 3000);
    }
  }, []);

  // Autosave on change (debounced)
  useEffect(() => {
    const key = 'draft_student_response';
    const handle = setTimeout(() => {
      if (studentResponse && studentResponse.trim().length > 0) {
        localStorage.setItem(key, studentResponse);
        setLastSavedAt(Date.now());
      } else {
        localStorage.removeItem(key);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [studentResponse]);

  const applyFormat = (prefix, suffix = prefix) => {
    const textarea = essayRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const selected = value.substring(selectionStart, selectionEnd) || 'text';
    const after = value.substring(selectionEnd);
    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    setStudentResponse(newValue);
    setTimeout(() => {
      const pos = selectionStart + prefix.length + selected.length + suffix.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertParagraphBreak = () => {
    const textarea = essayRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    const newValue = `${before}\n\n${after}`;
    setStudentResponse(newValue);
    setTimeout(() => {
      const pos = selectionStart + 2;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const wordCount = studentResponse.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleQuestionSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setShowNextButton(true);
  };

  const handleProceed = () => {
    if (!selectedQuestionType || !studentResponse.trim()) return;

    // Evaluate directly - no marking scheme logic
    const evaluationData = {
      question_type: selectedQuestionType.id,
      student_response: studentResponse,
      marking_scheme: null,
    };
    onEvaluate(evaluationData);
  };

  // Filter questions based on selected level
  const getQuestionsForLevel = () => {
    if (!questionTypes || questionTypes.length === 0) {
      return { questions: [], levelName: 'Loading...', fullName: 'Loading...', color: 'gray', gradient: 'from-gray-500 to-gray-600' };
    }

    const igcseQuestions = questionTypes.filter(q => q.category === 'IGCSE').map(q => ({
      ...q,
      icon: getIconForQuestionType(q.id)
    }));

    const alevelQuestions = questionTypes.filter(q => q.category === 'A-Level').map(q => ({
      ...q,
      icon: getIconForQuestionType(q.id)
    }));

    if (selectedLevel === 'igcse') {
      return {
        questions: igcseQuestions,
        levelName: 'IGCSE',
        fullName: 'International General Certificate of Secondary Education',
        color: 'blue',
        gradient: 'from-blue-500 to-green-500'
      };
    } else if (selectedLevel === 'alevel') {
      return {
        questions: alevelQuestions,
        levelName: 'A-Level',
        fullName: 'Advanced Level English',
        color: 'purple',
        gradient: 'from-purple-500 to-red-500'
      };
    }

    // Default to IGCSE if no level selected
    return {
      questions: igcseQuestions,
      levelName: 'IGCSE',
      fullName: 'International General Certificate of Secondary Education',
      color: 'blue',
      gradient: 'from-blue-500 to-green-500'
    };
  };

  const getIconForQuestionType = (questionTypeId) => {
    const iconMap = {
      'igcse_summary': '📄',
      'igcse_narrative': '📖',
      'igcse_descriptive': '🖼️',
      'igcse_writers_effect': '⚡',
      'igcse_directed': '✍️',
      'alevel_reflective': '📊',
      'alevel_directed_writing': '✏️',
      'alevel_text_analysis': '🔍'
    };
    return iconMap[questionTypeId] || '📝';
  };

  const levelData = getQuestionsForLevel();

  return (
    <div className="min-h-screen bg-main">
      {/* Header with Back to Dashboard Button */}
      <div className="bg-card shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 flex items-center font-fredoka"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900 font-fredoka">Question Types</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedQuestionType ? (
          <QuestionSelection
            levelData={levelData}
            onQuestionSelect={handleQuestionSelect}
            darkMode={darkMode}
          />
        ) : (
          <WritingInterface
            selectedQuestionType={selectedQuestionType}
            studentResponse={studentResponse}
            setStudentResponse={setStudentResponse}
            wordCount={wordCount}
            applyFormat={applyFormat}
            insertParagraphBreak={insertParagraphBreak}
            essayRef={essayRef}
            restoredDraft={restoredDraft}
            lastSavedAt={lastSavedAt}
            showExample={showExample}
            setShowExample={setShowExample}
            onBack={() => setSelectedQuestionType(null)}
            onProceed={handleProceed}
            darkMode={darkMode}
          />
        )}
      </div>

      <ExampleModal
        isOpen={showExample}
        onClose={() => setShowExample(false)}
        questionType={selectedQuestionType}
        darkMode={darkMode}
      />
    </div>
  );
};

export default QuestionTypePage;
