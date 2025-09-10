import React, { useState } from 'react';

const MarkingSchemeModal = ({ isOpen, onClose, onProceed, questionType, darkMode }) => {
  const [markingScheme, setMarkingScheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleProceed = async () => {
    if (!markingScheme.trim()) {
      alert('Please provide a marking scheme before proceeding.');
      return;
    }

    setIsLoading(true);
    try {
      await onProceed(markingScheme.trim());
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
      'alevel_comparative': 'Example:\n• Analysis of similarities (10 marks)\n• Analysis of differences (10 marks)\n• Use of evidence (10 marks)\n• Total: 30 marks',
      'alevel_directed': 'Example:\n• Content and ideas (15 marks)\n• Language and style (10 marks)\n• Structure and organization (5 marks)\n• Total: 30 marks',
      'alevel_text_analysis': 'Example:\n• Form and structure analysis (10 marks)\n• Language analysis (10 marks)\n• Context and purpose (10 marks)\n• Total: 30 marks',
      'alevel_language_change': 'Example:\n• Historical context (10 marks)\n• Language change analysis (10 marks)\n• Quantitative data interpretation (10 marks)\n• Total: 30 marks'
    };
    return placeholders[questionTypeId] || 'Please provide the marking scheme for this question type.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Marking Scheme Required</h3>
          <p className="text-gray-600">
            {questionType?.name} requires a marking scheme for accurate evaluation.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="marking-scheme" className="block text-sm font-medium text-gray-700 mb-2">
            Marking Scheme
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
            Provide the marking criteria, point allocation, and any specific requirements for this question type.
          </p>
        </div>

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
            disabled={isLoading || !markingScheme.trim()}
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
