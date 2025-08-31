import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import ExampleModal from './ExampleModal';

const QuestionTypePage = ({ questionTypes, onSelectQuestionType, onBack, onEvaluate, selectedLevel, darkMode }) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-pink-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 flex items-center font-fredoka transition-colors duration-200 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 font-fredoka">Essay Writing Studio</h1>
              </div>
            </div>
            
            {/* Level Badge */}
            <div className={`px-4 py-2 rounded-full text-white font-semibold text-sm bg-gradient-to-r ${levelData.gradient}`}>
              {levelData.levelName}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          
          {/* Left Side - Question Types */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white font-fredoka mb-2">Choose Your Question Type</h2>
              <p className="text-pink-100 text-sm">{levelData.fullName}</p>
            </div>
            
            <div className="p-6 overflow-y-auto h-[calc(100%-120px)]">
              <div className="grid grid-cols-1 gap-4">
                {levelData.questions.map((questionType, index) => (
                  <motion.div
                    key={questionType.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      selectedQuestionType?.id === questionType.id
                        ? 'ring-2 ring-pink-500 ring-offset-2 bg-gradient-to-r from-pink-50 to-purple-50'
                        : 'hover:bg-gray-50 hover:shadow-md'
                    } rounded-xl p-4 border border-gray-200`}
                    onClick={() => handleQuestionSelect(questionType)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        selectedQuestionType?.id === questionType.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-600'
                      } transition-all duration-300`}>
                        {questionType.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-fredoka font-bold text-gray-900 text-lg mb-1">
                          {questionType.name}
                        </h3>
                        <p className="font-fredoka text-gray-600 text-sm leading-relaxed">
                          {questionType.description}
                        </p>
                      </div>
                      {selectedQuestionType?.id === questionType.id && (
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Writing Interface */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-green-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-fredoka mb-2">Write Your Essay</h2>
                  <p className="text-blue-100 text-sm">
                    {selectedQuestionType ? selectedQuestionType.name : 'Select a question type to start writing'}
                  </p>
                </div>
                {selectedQuestionType && (
                  <button
                    onClick={() => setShowExample(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    View Example
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 h-[calc(100%-120px)] flex flex-col">
              {!selectedQuestionType ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 font-fredoka mb-2">Ready to Write?</h3>
                    <p className="text-gray-600 font-fredoka">Select a question type from the left to start your essay</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Writing Toolbar */}
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => applyFormat('**', '**')}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => applyFormat('*', '*')}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={() => applyFormat('"', '"')}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="Quote"
                    >
                      "
                    </button>
                    <button
                      onClick={insertParagraphBreak}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="New Paragraph"
                    >
                      ¶
                    </button>
                    <div className="flex-1"></div>
                    <div className="text-sm text-gray-500 font-fredoka">
                      {wordCount} words
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={essayRef}
                      value={studentResponse}
                      onChange={(e) => {
                        setStudentResponse(e.target.value);
                        setIsTyping(true);
                        setTimeout(() => setIsTyping(false), 1000);
                      }}
                      placeholder="Start writing your essay here... Use the toolbar above for formatting."
                      className="w-full h-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-fredoka text-gray-900 placeholder-gray-400 transition-all duration-200"
                      style={{ minHeight: '300px' }}
                    />
                    
                    {/* Auto-save indicator */}
                    {isTyping && (
                      <div className="absolute top-2 right-2 text-xs text-gray-400">
                        Saving...
                      </div>
                    )}
                    
                    {restoredDraft && (
                      <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Draft restored
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedQuestionType(null)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 font-fredoka"
                    >
                      Change Question
                    </button>
                    
                    <button
                      onClick={handleProceed}
                      disabled={!studentResponse.trim()}
                      className={`px-8 py-3 rounded-lg font-medium font-fredoka transition-all duration-200 ${
                        studentResponse.trim()
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Evaluate Essay
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
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
