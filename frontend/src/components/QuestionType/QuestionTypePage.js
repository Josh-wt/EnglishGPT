import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ExampleModal from './ExampleModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkingSchemeModal from '../modals/MarkingSchemeModal';

const QuestionTypePage = ({ questionTypes, onSelectQuestionType, onBack, onEvaluate, selectedLevel, darkMode, user, evaluationLoading, loadingMessage }) => {
  console.log('🔍 DEBUG: QuestionTypePage rendered with props:', {
    questionTypes: questionTypes?.length,
    onSelectQuestionType: !!onSelectQuestionType,
    onBack: !!onBack,
    onEvaluate: !!onEvaluate,
    selectedLevel,
    darkMode,
    user: !!user
  });

  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const [showMarkingSchemeModal, setShowMarkingSchemeModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [formattedText, setFormattedText] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const essayRef = useRef(null);

  // Function to convert markdown to HTML
  const convertMarkdownToHtml = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/"(.*?)"/g, '<span class="text-blue-600 italic">"$1"</span>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  // Restore draft on mount
  useEffect(() => {
    const key = 'draft_student_response';
    const saved = localStorage.getItem(key);
    if (saved && !studentResponse) {
      setStudentResponse(saved);
      setFormattedText(convertMarkdownToHtml(saved));
      setRestoredDraft(true);
      setTimeout(() => setRestoredDraft(false), 3000);
    }
  }, []);

  // Check for landing page essay and restore it
  useEffect(() => {
    const landingPageEssay = localStorage.getItem('landingPageEssay');
    if (landingPageEssay && !studentResponse) {
      try {
        const essayData = JSON.parse(landingPageEssay);
        console.log('📝 Restoring landing page essay:', essayData);
        
        // Set the essay content
        setStudentResponse(essayData.content);
        setFormattedText(convertMarkdownToHtml(essayData.content));
        
        // Set the question type if it matches available types
        if (essayData.questionType && essayData.level) {
          // Find the matching question type
          const matchingQuestion = questionTypes?.find(qt => 
            qt.id === essayData.questionType.id && 
            (qt.category === essayData.level || 
             qt.category === 'IGCSE' && essayData.level === 'IGCSE' ||
             qt.category === 'A-Level' && essayData.level === 'A Level')
          );
          
          if (matchingQuestion) {
            setSelectedQuestionType(matchingQuestion);
            console.log('✅ Restored question type:', matchingQuestion.name);
          }
        }
        
        // Clear the landing page essay from localStorage
        localStorage.removeItem('landingPageEssay');
        
        // Show restored message
        setRestoredDraft(true);
        setTimeout(() => setRestoredDraft(false), 5000);
        
      } catch (error) {
        console.error('❌ Error restoring landing page essay:', error);
        localStorage.removeItem('landingPageEssay');
      }
    }
  }, [questionTypes, studentResponse, convertMarkdownToHtml]);

  // Check for write page data from landing page demo
  useEffect(() => {
    const writePageData = localStorage.getItem('writePageData');
    if (writePageData && !studentResponse) {
      try {
        const data = JSON.parse(writePageData);
        console.log('📝 Restoring write page data from landing page:', data);
        
        // Set the essay content
        setStudentResponse(data.studentResponse);
        setFormattedText(convertMarkdownToHtml(data.studentResponse));
        
        // Set the question type if it matches available types
        if (data.questionType && data.level) {
          // Find the matching question type
          const matchingQuestion = questionTypes?.find(qt => 
            qt.id === data.questionType.id && 
            (qt.category === data.level || 
             qt.category === 'IGCSE' && data.level === 'IGCSE' ||
             qt.category === 'A-Level' && data.level === 'A Level')
          );
          
          if (matchingQuestion) {
            setSelectedQuestionType(matchingQuestion);
            console.log('✅ Restored question type:', matchingQuestion.name);
          }
        }
        
        // Clear the write page data from localStorage
        localStorage.removeItem('writePageData');
        
        // Show instruction modal if this came from landing page
        if (data.fromLandingPage) {
          setTimeout(() => {
            setShowInstructionModal(true);
          }, 1000); // Small delay to let the page load
        }
        
      } catch (error) {
        console.error('❌ Error restoring write page data:', error);
        localStorage.removeItem('writePageData');
      }
    }
  }, [questionTypes, studentResponse, convertMarkdownToHtml]);

  // Autosave on change (debounced)
  useEffect(() => {
    const key = 'draft_student_response';
    const handle = setTimeout(() => {
      if (studentResponse && studentResponse.trim().length > 0) {
        localStorage.setItem(key, studentResponse);
        setFormattedText(convertMarkdownToHtml(studentResponse));
        setLastSavedAt(Date.now());
      } else {
        localStorage.removeItem(key);
        setFormattedText('');
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [studentResponse, convertMarkdownToHtml]);

  // Show loading screen when evaluation is in progress
  if (evaluationLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'} flex items-center justify-center p-4`}>
        <div className="text-center max-w-lg">
          {/* Book Loader */}
          <div className="mb-8">
            <LoadingSpinner 
              message="" 
              size="large" 
            />
          </div>
          
          {/* Small text with spacing */}
          <div className="text-gray-600 text-lg font-fredoka mb-8">
            Unleashing AI 
          </div>
          
          {/* Pink box modal with changing text */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg border border-pink-300 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-3">✨</div>
              <div className="text-gray-800 font-fredoka text-lg font-medium">
                {loadingMessage || "🤖 AI is analyzing your essay..."}
              </div>
              <div className="text-gray-600 text-sm mt-2 font-fredoka">
                This may take up to 60 seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const applyFormat = (prefix, suffix = prefix) => {
    const textarea = essayRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const selected = value.substring(selectionStart, selectionEnd) || 'text';
    const after = value.substring(selectionEnd);
    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    setStudentResponse(newValue);
    setFormattedText(convertMarkdownToHtml(newValue));
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
    setFormattedText(convertMarkdownToHtml(newValue));
    setTimeout(() => {
      const pos = selectionStart + 2;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const wordCount = studentResponse.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleQuestionSelect = (questionType) => {
    setSelectedQuestionType(questionType);
  };

  const handleProceed = () => {
    console.log('🔍 DEBUG: handleProceed called');
    console.log('🔍 DEBUG: selectedQuestionType:', selectedQuestionType);
    console.log('🔍 DEBUG: studentResponse length:', studentResponse?.length);
    console.log('🔍 DEBUG: studentResponse trimmed:', studentResponse?.trim()?.length);
    console.log('🔍 DEBUG: user:', user);
    console.log('🔍 DEBUG: onEvaluate function:', onEvaluate);
    
    if (!selectedQuestionType || !studentResponse.trim()) {
      console.log('🔍 DEBUG: Early return - missing questionType or response');
      console.log('🔍 DEBUG: selectedQuestionType exists:', !!selectedQuestionType);
      console.log('🔍 DEBUG: studentResponse trimmed exists:', !!studentResponse.trim());
      return;
    }

    // Check if question type requires marking scheme
    const requiresMarkingScheme = selectedQuestionType.requires_marking_scheme === true;
    const isWritersEffect = selectedQuestionType.id === 'igcse_writers_effect';
    
    if (requiresMarkingScheme || isWritersEffect) {
      // Show marking scheme modal
      console.log('🔍 DEBUG: Question requires marking scheme, showing modal');
      setShowMarkingSchemeModal(true);
      return;
    }

    // No marking scheme needed - evaluate directly
    const evaluationData = {
      question_type: selectedQuestionType.id,
      student_response: studentResponse,
      marking_scheme: null,
      user_id: user?.id,
    };
    
    console.log('🔍 DEBUG: Created evaluationData:', evaluationData);
    console.log('🔍 DEBUG: About to call onEvaluate with:', evaluationData);
    
    onEvaluate(evaluationData);
    
    console.log('🔍 DEBUG: onEvaluate called successfully');
  };

  const handleMarkingSchemeProceed = async (data) => {
    console.log('🔍 DEBUG: handleMarkingSchemeProceed called with:', data);
    
    if (!selectedQuestionType || !studentResponse.trim()) {
      console.log('🔍 DEBUG: Early return - missing questionType or response');
      return;
    }

    // Handle both old format (string) and new format (object)
    const markingScheme = typeof data === 'string' ? data : data.markingScheme;
    const commandWord = typeof data === 'object' ? data.commandWord : null;

    // Create evaluation data with marking scheme and command word
    const evaluationData = {
      question_type: selectedQuestionType.id,
      student_response: studentResponse,
      marking_scheme: markingScheme,
      command_word: commandWord,
      user_id: user?.id,
    };
    
    console.log('🔍 DEBUG: Created evaluationData with marking scheme and command word:', evaluationData);
    
    // Close the modal
    setShowMarkingSchemeModal(false);
    
    // Call onEvaluate with the marking scheme and command word
    onEvaluate(evaluationData);
    
    console.log('🔍 DEBUG: onEvaluate called with marking scheme and command word successfully');
  };

  // Filter questions based on selected level
  const getQuestionsForLevel = () => {
    if (!questionTypes || questionTypes.length === 0) {
      return { questions: [], levelName: 'Loading...', fullName: 'Loading...', color: 'gray', gradient: 'from-gray-500 to-gray-600' };
    }

    console.log('🔍 DEBUG: All question types:', questionTypes);
    console.log('🔍 DEBUG: Selected level:', selectedLevel);

    const igcseQuestions = questionTypes.filter(q => 
      q.category === 'IGCSE' || q.category === 'igcse'
    ).map(q => ({
      ...q,
      icon: getIconForQuestionType(q.id)
    }));

    const alevelQuestions = questionTypes.filter(q => 
      q.category === 'A-Level' || 
      q.category === 'alevel' || 
      q.category === 'a-level' ||
      q.category === 'A-Level English (9093)' ||
      q.category?.toLowerCase().includes('level')
    ).map(q => ({
      ...q,
      icon: getIconForQuestionType(q.id)
    }));

    const gpQuestions = questionTypes.filter(q => 
      q.category === 'English General Paper (8021)' ||
      q.category === 'gp' ||
      q.category?.toLowerCase().includes('general paper')
    ).map(q => ({
      ...q,
      icon: getIconForQuestionType(q.id)
    }));
    
    console.log('🔍 DEBUG: IGCSE questions:', igcseQuestions);
    console.log('🔍 DEBUG: A-Level questions:', alevelQuestions);

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
    } else if (selectedLevel === 'gp') {
      return {
        questions: gpQuestions,
        levelName: 'English General Paper (8021)',
        fullName: 'Cambridge International AS & A Level English General Paper',
        color: 'orange',
        gradient: 'from-orange-500 to-red-500'
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
      'alevel_text_analysis': '🔍',
      'alevel_directed': '✏️',
      'alevel_comparative': '📊',
      'alevel_language_change': '🔍',
      'gp_essay': '📝',
      'gp_comprehension': '📖'
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
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 9.26L12 2Z"/>
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

      {/* Main Content - Responsive Split Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-8 min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)]">
          
          {/* Left Side - Question Types */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
              <h2 className="text-lg font-bold text-white font-fredoka mb-1">Question Types</h2>
              <p className="text-pink-100 text-xs">{levelData.levelName}</p>
            </div>
            
            <div className="p-3 sm:p-4 overflow-y-auto h-[calc(100%-80px)] max-h-96 lg:max-h-none">
              <div className="space-y-3">
                {levelData.questions.length > 0 ? (
                  levelData.questions.map((questionType, index) => (
                    <motion.div
                      key={questionType.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        selectedQuestionType?.id === questionType.id
                          ? 'ring-2 ring-pink-500 ring-offset-1 bg-gradient-to-r from-pink-50 to-purple-50'
                          : 'hover:bg-gray-50 hover:shadow-md'
                      } rounded-lg p-3 border border-gray-200`}
                      onClick={() => handleQuestionSelect(questionType)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                          selectedQuestionType?.id === questionType.id
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-600'
                        } transition-all duration-300`}>
                          {questionType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-fredoka font-bold text-gray-900 text-sm mb-1 truncate">
                            {questionType.name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {questionType.description}
                          </p>
                        </div>
                        {selectedQuestionType?.id === questionType.id && (
                          <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 text-sm">No questions available for {levelData.levelName}</p>
                  </div>
                )}
              </div>
            </div>
                      </div>

          {/* Right Side - Writing Interface */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-green-600 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-fredoka mb-2">Write Your Essay</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedQuestionType ? selectedQuestionType.name : 'Select a question type to start writing'}
                    </p>
                  </div>
                  {selectedQuestionType && (
                    <button
                      onClick={() => setShowExample(true)}
                      className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                      View Example
                    </button>
                  )}
                </div>
              </div>

            <div className="p-3 sm:p-4 md:p-6 h-[calc(100%-120px)] flex flex-col">
              {!selectedQuestionType ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-fredoka mb-2">Ready to Write?</h3>
                    <p className="text-gray-600 font-fredoka text-sm sm:text-base">Select a question type from the left to start your essay</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Writing Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => applyFormat('**', '**')}
                      className="px-2 sm:px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      onClick={() => applyFormat('*', '*')}
                      className="px-2 sm:px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                    <button
                      onClick={() => applyFormat('"', '"')}
                      className="px-2 sm:px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="Quote"
                    >
                      "
                    </button>
                    <button
                      onClick={insertParagraphBreak}
                      className="px-2 sm:px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      title="New Paragraph"
                    >
                      ¶
                    </button>
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`px-2 sm:px-3 py-1.5 border rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        isPreviewMode 
                          ? 'bg-blue-100 border-blue-300 text-blue-700' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                      title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
                    >
                      {isPreviewMode ? '✏️' : '👁️'}
                    </button>
                    <div className="flex-1"></div>
                    <div className="text-xs sm:text-sm text-gray-500 font-fredoka">
                      {wordCount} words
                    </div>
                  </div>

                  {/* Text Editor - Full Space */}
                  <div className="flex-1 relative">
                    {isPreviewMode ? (
                      <div
                        className="w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-3 sm:p-4 border border-gray-200 rounded-lg font-fredoka text-gray-900 text-sm sm:text-base overflow-y-auto"
                        style={{ minHeight: '300px' }}
                        dangerouslySetInnerHTML={{ __html: formattedText || '<p class="text-gray-400">Start writing to see preview...</p>' }}
                      />
                    ) : (
                      <textarea
                        ref={essayRef}
                        value={studentResponse}
                        onChange={(e) => {
                          setStudentResponse(e.target.value);
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 1000);
                        }}
                        placeholder="Start writing your essay here... Use the toolbar above for formatting."
                        className="w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-3 sm:p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-fredoka text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                        style={{ minHeight: '300px' }}
                      />
                    )}
                    
                    {/* Auto-save indicator */}
                    {isTyping && !isPreviewMode && (
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedQuestionType(null)}
                      className="px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 font-fredoka text-sm sm:text-base"
                    >
                      Change Question
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log('🔍 DEBUG: Evaluate Essay button clicked');
                        console.log('🔍 DEBUG: studentResponse length:', studentResponse?.length);
                        console.log('🔍 DEBUG: studentResponse trimmed:', studentResponse?.trim()?.length);
                        console.log('🔍 DEBUG: Button disabled:', !studentResponse.trim());
                        handleProceed();
                      }}
                      disabled={!studentResponse.trim()}
                      className={`px-6 sm:px-8 py-3 rounded-lg font-medium font-fredoka transition-all duration-200 text-sm sm:text-base ${
                        studentResponse.trim()
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedQuestionType?.requires_marking_scheme || selectedQuestionType?.id === 'igcse_writers_effect' 
                        ? 'Add marking scheme' 
                        : 'Get AI Feedback Now'
                      }
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

      <MarkingSchemeModal
        isOpen={showMarkingSchemeModal}
        onClose={() => setShowMarkingSchemeModal(false)}
        onProceed={handleMarkingSchemeProceed}
        questionType={selectedQuestionType}
        darkMode={darkMode}
      />

      {/* Instruction Modal for Landing Page Demo */}
      {showInstructionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-2xl max-w-md w-full p-6 border shadow-xl`}>
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-3">Welcome to EEnglishGPT!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Great! Your essay has been loaded. Now click the <strong>"GET AI FEEDBACK"</strong> button below to get your AI-powered evaluation.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> The AI will analyze your essay and provide detailed feedback with marks and improvement suggestions.
                </p>
              </div>
              <button
                onClick={() => setShowInstructionModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Got it! Let's get my feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionTypePage;
