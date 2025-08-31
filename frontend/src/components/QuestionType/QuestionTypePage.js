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

    const alevelQuestions = questionTypes.filter(q => q.category.includes('A-Level')).map(q => ({
      ...q,
      icon: getIconForQuestionType(q.id)
    }));

    if (selectedLevel === 'igcse') {
      return { questions: igcseQuestions, levelName: 'IGCSE', fullName: 'International GCSE', color: 'blue', gradient: 'from-blue-500 to-green-500' };
    } else if (selectedLevel === 'alevel') {
      return { questions: alevelQuestions, levelName: 'A-Level', fullName: 'Advanced Level', color: 'purple', gradient: 'from-purple-500 to-red-500' };
    }
    // Default to showing both if no level selected
    return { 
      questions: [...igcseQuestions, ...alevelQuestions], 
      levelName: 'All Levels', 
      fullName: 'IGCSE & A-Level', 
      color: 'gray', 
      gradient: 'from-gray-500 to-gray-600' 
    };
  };

  // Helper function to get icons for question types
  const getIconForQuestionType = (questionId) => {
    const iconMap = {
      'igcse_summary': '📄',
      'igcse_narrative': '📖',
      'igcse_descriptive': '🖼️',
      'igcse_writers_effect': '⚡',
      'igcse_directed': '✍️',
      'alevel_comparative': '📊',
      'alevel_directed': '✏️',
      'alevel_text_analysis': '🔍'
    };
    return iconMap[questionId] || '📝';
  };

  const levelData = getQuestionsForLevel();

  const generatePrompt = () => {
    const map = {
      igcse_summary: 'Summarize the key arguments of an article about climate change impacts on coastal cities.',
      igcse_narrative: 'Write a narrative about a time when an unexpected event changed your day completely.',
      igcse_descriptive: 'Describe a bustling city market at sunset using vivid sensory details.',
      igcse_writers_effect: 'Analyze how the author uses metaphor and contrast to create tension in a short passage.',
      igcse_directed: 'Write a letter to your local council proposing a new community garden.',
      alevel_directed: 'Write a speech arguing for the benefits of gap years before university.',
      alevel_text_analysis: 'Analyze how the writer presents memory and identity in an unseen prose extract.',
      alevel_comparative: 'Compare how two poets explore the theme of loss.'
    };
    return map[selectedQuestionType?.id] || 'Write about a meaningful experience and what you learned from it.';
  };

  const getExampleForType = (id) => {
    const examples = {
      igcse_summary: 'Example summary: The article outlines three main points... (concise neutral tone).',
      igcse_narrative: 'Example narrative: The wind clawed at the shutters as I stepped outside...',
      igcse_descriptive: 'Example descriptive: The marketplace hummed—a tapestry of scents and colours...',
      igcse_writers_effect: 'Example analysis: The simile "like a coiled spring" compresses tension...',
      igcse_directed: 'Example directed writing: Dear Councillors, I propose establishing a community garden...',
      alevel_directed: 'Example directed: Esteemed audience, today I contend that...',
      alevel_text_analysis: 'Example analysis: The narrator\'s fragmented syntax mirrors her fractured memory...',
      alevel_comparative: 'Example comparative: While Poet A elegizes loss with restraint, Poet B embraces raw immediacy...'
    };
    return examples[id] || 'A focused, well-structured response illustrating expectations for this task type.';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Choose Question Type */}
          <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
            <QuestionSelection
              levelData={levelData}
              selectedQuestionType={selectedQuestionType}
              onQuestionSelect={handleQuestionSelect}
              onShowExample={() => setShowExample(true)}
              onGeneratePrompt={() => {
                const prompt = generatePrompt();
                setStudentResponse(prompt);
              }}
            />
          </div>

          {/* Right: Writing Interface */}
          <div className="lg:col-span-2">
            <WritingInterface
              studentResponse={studentResponse}
              setStudentResponse={setStudentResponse}
              selectedQuestionType={selectedQuestionType}
              showNextButton={showNextButton}
              onProceed={handleProceed}
              onBack={onBack}
              darkMode={darkMode}
              essayRef={essayRef}
              applyFormat={applyFormat}
              insertParagraphBreak={insertParagraphBreak}
              wordCount={wordCount}
              lastSavedAt={lastSavedAt}
              restoredDraft={restoredDraft}
            />
          </div>
        </div>
      </div>

      {/* Example Modal */}
      {showExample && (
        <ExampleModal
          selectedQuestionType={selectedQuestionType}
          onClose={() => setShowExample(false)}
          getExampleForType={getExampleForType}
        />
      )}
    </div>
  );
};

export default QuestionTypePage;
