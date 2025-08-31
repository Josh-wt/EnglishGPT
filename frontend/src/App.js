import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import PaymentSuccess from './PaymentSuccess';
import subscriptionService from './services/subscriptionService';
import toast, { Toaster } from 'react-hot-toast';
import SubscriptionDashboard from './SubscriptionDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';

// Import extracted components
import LandingPage from './components/LandingPage';
import QuestionTypePage from './components/QuestionType';
import AssessmentPage from './components/AssessmentPage';
import ResultsPage from './components/ResultsPage';
import HistoryPage from './components/HistoryPage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AccountPage from './components/AccountPage';
import PricingPage from './components/PricingPage';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import LockedAnalyticsPage from './components/LockedAnalyticsPage';
import LockedFeatureCard from './components/LockedFeatureCard';
import Dashboard from './components/Dashboard';

// Import hooks
import { useUser } from './hooks/useUser';
import { useEvaluations } from './hooks/useEvaluations';
import { useAnalytics } from './hooks/useAnalytics';
import { useValidation } from './hooks/useValidation';

import { useQuestionTypes } from './hooks/useQuestionTypes';

// Import services
import { submitEvaluation, getEvaluations, getEvaluation } from './services/evaluations';
import { getUserAnalytics } from './services/analytics';
import { getUserProfile, updateUserProfile } from './services/user';
import { submitFeedback } from './services/feedback';
import { getQuestionTypes } from './services/questionTypes';

// Import constants
import { API_ENDPOINTS } from './constants/apiEndpoints';
import { VALIDATION_RULES } from './constants/validationRules';
import { ERROR_MESSAGES } from './constants/errorMessages';

// Import utilities
import { validateEssayContent } from './utils/validation';

// Import UI components
import { Modal } from './components/ui/Modal';

const App = () => {
  // Use custom hooks for state management
  const { user, userStats, loading: userLoading, signInWithGoogle, signInWithDiscord, signOut, updateProfile, updateLevel } = useUser();
  const { evaluations, submitNewEvaluation, fetchEvaluations, addEvaluation } = useEvaluations();
  const { analytics, fetchAnalytics } = useAnalytics();
  const { validationError, showValidationModal, validateEssay, clearValidationError, closeValidationModal } = useValidation();
  const { questionTypes, loading: questionTypesLoading } = useQuestionTypes();

  // Local state
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'overall' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackAccurate, setFeedbackAccurate] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [essayHistory, setEssayHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentEssayText, setCurrentEssayText] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState({
    userUpdate: false,
    dataLoad: false,
    planUpdate: false,
    historyLoad: false,
    fileUpload: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Helper functions
  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Navigation handlers
  const handleStartQuestion = () => {
    setCurrentPage('questionTypes');
    navigate('/write');
  };

  const handleSelectQuestionType = (questionType) => {
    setSelectedQuestionType(questionType);
    setCurrentPage('assessment');
    navigate('/assessment');
  };

  const handleEvaluate = async (evaluationResult) => {
    try {
      setEvaluationLoading(true);
      
      // Validate essay content
      const validationResult = await validateEssay(evaluationResult.studentResponse, evaluationResult.questionType);
      if (!validationResult.isValid) {
        return;
      }

      // Submit evaluation
      const result = await submitNewEvaluation(evaluationResult);
      setEvaluation(result);
      setCurrentPage('results');
      navigate('/results');
    } catch (error) {
      console.error('Evaluation failed:', error);
      setErrorMessage('Evaluation failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setEvaluationLoading(false);
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

  const handleSelectPlan = async (plan) => {
    try {
      await subscriptionService.redirectToCheckout(user.id, plan);
    } catch (error) {
      console.error('Plan selection failed:', error);
      setErrorMessage('Failed to process plan selection. Please try again.');
      setShowErrorModal(true);
    }
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

  // Essay history handlers
  const addToHistory = (text) => {
    const newHistory = essayHistory.slice(0, historyIndex + 1);
    newHistory.push(text);
    setEssayHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undoEssay = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentEssayText(essayHistory[historyIndex - 1]);
    }
  };

  const redoEssay = () => {
    if (historyIndex < essayHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentEssayText(essayHistory[historyIndex + 1]);
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

  // Public result page wrapper
  const PublicResultPageWrapper = () => {
    const { id } = useParams();
    
    const fetchEvaluation = async () => {
      try {
        const result = await getEvaluation(id);
        setEvaluation(result);
      } catch (error) {
        console.error('Error fetching evaluation:', error);
        setErrorMessage('Failed to load evaluation results.');
        setShowErrorModal(true);
      }
    };

    useEffect(() => {
      if (id) {
        fetchEvaluation();
      }
    }, [id]);

    return evaluation ? <ResultsPage evaluation={evaluation} onNewEvaluation={handleNewEvaluation} /> : <div>Loading...</div>;
  };

  // Auth required component
  const AuthRequired = ({ children }) => {
    if (userLoading || !userStats) {
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-main'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="loading-animation">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
            <p className="mt-4 font-fredoka">Loading your data...</p>
            <p className="mt-2 text-sm opacity-75">Please wait while we fetch your information</p>
          </div>
        </div>
      );
    }

    if (!user) {
      navigate('/', { replace: true });
      return null;
    }

    return (
      <div className={darkMode ? 'dark' : ''}>
        {children}
      </div>
    );
  };

  // Sign in modal component
  const SignInModal = ({ isOpen, onClose, darkMode }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sign In Required</h3>
            <p className="text-gray-600 mb-6">Please sign in to access this feature.</p>
            <div className="space-y-3">
              <button
                onClick={() => { onClose(); signInWithGoogle(); }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => { onClose(); signInWithDiscord(); }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Sign in with Discord
              </button>
            </div>
            <button
              onClick={onClose}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Error modal component
  const ErrorModal = ({ isOpen, onClose, message, darkMode }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Error</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage onDiscord={signInWithDiscord} onGoogle={signInWithGoogle} />} />
        <Route path="/results/:id" element={<PublicResultPageWrapper />} />
        <Route path="/payment-success" element={<PaymentSuccess darkMode={darkMode} />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthRequired>
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
          <AuthRequired>
            <QuestionTypePage 
              questionTypes={questionTypes}
              onSelectQuestionType={handleSelectQuestionType}
              onBack={handleBack}
            />
          </AuthRequired>
        } />
        <Route path="/assessment" element={
          <AuthRequired>
            <AssessmentPage 
              selectedQuestionType={selectedQuestionType}
              onEvaluate={handleEvaluate}
              onBack={() => navigate('/write')}
              evaluationLoading={evaluationLoading}
              loadingMessage={loadingMessages[loadingMessageIndex]}
              essayHistory={essayHistory}
              historyIndex={historyIndex}
              currentEssayText={currentEssayText}
              addToHistory={addToHistory}
              undoEssay={undoEssay}
              redoEssay={redoEssay}
            />
          </AuthRequired>
        } />
        <Route path="/results" element={
          <AuthRequired>
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
          <AuthRequired>
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