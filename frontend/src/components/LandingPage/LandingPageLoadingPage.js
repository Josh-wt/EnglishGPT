import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitEvaluation } from '../../services/evaluations';
import LoadingSpinner from '../ui/LoadingSpinner';

const LandingPageLoadingPage = ({ essayData, user, onComplete, onError }) => {
  console.log('🎯 LOADING PAGE DEBUG: LandingPageLoadingPage rendered');
  console.log('🎯 LOADING PAGE DEBUG: essayData:', essayData);
  console.log('🎯 LOADING PAGE DEBUG: user:', user);
  console.log('🎯 LOADING PAGE DEBUG: user.id:', user?.id);
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "🤖 AI is analyzing your essay...",
    "📝 Checking grammar and structure...",
    "🎯 Evaluating content quality...",
    "✨ Analyzing writing style and flow...",
    "🔍 Examining vocabulary usage...",
    "📊 Assessing argument structure...",
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
    "⚡ Generating personalized feedback...",    
    "⭐ Finalizing detailed assessment...",
    "🎉 Almost done! Preparing your results..."
  ];

  // Rotate loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  // Simulate progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Don't go to 100% until evaluation is complete
        return prev + Math.random() * 10;
      });
    }, 500);
    
    return () => clearInterval(progressInterval);
  }, []);

  // Submit evaluation
  useEffect(() => {
    const submitEvaluationAsync = async () => {
      try {
        console.log('🔄 LOADING PAGE DEBUG: Starting evaluation submission');
        console.log('🔄 LOADING PAGE DEBUG: essayData:', essayData);
        console.log('🔄 LOADING PAGE DEBUG: user:', user);
        
        if (!essayData) {
          console.error('❌ LOADING PAGE DEBUG: No essayData provided');
          onError('No essay data provided');
          return;
        }
        
        if (!user) {
          console.error('❌ LOADING PAGE DEBUG: No user provided');
          onError('No user provided');
          return;
        }
        
        if (!essayData.questionType) {
          console.error('❌ LOADING PAGE DEBUG: No questionType in essayData');
          onError('No question type provided');
          return;
        }
        
        // Prepare evaluation data
        const evaluationData = {
          question_type: essayData.questionType.id,
          student_response: essayData.content,
          marking_scheme: null,
          user_id: user.id
        };
        
        console.log('📤 LOADING PAGE DEBUG: Submitting evaluation:', evaluationData);
        console.log('📤 LOADING PAGE DEBUG: question_type:', evaluationData.question_type);
        console.log('📤 LOADING PAGE DEBUG: student_response length:', evaluationData.student_response?.length);
        console.log('📤 LOADING PAGE DEBUG: user_id:', evaluationData.user_id);
        
        // Submit evaluation
        console.log('📤 LOADING PAGE DEBUG: Calling submitEvaluation...');
        const result = await submitEvaluation(evaluationData);
        console.log('✅ LOADING PAGE DEBUG: Evaluation completed:', result);
        console.log('✅ LOADING PAGE DEBUG: Result type:', typeof result);
        console.log('✅ LOADING PAGE DEBUG: Result keys:', Object.keys(result || {}));
        console.log('✅ LOADING PAGE DEBUG: Result short_id:', result?.short_id);
        console.log('✅ LOADING PAGE DEBUG: Result id:', result?.id);
        
        // Set progress to 100%
        setProgress(100);
        
        // Wait a moment for the progress bar to complete
        setTimeout(() => {
          // Navigate to results page
          const resultId = result?.short_id || result?.id;
          console.log('🔗 LOADING PAGE DEBUG: Final resultId for redirect:', resultId);
          if (resultId) {
            console.log('🔗 LOADING PAGE DEBUG: Redirecting to results page:', resultId);
            window.location.href = `/results/${resultId}`;
          } else {
            console.error('❌ LOADING PAGE DEBUG: No result ID received');
            console.error('❌ LOADING PAGE DEBUG: Full result object:', result);
            onError('No result ID received from evaluation');
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ LOADING PAGE DEBUG: Error submitting evaluation:', error);
        console.error('❌ LOADING PAGE DEBUG: Error name:', error.name);
        console.error('❌ LOADING PAGE DEBUG: Error message:', error.message);
        console.error('❌ LOADING PAGE DEBUG: Error stack:', error.stack);
        onError(error.message || 'Failed to submit evaluation');
      }
    };

    console.log('🎯 LOADING PAGE DEBUG: useEffect triggered, starting evaluation submission');
    submitEvaluationAsync();
  }, [essayData, user, onComplete, onError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Book Loader */}
        <div className="mb-8">
          <LoadingSpinner 
            message="" 
            size="large" 
          />
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="text-sm text-gray-600 font-fredoka">
            {Math.round(progress)}% Complete
          </div>
        </div>
        
        {/* Dynamic Message */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-4 animate-pulse">✨</div>
              <div className="text-gray-800 font-fredoka text-xl font-medium mb-3">
                {loadingMessages[currentMessageIndex]}
              </div>
              <div className="text-gray-600 text-sm font-fredoka">
                Our AI is carefully analyzing your <span className="font-semibold text-purple-600">{essayData.questionType.name}</span> submission. This may take up to 60 seconds.
              </div>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="text-xs text-gray-500 font-fredoka max-w-md mx-auto">
          💡 Did you know? Our AI analyzes over 50 different writing criteria to provide comprehensive feedback!
        </div>
      </div>
    </div>
  );
};

export default LandingPageLoadingPage;

