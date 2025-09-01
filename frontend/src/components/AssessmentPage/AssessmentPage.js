import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const AssessmentPage = ({ selectedQuestionType, onEvaluate, onBack, darkMode, evaluationLoading, loadingMessage }) => {
  const [markingScheme, setMarkingScheme] = useState('');
  const [uploadOption, setUploadOption] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [restoredScheme, setRestoredScheme] = useState(false);

  // Restore marking scheme draft
  useEffect(() => {
    const key = 'draft_marking_scheme';
    const saved = localStorage.getItem(key);
    if (saved && !markingScheme) {
      setMarkingScheme(saved);
      setRestoredScheme(true);
      setTimeout(() => setRestoredScheme(false), 3000);
    }
  }, [markingScheme]);

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
    
    // Only set local loading if not already in evaluation loading state
    if (!evaluationLoading) {
      setIsLoading(true);
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
    }
    
    setError('');
    
    try {
      const evaluationData = {
        question_type: selectedQuestionType.id,
        student_response: selectedQuestionType.studentResponse, // From previous page
        marking_scheme: markingScheme || null,
        // user_id will be added in App.js handleEvaluate if not present
      };
      
      console.log('🔍 DEBUG: AssessmentPage calling onEvaluate with:', evaluationData);
      await onEvaluate(evaluationData);
      console.log('🔍 DEBUG: AssessmentPage onEvaluate completed');
      // Don't set isLoading to false here - let the navigation happen
      // The loading state will be cleared when the component unmounts or navigation occurs
    } catch (error) {
      console.error('🔍 DEBUG: AssessmentPage evaluation error:', error);
      setError('Failed to evaluate submission. Please try again.');
      setIsLoading(false);
    }
  };

  // Beautiful Loading Page Component
  const LoadingPage = ({ selectedQuestionType, loadingMessages, currentMessageIndex, loadingMessage }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    
    // Add a timeout fallback in case loading gets stuck
    useEffect(() => {
      const timeout = setTimeout(() => {
        console.warn('🔍 WARNING: Loading timeout reached (60s), forcing reload');
        // Force clear loading state after 60 seconds
        setIsLoading(false);
      }, 60000);
      
      return () => clearTimeout(timeout);
    }, []);

    // Simulate progress
    useEffect(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev; // Don't go to 100% until actually done
          return prev + Math.random() * 3;
        });
      }, 200);

      return () => clearInterval(interval);
    }, []);

    // Animate through steps
    useEffect(() => {
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 4);
      }, 1500);

      return () => clearInterval(stepInterval);
    }, []);

    const steps = [
      { icon: "📝", text: "Reading your essay", color: "from-blue-500 to-blue-600" },
      { icon: "🔍", text: "Analyzing structure", color: "from-green-500 to-green-600" },
      { icon: "🎯", text: "Evaluating content", color: "from-purple-500 to-purple-600" },
      { icon: "✨", text: "Generating feedback", color: "from-pink-500 to-pink-600" }
    ];
    
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} flex items-center justify-center p-4 relative overflow-hidden`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="text-center max-w-2xl relative z-10">
          {/* Main Loading Animation */}
          <div className="mb-12">
            <div className="relative w-32 h-32 mx-auto mb-8">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
              {/* Inner pulsing circle */}
              <div className="absolute inset-4 border-4 border-transparent border-b-pink-500 border-l-green-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl animate-bounce">🤖</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-fredoka">
              {Math.round(progress)}% Complete
            </div>
          </div>

          {/* Current Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-center space-x-4 mb-6">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-2 transition-all duration-500 ${
                    index === currentStep 
                      ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` 
                      : index < currentStep 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-md' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {index < currentStep ? '✓' : step.icon}
                  </div>
                  <div className={`text-xs font-fredoka transition-all duration-300 ${
                    index === currentStep 
                      ? 'text-gray-900 dark:text-white font-semibold' 
                      : index < currentStep 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dynamic Message */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-4 animate-pulse">✨</div>
                <div className="text-gray-800 dark:text-white font-fredoka text-xl font-medium mb-3">
                  {loadingMessage || (loadingMessages && loadingMessages[currentMessageIndex]) || "🤖 AI is analyzing your essay..."}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-fredoka">
                  Our AI is carefully analyzing your <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedQuestionType?.name}</span> submission. This may take up to 60 seconds.
                </div>
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="text-xs text-gray-500 dark:text-gray-400 font-fredoka max-w-md mx-auto">
            💡 Did you know? Our AI analyzes over 50 different writing criteria to provide comprehensive feedback!
          </div>
        </div>
      </div>
    );
  };

  if (evaluationLoading || isLoading) {
    return <LoadingPage selectedQuestionType={selectedQuestionType} loadingMessages={loadingMessages} currentMessageIndex={currentMessageIndex} loadingMessage={loadingMessage} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center mx-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Essay
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>📋 Add Marking Scheme</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your essay is ready! Now add the marking scheme for accurate evaluation.</p>
        </div>
        
        {restoredScheme && (
          <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            Restored unsaved marking scheme.
          </div>
        )}
        
        {/* Essay Preview */}
        <div className={`${darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} rounded-xl p-4 mb-6 border`}>
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Essay Ready ({selectedQuestionType.name})</h3>
          </div>
          <p className={`${darkMode ? 'text-green-200' : 'text-green-700'} text-sm`}>
            {selectedQuestionType.studentResponse.substring(0, 150)}...
          </p>
        </div>

        {/* Marking Scheme Section */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 mb-6 shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Marking Scheme</h2>
            <span className="text-sm px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
              Required
            </span>
          </div>
          
          <div className="flex mb-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-1 flex`}>
              <button
                onClick={() => handleUploadOptionChange('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadOption === 'text'
                    ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                    : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => handleUploadOptionChange('file')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadOption === 'file'
                    ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                    : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                Upload File
              </button>
            </div>
          </div>
          
          {uploadOption === 'text' ? (
            <textarea
              value={markingScheme}
              onChange={(e) => setMarkingScheme(e.target.value)}
              placeholder="Paste your marking scheme here..."
              className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-gray-600 mt-2">Supports PDF, JPG, PNG files</p>
            </div>
          )}
          
          {markingScheme && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-medium">✓ Marking scheme loaded successfully</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !markingScheme.trim()}
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Get AI Feedback
            </button>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}
      </div>
      
      {/* Upload Warning Modal */}
      {showUploadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload File Warning</h3>
              <p className="text-gray-600 mb-6">
                Uploading a file is not recommended for accuracy reasons. Text pasting provides better results and more reliable AI evaluation. Are you sure you want to continue with file upload?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelFileUpload}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFileUpload}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
