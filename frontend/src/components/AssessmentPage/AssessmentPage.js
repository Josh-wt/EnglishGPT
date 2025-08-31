import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../../utils/backendUrl';
import api from '../../services/api';
import Header from './Header';
import EssayPreview from './EssayPreview';
import MarkingSchemeSection from './MarkingSchemeSection';
import LoadingPage from './LoadingPage';
import UploadWarningModal from './UploadWarningModal';

const AssessmentPage = ({ selectedQuestionType, onBack, onEvaluate, darkMode }) => {
  const [markingScheme, setMarkingScheme] = useState('');
  const [uploadOption, setUploadOption] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [restoredScheme, setRestoredScheme] = useState(false);

  const loadingMessages = [
    "🤖 AI is analyzing your essay...",
    "📝 Checking grammar and structure...",
    "🎯 Evaluating content quality...",
    "✨ Analyzing writing style and flow...",
    "🔍 Examining vocabulary usage...",
    "📊 Assessing argument structure...",
    "⚡ Generating personalized feedback...",
    "🎭 Reviewing literary techniques...",
    "💡 Identifying key strengths...",
    "🎨 Evaluating descriptive language...",
    "🧠 Processing complex ideas...",
    "📖 Checking coherence and clarity...",
    "🏆 Measuring against marking criteria...",
    "🌟 Crafting improvement suggestions...",
    "🎪 Analyzing tone and mood...",
    "🔬 Examining evidence and examples...",
    "🎵 Checking rhythm and pacing...",
    "🌈 Evaluating creativity and originality...",
    "⭐ Finalizing detailed assessment...",
    "🎉 Almost done! Preparing your results..."
  ];

  // Restore marking scheme draft
  useEffect(() => {
    const key = 'draft_marking_scheme';
    const saved = localStorage.getItem(key);
    if (saved && !markingScheme) {
      setMarkingScheme(saved);
      setRestoredScheme(true);
      setTimeout(() => setRestoredScheme(false), 3000);
    }
  }, []);

  // Autosave marking scheme
  useEffect(() => {
    const key = 'draft_marking_scheme';
    const handle = setTimeout(() => {
      if (markingScheme && markingScheme.trim().length > 0) {
        localStorage.setItem(key, markingScheme);
      } else {
        localStorage.removeItem(key);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [markingScheme]);

  const handleUploadOptionChange = (option) => {
    if (option === 'file' && uploadOption === 'text') {
      setShowUploadWarning(true);
    } else {
      setUploadOption(option);
    }
  };
  
  const confirmFileUpload = () => {
    setUploadOption('file');
    setShowUploadWarning(false);
  };
  
  const cancelFileUpload = () => {
    setShowUploadWarning(false);
  };
  
  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      

        const response = await api.post(`/process-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMarkingScheme(response.data.extracted_text);
      setError('');
    } catch (error) {
      setError('Failed to process file. Please try pasting the text instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedQuestionType.requiresScheme === true && !markingScheme.trim()) {
      setError('This question type requires a marking scheme');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setCurrentMessageIndex(0);
    
    // Animate through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(messageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    
    try {
      const evaluationData = {
        question_type: selectedQuestionType.id,
        student_response: selectedQuestionType.studentResponse, // From previous page
        marking_scheme: markingScheme || null,
      };
      
      await onEvaluate(evaluationData);
      clearInterval(messageInterval);
    } catch (error) {
      clearInterval(messageInterval);
      setError('Failed to evaluate submission. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingPage 
        selectedQuestionType={selectedQuestionType} 
        loadingMessages={loadingMessages} 
        currentMessageIndex={currentMessageIndex}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-4xl mx-auto">
        <Header onBack={onBack} darkMode={darkMode} />
        
        {restoredScheme && (
          <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            Restored unsaved marking scheme.
          </div>
        )}
        
        <EssayPreview selectedQuestionType={selectedQuestionType} darkMode={darkMode} />

        <MarkingSchemeSection
          markingScheme={markingScheme}
          setMarkingScheme={setMarkingScheme}
          uploadOption={uploadOption}
          onUploadOptionChange={handleUploadOptionChange}
          onFileUpload={handleFileUpload}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          darkMode={darkMode}
        />
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}
      </div>
      
      <UploadWarningModal
        isOpen={showUploadWarning}
        onConfirm={confirmFileUpload}
        onCancel={cancelFileUpload}
      />
    </div>
  );
};

export default AssessmentPage;
