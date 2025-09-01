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
import { useEvaluations } from './hooks/useEvaluations';
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
  const { evaluations, submitNewEvaluation, fetchEvaluations } = useEvaluations();
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

  const navigate = useNavigate();

  // Load evaluations when user signs in
  useEffect(() => {
    if (user?.id) {
      fetchEvaluations(user.id);
    }
  }, [user?.id, fetchEvaluations]);

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

  const handleEvaluate = async (evaluationResult) => {
    console.log('🔍 DEBUG: handleEvaluate function exists and called');
    console.log('🔍 DEBUG: handleEvaluate called with:', evaluationResult);
    console.log('🔍 DEBUG: User:', user);
    console.log('🔍 DEBUG: UserStats:', userStats);
    
    try {
      setEvaluationLoading(true);
      console.log('🔍 DEBUG: Set evaluation loading to true');
      
      // Validate essay content - use snake_case properties from QuestionTypePage
      console.log('🔍 DEBUG: About to validate essay:', {
        student_response: evaluationResult.student_response,
        question_type: evaluationResult.question_type
      });
      
      const validationResult = await validateEssay(evaluationResult.student_response, evaluationResult.question_type);
      console.log('🔍 DEBUG: Validation result:', validationResult);
      
      if (!validationResult.isValid) {
        console.log('🔍 DEBUG: Validation failed, returning early');
        return;
      }

      console.log('🔍 DEBUG: Validation passed, about to submit evaluation');
      // Submit evaluation
      const result = await submitNewEvaluation(evaluationResult);
      console.log('🔍 DEBUG: Submit result:', result);
      console.log('🔍 DEBUG: Result structure:', {
        hasShortId: !!result?.short_id,
        hasId: !!result?.id,
        hasEvaluation: !!result?.evaluation,
        evaluationShortId: result?.evaluation?.short_id,
        evaluationId: result?.evaluation?.id,
        fullResult: result
      });
      
      setEvaluation(result);
      console.log('🔍 DEBUG: Set evaluation state');
      setCurrentPage('results');
      console.log('🔍 DEBUG: Set current page to results');
      
      // Navigate to shareable public results page (prefer short_id if present)
      let resultId = result?.short_id || result?.id || result?.evaluation?.short_id || result?.evaluation?.id;
      
      // If no short_id is provided, generate one from the regular id
      if (!resultId && result?.id) {
        // Generate a short ID from the regular ID (first 8 characters)
        resultId = result.id.substring(0, 8);
      }
      
      console.log('🔍 DEBUG: Result ID for navigation:', resultId);
      
      // Set loading to false before navigation
      setEvaluationLoading(false);
      console.log('🔍 DEBUG: Set evaluation loading to false before navigation');
      
      if (resultId) {
        navigate(`/results/${resultId}`);
        console.log('🔍 DEBUG: Navigated to results page with ID:', resultId);
      } else {
        navigate('/results');
        console.log('🔍 DEBUG: Navigated to results page without ID');
      }
    } catch (error) {
      console.error('🔍 DEBUG: Evaluation failed with error:', error);
      console.error('🔍 DEBUG: Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      setErrorMessage('Evaluation failed. Please try again.');
      setShowErrorModal(true);
      setEvaluationLoading(false);
      console.log('🔍 DEBUG: Set evaluation loading to false on error');
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
          } else if (location.pathname !== '/dashboard') {
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
  }, [navigate, showErrorModal, showShortcutsHelp, location.pathname]);

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