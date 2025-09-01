import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PaymentSuccess from './PaymentSuccess';
import subscriptionService from './services/subscriptionService';
import { Toaster } from 'react-hot-toast';
import SubscriptionDashboard from './SubscriptionDashboard';

// Import extracted components
import LandingPage from './components/LandingPage';
import QuestionTypePage from './components/QuestionType';
import AssessmentPage from './components/AssessmentPage';
import ResultsPage from './components/ResultsPage';
import HistoryPage from './components/HistoryPage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AccountPage from './components/AccountPage';
import PricingPage from './components/PricingPage';
import Dashboard from './components/Dashboard';

// Import hooks
import { useUser } from './hooks/useUser';
import { useQuestionTypes } from './hooks/useQuestionTypes';

// Import services
import { submitFeedback } from './services/feedback';
import api from './services/api';

// Import new modular components
import LevelSelectionModal from './components/modals/LevelSelectionModal';
import SignInModal from './components/modals/SignInModal';
import ErrorModal from './components/modals/ErrorModal';
import AuthRequired from './components/auth/AuthRequired';
import PublicResultPageWrapper from './components/results/PublicResultPageWrapper';
import KeyboardShortcutsHelp from './components/help/KeyboardShortcutsHelp';

const App = () => {
  // Use custom hooks for state management
  const { user, userStats, loading: userLoading, signInWithGoogle, signInWithDiscord, signOut, updateLevel } = useUser();
  const { questionTypes } = useQuestionTypes();

  // Local state
  const [darkMode, setDarkMode] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showLevelSelectionModal, setShowLevelSelectionModal] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'overall' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackAccurate, setFeedbackAccurate] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [evaluations, setEvaluations] = useState([]);

  const navigate = useNavigate();



  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Navigation handlers
  const handleStartQuestion = () => {
    if (selectedLevel) {
      setCurrentPage('questionTypes');
      navigate('/write');
    } else {
      // Show level selection modal for first-time users
      setShowLevelSelectionModal(true);
    }
  };

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    setShowLevelSelectionModal(false);
    
    // Save level to user account
    if (user?.id) {
      try {
        await api.put(`/users/${user.id}`, { academic_level: level });
      } catch (error) {
        console.error('Error saving academic level:', error);
      }
    }
    
    // Navigate to write page
    setCurrentPage('questionTypes');
    navigate('/write');
  };

  const handleSelectQuestionType = (questionType) => {
    setSelectedQuestionType(questionType);
    if (questionType.studentResponse) {
      // This is coming from QuestionTypePage with student response
      setCurrentPage('assessment');
      navigate('/assessment');
    } else {
      // This is a regular question type selection
      setCurrentPage('assessment');
      navigate('/assessment');
    }
  };

  // Validation function for essay content
  const validateEssayContent = (studentResponse, questionType) => {
    const wordCount = studentResponse.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Skip word count validation for summary writing
    if (questionType === 'igcse_summary') {
      // Only check for test content
    } else {
      // Check word count for other question types
      if (1 < wordCount && wordCount < 100) {
        return {
          isValid: false,
          error: `Your essay is too short. You have ${wordCount} words, but you need at least 100 words for a proper evaluation. We understand you might want to test our AI, for that, please look at our examples on the dashboard. Please write a more detailed response to get meaningful feedback.`
        };
      }
      if (wordCount === 1) {
        return {
          isValid: false,
          error: `Your essay is too long. You have ${wordCount} word, but you need at least 100 words for a proper evaluation. We understand you might want to test our AI, for that, please look at our examples on the dashboard. Please write a more detailed response to get meaningful feedback.`
        };
      }
    }
    
    // Check for test content
    const testWords = ['test', 'hello', 'world', 'random', 'testing', 'sample', 'example', 'demo', 'essay', 'essay writing', 'essay help', 'essay writing help', 'essay writing service', 'essay writing assistant', 'essay writing tool', 'essay writing software', 'essay writing app', 'essay writing online', 'essay writing tool', 'essay writing software', 'essay writing app', 'essay writing online', 'okay'];
    const lowerResponse = studentResponse.toLowerCase();
    
    // Check if response contains mostly test words or is very repetitive
    const testWordCount = testWords.filter(word => lowerResponse.includes(word)).length;
    const uniqueWords = new Set(lowerResponse.split(/\s+/).filter(word => word.length > 0));
    const totalWords = lowerResponse.split(/\s+/).filter(word => word.length > 0).length;
    
    if (testWordCount > 2 || (uniqueWords.size / totalWords) < 0.3) {
      return {
        isValid: false,
        error: `Your essay appears to be test content or contains repetitive text. Please write a proper essay with meaningful content to get accurate feedback. The AI needs real content to provide helpful analysis.`
      };
    }
    
    // Check for very short responses
    if (studentResponse.trim().length < 200) {
      return {
        isValid: false,
        error: `Your essay is too brief for meaningful analysis. Please write a more detailed response (at least 200 characters) to receive comprehensive feedback.`
      };
    }
    
    return { isValid: true };
  };

  const handleEvaluate = async (evaluationResult) => {
    console.log('🔍 DEBUG: handleEvaluate called with:', evaluationResult);
    console.log('🔍 DEBUG: Current user:', user);
    console.log('🔍 DEBUG: Current userStats:', userStats);
    
    if (!evaluationResult) {
      console.error('🔍 DEBUG: No evaluationResult provided');
      return;
    }
    
    const userId = user?.uid || user?.id;
    console.log('🔍 DEBUG: User ID extracted:', userId);
    
    if (!user || !userId) {
      console.error('🔍 DEBUG: Cannot evaluate: user not ready');
      setErrorMessage('Please wait for authentication to complete.');
      setShowErrorModal(true);
      return;
    }
    
    // Ensure user_id is set
    if (!evaluationResult.user_id && user?.id) {
      evaluationResult.user_id = user.id;
      console.log('🔍 DEBUG: Set user_id in evaluationResult:', evaluationResult.user_id);
    }
    
    console.log('🔍 DEBUG: About to validate essay content');
    console.log('🔍 DEBUG: student_response length:', evaluationResult.student_response?.length);
    console.log('🔍 DEBUG: question_type:', evaluationResult.question_type);
    
    // Validate essay content before sending to API
    const validation = validateEssayContent(evaluationResult.student_response, evaluationResult.question_type);
    console.log('🔍 DEBUG: Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('🔍 DEBUG: Validation failed:', validation.error);
      setErrorMessage(validation.error);
      setShowErrorModal(true);
      return;
    }
    
    console.log('🔍 DEBUG: Validation passed, setting loading state');
    setEvaluationLoading(true);
    
    try {
      const evaluationWithUser = {
        ...evaluationResult,
        user_id: userId
      };
      
      console.log('🔍 DEBUG: Evaluation data to send:', evaluationWithUser);
      
      const API = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`;
      console.log('🔍 DEBUG: API endpoint:', `${API}/evaluate`);
      console.log('🔍 DEBUG: Full URL:', `${API}/evaluate`);
      
      console.log('🔍 DEBUG: About to make fetch request');
      const response = await fetch(`${API}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationWithUser),
      });
      
      console.log('🔍 DEBUG: Response received:', response);
      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 DEBUG: Response not ok, error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      console.log('🔍 DEBUG: About to parse response as JSON');
      const responseData = await response.json();
      console.log('🔍 DEBUG: Response data:', responseData);
      console.log('🔍 DEBUG: Response data type:', typeof responseData);
      console.log('🔍 DEBUG: Response data keys:', Object.keys(responseData || {}));
      
      setEvaluation(responseData);
      console.log('🔍 DEBUG: Set evaluation state');
      
      setEvaluations(prev => [responseData, ...prev]);
      console.log('🔍 DEBUG: Added to evaluations list');
      
      // Navigate to shareable public results page (prefer short_id if present)
      const resultId = responseData?.short_id || responseData?.id;
      console.log('🔍 DEBUG: Result ID for navigation:', resultId);
      console.log('🔍 DEBUG: responseData.short_id:', responseData?.short_id);
      console.log('🔍 DEBUG: responseData.id:', responseData?.id);
      
      if (resultId) {
        console.log('🔍 DEBUG: Navigating to results page with ID:', resultId);
        navigate(`/results/${resultId}`);
        console.log('🔍 DEBUG: Navigation called');
      } else {
        console.warn('🔍 WARNING: No result ID available, navigating to dashboard');
        navigate(`/dashboard`);
        console.log('🔍 DEBUG: Navigation to dashboard called');
      }
      
      console.log('🔍 DEBUG: About to clear loading state');
      setEvaluationLoading(false);
      console.log('🔍 DEBUG: Loading state cleared');
      
    } catch (error) {
      console.error('🔍 DEBUG: Error evaluating submission:', error);
      console.error('🔍 DEBUG: Error name:', error.name);
      console.error('🔍 DEBUG: Error message:', error.message);
      console.error('🔍 DEBUG: Error stack:', error.stack);
      
      // Handle specific error messages
      let errorMsg = 'Evaluation failed. Please try again.';
      
      if (error.message.includes('402')) {
        errorMsg = 'No credits remaining. Please upgrade to unlimited for unlimited marking.';
      } else if (error.message.includes('429')) {
        errorMsg = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('404')) {
        errorMsg = 'User account not found. Please sign in again.';
      } else if (error.message.includes('500')) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.message.includes('NetworkError')) {
        errorMsg = 'Network error. Please check your connection and try again.';
      }
      
      console.log('🔍 DEBUG: Setting error message:', errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      console.log('🔍 DEBUG: Error modal shown');
    } finally {
      console.log('🔍 DEBUG: Finally block - clearing loading state');
      setEvaluationLoading(false);
      console.log('🔍 DEBUG: Loading state cleared in finally block');
    }
  };

  const handleNewEvaluation = () => {
    setEvaluation(null);
    setSelectedQuestionType(null);
    setCurrentPage('questionTypes');
    navigate('/write');
  };



  const handleBack = () => {
    setCurrentPage('dashboard');
    navigate('/dashboard');
  };



  // Feedback handlers
  const handleSubmitFeedback = async () => {
    if (!evaluation || !user) return;
    if (feedbackAccurate === null) return;
    setFeedbackSubmitting(true);
    try {
      await submitFeedback({
        evaluation_id: evaluation.id || evaluation?.evaluation_id || evaluation?.timestamp || 'unknown',
        user_id: user?.id,
        category: feedbackModal.category,
        accurate: !!feedbackAccurate,
        comments: feedbackComments || null,
      });
      setFeedbackModal({ open: false, category: 'overall' });
      setFeedbackAccurate(null);
      setFeedbackComments('');
    } catch (e) {
      console.error('Feedback submit failed', e);
    } finally {
      setFeedbackSubmitting(false);
    }
  };



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );
      
      if (!isTyping) {
        if (e.altKey && e.key === '1') {
          e.preventDefault();
          navigate('/dashboard');
        }
        if (e.altKey && e.key === '2') {
          e.preventDefault();
          navigate('/analytics');
        }
        if (e.altKey && e.key === '3') {
          e.preventDefault();
          navigate('/history');
        }
        if (e.altKey && e.key === '4') {
          e.preventDefault();
          navigate('/account');
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          if (showShortcutsHelp) {
            setShowShortcutsHelp(false);
          } else if (showErrorModal) {
            setShowErrorModal(false);
          } else if (window.location.pathname !== '/dashboard') {
            navigate('/dashboard');
          }
        }
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setShowShortcutsHelp(true);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, showErrorModal, showShortcutsHelp]);

  // Loading messages
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
    if (evaluationLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [evaluationLoading, loadingMessages.length]);









  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage onDiscord={signInWithDiscord} onGoogle={signInWithGoogle} />} />
        <Route path="/results/:id" element={
          <PublicResultPageWrapper 
            darkMode={darkMode}
            userStats={userStats}
            showSignInModal={showSignInModal}
            setShowSignInModal={setShowSignInModal}
          />
        } />
        <Route path="/payment-success" element={<PaymentSuccess darkMode={darkMode} />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <Dashboard 
              questionTypes={questionTypes}
              onStartQuestion={handleStartQuestion}
              onPricing={() => navigate('/pricing')}
              onHistory={() => navigate('/history')}
              onAnalytics={() => navigate('/analytics')}
              onAccountSettings={() => navigate('/account')}
              onSubscription={() => navigate('/subscription')}
              userStats={userStats || {}}
              user={user}
              darkMode={darkMode}
              onSignOut={signOut}
            />
          </AuthRequired>
        } />
        <Route path="/write" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            {(() => {
              console.log('🔍 DEBUG: Rendering QuestionTypePage with handleEvaluate:', !!handleEvaluate);
              console.log('🔍 DEBUG: handleEvaluate function:', handleEvaluate);
              return (
                <QuestionTypePage 
                  questionTypes={questionTypes}
                  onSelectQuestionType={handleSelectQuestionType}
                  onBack={handleBack}
                  onEvaluate={handleEvaluate}
                  selectedLevel={selectedLevel}
                  darkMode={darkMode}
                  user={user}
                  evaluationLoading={evaluationLoading}
                  loadingMessage={loadingMessages[loadingMessageIndex]}
                />
              );
            })()}
          </AuthRequired>
        } />
        <Route path="/assessment" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <AssessmentPage 
              selectedQuestionType={selectedQuestionType}
              onEvaluate={handleEvaluate}
              onBack={() => navigate('/write')}
              darkMode={darkMode}
              evaluationLoading={evaluationLoading}
              loadingMessage={loadingMessages[loadingMessageIndex]}
            />
          </AuthRequired>
        } />
        <Route path="/results" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <ResultsPage 
              evaluation={evaluation}
              onNewEvaluation={handleNewEvaluation}
              onBack={handleBack}
              feedbackModal={feedbackModal}
              setFeedbackModal={setFeedbackModal}
              feedbackAccurate={feedbackAccurate}
              setFeedbackAccurate={setFeedbackAccurate}
              feedbackComments={feedbackComments}
              setFeedbackComments={setFeedbackComments}
              feedbackSubmitting={feedbackSubmitting}
              onSubmitFeedback={handleSubmitFeedback}
            />
          </AuthRequired>
        } />
        <Route path="/history" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <HistoryPage 
              evaluations={evaluations}
              onBack={handleBack}
              userPlan={userStats?.currentPlan || 'free'}
            />
          </AuthRequired>
        } />
        <Route path="/analytics" element={
          <AuthRequired>
            <AnalyticsDashboard 
              userStats={userStats || {}}
              user={user}
              evaluations={evaluations}
              onBack={handleBack}
              onUpgrade={() => navigate('/pricing')}
            />
          </AuthRequired>
        } />
        <Route path="/account" element={
          <AuthRequired>
            <AccountPage 
              user={user}
              userStats={userStats || {}}
              onLevelChange={updateLevel}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onPricing={() => navigate('/pricing')}
              onBack={handleBack}
            />
          </AuthRequired>
        } />
        <Route path="/pricing" element={
          <AuthRequired>
            <PricingPage 
              user={user}
              onBack={handleBack}
            />
          </AuthRequired>
        } />
        <Route path="/subscription" element={
          <AuthRequired>
            <SubscriptionDashboard 
              user={user}
              onBack={handleBack}
            />
          </AuthRequired>
        } />
      </Routes>

      {/* Global modals and components */}
                  <SignInModal
              isOpen={showSignInModal}
              onClose={() => setShowSignInModal(false)}
              darkMode={darkMode}
              onDiscord={signInWithDiscord}
              onGoogle={signInWithGoogle}
            />
            <LevelSelectionModal
              isOpen={showLevelSelectionModal}
              onClose={() => setShowLevelSelectionModal(false)}
              onLevelSelect={handleLevelSelect}
              darkMode={darkMode}
            />
            <ErrorModal 
              isOpen={showErrorModal} 
              onClose={() => setShowErrorModal(false)}
              message={errorMessage}
              darkMode={darkMode}
            />
      <KeyboardShortcutsHelp 
        isVisible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
          },
        }}
      />
    </>
  );
};

export default App;