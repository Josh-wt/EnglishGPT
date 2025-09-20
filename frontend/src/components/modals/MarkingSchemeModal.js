import React, { useState, useEffect } from 'react';

const MarkingSchemeModal = ({ isOpen, onClose, onProceed, questionType, darkMode }) => {
  const [markingScheme, setMarkingScheme] = useState('');
  const [commandWord, setCommandWord] = useState('');
  const [customCommandWord, setCustomCommandWord] = useState('');
  const [textType, setTextType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Restore marking scheme and command word from localStorage when modal opens
  useEffect(() => {
    if (isOpen && questionType?.id) {
      const markingSchemeKey = `draft_marking_scheme_${questionType.id}`;
      const savedMarkingScheme = localStorage.getItem(markingSchemeKey);
      if (savedMarkingScheme) {
        setMarkingScheme(savedMarkingScheme);
        console.log('💾 Restored marking scheme from localStorage:', savedMarkingScheme);
      }

      // For gp_essay, also restore command word
      if (questionType.id === 'gp_essay') {
        const commandWordKey = `draft_command_word_${questionType.id}`;
        const savedCommandWord = localStorage.getItem(commandWordKey);
        if (savedCommandWord) {
          setCommandWord(savedCommandWord);
          console.log('💾 Restored command word from localStorage:', savedCommandWord);
        }
      }

      // For igcse_directed, also restore text type
      if (questionType.id === 'igcse_directed') {
        const textTypeKey = `draft_text_type_${questionType.id}`;
        const savedTextType = localStorage.getItem(textTypeKey);
        if (savedTextType) {
          setTextType(savedTextType);
          console.log('💾 Restored text type from localStorage:', savedTextType);
        }
      }
    }
  }, [isOpen, questionType?.id]);

  // Save marking scheme to localStorage whenever it changes
  useEffect(() => {
    if (markingScheme && questionType?.id) {
      const key = `draft_marking_scheme_${questionType.id}`;
      localStorage.setItem(key, markingScheme);
      console.log('💾 Saved marking scheme to localStorage:', markingScheme);
    }
  }, [markingScheme, questionType?.id]);

  // Save command word to localStorage whenever it changes (for gp_essay)
  useEffect(() => {
    if (commandWord && questionType?.id === 'gp_essay') {
      const key = `draft_command_word_${questionType.id}`;
      localStorage.setItem(key, commandWord);
      console.log('💾 Saved command word to localStorage:', commandWord);
    }
  }, [commandWord, questionType?.id]);

  // Save text type to localStorage whenever it changes (for igcse_directed)
  useEffect(() => {
    if (textType && questionType?.id === 'igcse_directed') {
      const key = `draft_text_type_${questionType.id}`;
      localStorage.setItem(key, textType);
      console.log('💾 Saved text type to localStorage:', textType);
    }
  }, [textType, questionType?.id]);

  if (!isOpen) return null;

  const handleProceed = async () => {
    if (!markingScheme.trim()) {
      alert('Please provide a marking scheme before proceeding.');
      return;
    }

    // For gp_essay, also require command word
    if (questionType?.id === 'gp_essay') {
      const finalCommandWord = commandWord === 'custom' ? customCommandWord.trim() : commandWord;
      if (!finalCommandWord) {
        alert('Please select or enter a command word before proceeding.');
        return;
      }
    }

    // For igcse_directed, also require text type
    if (questionType?.id === 'igcse_directed') {
      if (!textType) {
        alert('Please select a text type before proceeding.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const data = {
        markingScheme: markingScheme.trim(),
        commandWord: questionType?.id === 'gp_essay' ? (commandWord === 'custom' ? customCommandWord.trim() : commandWord) : null,
        textType: questionType?.id === 'igcse_directed' ? textType : null
      };
      await onProceed(data);
      
      // Don't clear localStorage here - let the evaluation process handle it
      // The marking scheme should persist until evaluation is complete
    } catch (error) {
      console.error('Error proceeding with marking scheme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMarkingSchemePlaceholder = (questionTypeId) => {
    const placeholders = {
      'igcse_summary': 'Example:\n• Content points (15 marks): Identify and extract key points from the text\n• Language (5 marks): Use your own words, maintain original meaning\n• Total: 20 marks',
      'igcse_writers_effect': 'Example:\n• Language analysis (10 marks): Identify and explain literary devices\n• Effect analysis (10 marks): Explain how language creates specific effects\n• Total: 20 marks',
      'igcse_directed': 'Example:\n• Content and ideas (15 marks): Address all parts of the task\n• Language and style (5 marks): Appropriate register and format\n• Total: 20 marks',
      'alevel_comparative': 'Please provide the source texts for comparison:\n\nText 1: [Insert first text here]\n\nText 2: [Insert second text here]\n\nMarking criteria:\n• Analysis of similarities (10 marks)\n• Analysis of differences (10 marks)\n• Use of evidence (10 marks)\n• Total: 30 marks',
      'alevel_directed': 'Please provide the source text for transformation:\n\n[Insert source text here]\n\nMarking criteria:\n• Content and ideas (15 marks)\n• Language and style (10 marks)\n• Structure and organization (5 marks)\n• Total: 30 marks',
      'alevel_text_analysis': 'Please provide the source text for analysis:\n\n[Insert source text here]\n\nMarking criteria:\n• AO1: Understanding and context (5 marks)\n• AO3: Analysis of form, structure, and language (20 marks)\n• Total: 25 marks',
      'alevel_reflective_commentary': 'Please provide the source text for reflective commentary:\n\n[Insert source text here]\n\nMarking criteria:\n• AO3: Reflective analysis of writing choices (10 marks)\n• Total: 10 marks',
      'alevel_language_change': 'Please provide the source texts for language change analysis:\n\nText A (Historical prose): [Insert historical text here]\n\nText B (N-gram data): [Insert quantitative data here]\n\nText C (Word frequency): [Insert frequency table here]\n\nMarking criteria:\n• AO2: Effective writing (5 marks)\n• AO4: Linguistic understanding (5 marks)\n• AO5: Data analysis and synthesis (15 marks)\n• Total: 25 marks',
      'gp_essay': 'Example:\n• AO1: Knowledge and understanding (6 marks)\n• AO2: Analysis and evaluation (12 marks)\n• AO3: Communication and structure (12 marks)\n• Total: 30 marks'
    };
    return placeholders[questionTypeId] || 'Please provide the marking scheme for this question type.';
  };

  const commandWordOptions = [
    'evaluate',
    'assess', 
    'discuss',
    'to what extent',
    'consider',
    'analyse',
    'custom'
  ];

  const textTypeOptions = [
    { value: 'speech', label: 'Speech' },
    { value: 'letter', label: 'Letter' },
    { value: 'article', label: 'Article' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {questionType?.id?.includes('alevel_') ? 'Source Text Required' : 'Marking Scheme Required'}
          </h3>
          <p className="text-gray-600">
            {questionType?.id?.includes('alevel_') 
              ? `${questionType?.name} requires source text(s) for students to read and base their essay on.`
              : `${questionType?.name} requires a marking scheme for accurate evaluation.`
            }
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="marking-scheme" className="block text-sm font-medium text-gray-700 mb-2">
            {questionType?.id?.includes('alevel_') ? 'Source Text & Marking Scheme' : 'Marking Scheme'}
          </label>
          <textarea
            id="marking-scheme"
            value={markingScheme}
            onChange={(e) => setMarkingScheme(e.target.value)}
            placeholder={getMarkingSchemePlaceholder(questionType?.id)}
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{ minHeight: '200px' }}
          />
          <p className="text-sm text-gray-500 mt-2">
            {questionType?.id?.includes('alevel_') 
              ? 'Provide the source text(s) for students to read and base their essay on, along with marking criteria and point allocation.'
              : 'Provide the marking criteria, point allocation, and any specific requirements for this question type.'
            }
          </p>
        </div>

        {questionType?.id === 'igcse_directed' && (
          <div className="mb-6">
            <label htmlFor="text-type" className="block text-sm font-medium text-gray-700 mb-2">
              Text Type
            </label>
            <select
              id="text-type"
              value={textType}
              onChange={(e) => setTextType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select text type...</option>
              {textTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Choose the specific text type for your IGCSE directed writing response.
            </p>
          </div>
        )}

        {questionType?.id === 'gp_essay' && (
          <div className="mb-6">
            <label htmlFor="command-word" className="block text-sm font-medium text-gray-700 mb-2">
              Command Word
            </label>
            <select
              id="command-word"
              value={commandWord}
              onChange={(e) => setCommandWord(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a command word...</option>
              {commandWordOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'custom' ? 'Write manually...' : option}
                </option>
              ))}
            </select>
            
            {commandWord === 'custom' && (
              <div className="mt-3">
                <label htmlFor="custom-command-word" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Command Word
                </label>
                <input
                  id="custom-command-word"
                  type="text"
                  value={customCommandWord}
                  onChange={(e) => setCustomCommandWord(e.target.value)}
                  placeholder="Enter the command word from the question..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              Select the command word from the question (e.g., "Evaluate", "Assess", "Discuss"). This helps the AI understand the specific requirements.
            </p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={isLoading || !markingScheme.trim() || (questionType?.id === 'gp_essay' && !commandWord) || (questionType?.id === 'igcse_directed' && !textType)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Proceed to Evaluation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkingSchemeModal;
