import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import api from '../../services/api';
import Header from './Header';
import EssayPreview from './EssayPreview';
import UploadWarningModal from './UploadWarningModal';

const AssessmentPage = ({ selectedQuestionType, onBack, onComplete, darkMode }) => {
  const [markingScheme, setMarkingScheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  // Get student response from selectedQuestionType
  const studentResponse = selectedQuestionType?.studentResponse || '';

  useEffect(() => {
    // Show upload warning for certain question types
    if (selectedQuestionType?.id === 'igcse_summary' || selectedQuestionType?.id === 'alevel_text_analysis') {
      setShowUploadWarning(true);
    }
  }, [selectedQuestionType]);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question_type', selectedQuestionType.id);

      const response = await api.post(`/process-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.extracted_text) {
        setMarkingScheme(response.data.extracted_text);
        setExtractedText(response.data.extracted_text);
      } else {
        setError('No text could be extracted from the file');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to process file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentResponse.trim()) {
      setError('Please provide a student response');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const evaluationData = {
        question_type: selectedQuestionType.id,
        student_response: studentResponse,
        marking_scheme: markingScheme || null,
      };

      const response = await api.post('/evaluations', evaluationData);
      
      if (response.data) {
        onComplete(response.data);
      } else {
        setError('Failed to evaluate essay');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError('Failed to evaluate essay. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-7xl mx-auto">
        <Header 
          selectedQuestionType={selectedQuestionType} 
          onBack={onBack}
          darkMode={darkMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Left: Essay Preview */}
          <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
            <EssayPreview 
              studentResponse={studentResponse}
              selectedQuestionType={selectedQuestionType}
              darkMode={darkMode}
            />
          </div>

          {/* Right: Submit Section */}
          <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Ready to Evaluate
              </h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Your essay is ready for AI evaluation. Click the button below to get instant feedback.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? 'Evaluating...' : 'Get AI Feedback Now'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Warning Modal */}
      {showUploadWarning && (
        <UploadWarningModal
          onClose={() => setShowUploadWarning(false)}
          onUpload={handleFileUpload}
          isLoading={isLoading}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default AssessmentPage;
