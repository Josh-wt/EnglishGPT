import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import QuestionSelection from './QuestionSelection';
import WritingInterface from './WritingInterface';
import ExampleModal from './ExampleModal';

const QuestionTypePage = ({ questionTypes, onSelectQuestionType, onBack, onEvaluate, selectedLevel, darkMode }) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [showMarkingSchemeChoice, setShowMarkingSchemeChoice] = useState(false);
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

  const getWordGoal = () => {
    if (!selectedQuestionType) return 300;
    const map = {
      igcse_summary: 50,
      igcse_narrative: 300,
      igcse_descriptive: 300,
      igcse_writers_effect: 150,
      igcse_directed: 150,
      alevel_directed: 300,
      alevel_text_analysis: 400,
      alevel_comparative: 500,
    };
    return map[selectedQuestionType.id] || 300;
  };

  const handleQuestionSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setShowNextButton(true);
    if (questionType.id === 'igcse_writers_effect') {
      setShowMarkingSchemeChoice(true);
    } else {
      setShowMarkingSchemeChoice(false);
    }
  };

  const handleProceed = (useMarkingScheme = null) => {
    if (!selectedQuestionType || !studentResponse.trim()) return;

    // Handle Writer's Effect optional marking scheme
    if (selectedQuestionType.id === 'igcse_writers_effect') {
      if (useMarkingScheme) {
        // User chose to use marking scheme - go to assessment page
        onSelectQuestionType({
          ...selectedQuestionType,
          studentResponse: studentResponse,
          requires_marking_scheme: true // Override for this instance
        });
        return;
      } else {
        // User chose to skip marking scheme - evaluate directly
        const evaluationData = {
          question_type: selectedQuestionType.id,
          student_response: studentResponse,
          marking_scheme: null,
        };
        onEvaluate(evaluationData);
        return;
      }
    }

    // Smart flow for other question types
    if (selectedQuestionType.requires_marking_scheme === true) {
      // Pass student response and go to assessment page for marking scheme
      onSelectQuestionType({
        ...selectedQuestionType,
        studentResponse: studentResponse // Pass the essay along
      });
    } else {
      // No marking scheme needed - evaluate directly
      const evaluationData = {
        question_type: selectedQuestionType.id,
        student_response: studentResponse,
        marking_scheme: null,
      };
      onEvaluate(evaluationData);
    }
  };

  // Filter questions based on selected level
  const getQuestionsForLevel = () => {
    if (!questionTypes || questionTypes.length === 0) {
      return { questions: [], levelName: 'Loading...', fullName: 'Loading...', color: 'gray', gradient: 'from-gray-500 to-gray-600' };
    }

    const igcseQuestions = questionTypes.filter(q => q.category === 'IGCSE').map(q => ({
      ...q,
      requiresScheme: q.requires_marking_scheme,
      icon: getIconForQuestionType(q.id)
    }));

    const alevelQuestions = questionTypes.filter(q => q.category.includes('A-Level')).map(q => ({
      ...q,
      requiresScheme: q.requires_marking_scheme,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header 
        onBack={onBack} 
        levelData={levelData} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <QuestionSelection
            levelData={levelData}
            selectedQuestionType={selectedQuestionType}
            onQuestionSelect={handleQuestionSelect}
            onShowExample={() => setShowExample(true)}
            onGeneratePrompt={() => setStudentResponse((v) => (v ? v + '\n\n' : '') + generatePrompt())}
          />

          <WritingInterface
            selectedQuestionType={selectedQuestionType}
            studentResponse={studentResponse}
            setStudentResponse={setStudentResponse}
            wordCount={wordCount}
            levelData={levelData}
            showNextButton={showNextButton}
            showMarkingSchemeChoice={showMarkingSchemeChoice}
            onProceed={handleProceed}
            applyFormat={applyFormat}
            insertParagraphBreak={insertParagraphBreak}
            essayRef={essayRef}
            lastSavedAt={lastSavedAt}
          />
        </div>
      </div>

      <ExampleModal
        isOpen={showExample}
        onClose={() => setShowExample(false)}
        selectedQuestionType={selectedQuestionType}
        getExampleForType={getExampleForType}
        darkMode={darkMode}
      />
    </div>
  );
};

export default QuestionTypePage;
