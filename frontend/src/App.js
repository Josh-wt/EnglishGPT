import React, { useState, useEffect, useRef, lazy } from 'react';
import './App.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import hooks
import { useUser } from './hooks/useUser';
import { useQuestionTypes } from './hooks/useQuestionTypes';

// Import services
import { submitFeedback } from './services/feedback';
import api, { debugPendingRequests, debugAllRequests } from './services/api';
import { getApiUrl } from './utils/backendUrl';
import { supabase } from './supabaseClient';

// Import new modular components
import LevelSelectionModal from './components/modals/LevelSelectionModal';
import SignInModal from './components/modals/SignInModal';
import ErrorModal from './components/modals/ErrorModal';
import WelcomeModal from './components/modals/WelcomeModal';
import AuthRequired from './components/auth/AuthRequired';
import PublicResultPageWrapper from './components/results/PublicResultPageWrapper';
import KeyboardShortcutsHelp from './components/help/KeyboardShortcutsHelp';
import { LazyWrapper, PageSkeleton } from './components/LazyWrapper';
import PerformanceMonitor from './components/PerformanceMonitor';

// Lazy load all route components for code splitting
const LandingPage = lazy(() => import('./components/LandingPage'));
const QuestionTypePage = lazy(() => import('./components/QuestionType'));
const AssessmentPage = lazy(() => import('./components/AssessmentPage'));
const ResultsPage = lazy(() => import('./components/ResultsPage'));
const HistoryPage = lazy(() => import('./components/HistoryPage'));
const HistoryDetailPage = lazy(() => import('./components/HistoryPage/HistoryDetailPage'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const AccountPage = lazy(() => import('./components/AccountPage'));
const PricingPage = lazy(() => import('./components/PricingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const LaunchPeriodModal = lazy(() => import('./components/LaunchPeriodModal/LaunchPeriodModal'));
const ModernPricingPage = lazy(() => import('./components/PricingPage/ModernPricingPage'));
const SubscriptionDashboard = lazy(() => import('./components/SubscriptionDashboard/SubscriptionDashboard'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess/PaymentSuccess'));
const PaymentsDashboard = lazy(() => import('./components/AdminDashboard/PaymentsDashboard'));
const AdminResultsPage = lazy(() => import('./components/AdminResultsPage/AdminResultsPage'));
const EmailLogin = lazy(() => import('./components/EmailLogin'));

// Lazy load legal components
const TermsOfService = lazy(() => import('./components/legal').then(module => ({ default: module.TermsOfService })));
const RefundPolicy = lazy(() => import('./components/legal').then(module => ({ default: module.RefundPolicy })));
const PrivacyPolicy = lazy(() => import('./components/legal').then(module => ({ default: module.PrivacyPolicy })));

const App = () => {
  // Debug tracking
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const navigationHistory = useRef([]);
  const location = useLocation();

  // Add global debugging functions to window for console access
  useEffect(() => {
    // Make debugging functions available globally
    window.debugAPI = {
      pendingRequests: debugPendingRequests,
      allRequests: debugAllRequests,
      backendUrl: getApiUrl,
      userState: () => ({ user, userStats, loading: userLoading }),
      supabase: supabase,
      api: api
    };

    // Cleanup function
    return () => {
      delete window.debugAPI;
    };
  }, []); // Remove complex dependencies

  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Debug panel toggle
  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
  };

  // Add debug panel toggle to window
  useEffect(() => {
    window.toggleDebugPanel = toggleDebugPanel;
    
    return () => {
      delete window.toggleDebugPanel;
    };
  }, []); // Remove dependency

  // Track app renders and performance
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    // Performance monitoring - only log if render time is concerning
    if (timeSinceLastRender > 100) {
      console.warn('⚠️ Slow render detected:', {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        currentPath: location.pathname
      });
    }

    lastRenderTime.current = currentTime;
  });

  // Track navigation history
  useEffect(() => {
    navigationHistory.current.push({
      pathname: location.pathname,
      timestamp: new Date().toISOString(),
      renderCount: renderCount.current
    });

    // Keep only last 10 navigation events
    if (navigationHistory.current.length > 10) {
      navigationHistory.current = navigationHistory.current.slice(-10);
    }
  }, [location]);

  // Use custom hooks for state management
  const { user, userStats, loading: userLoading, signInWithGoogle, signInWithDiscord, signOut, updateLevel, refreshUserData, forceRefreshUserData } = useUser();
  const { questionTypes } = useQuestionTypes();

  // Debug user state changes - only log errors
  useEffect(() => {
    if (userLoading && user) {
      console.warn('⚠️ User loading state inconsistency detected');
    }
  }, [user, userLoading]);


  // Local state
  const [darkMode, setDarkMode] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showLevelSelectionModal, setShowLevelSelectionModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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

  // Track user state changes - only log critical issues
  useEffect(() => {
    if (user && !userStats && !userLoading) {
      console.warn('⚠️ User exists but no userStats available');
    }
  }, [user, userStats, userLoading]);

  // Show welcome modal for new users
  useEffect(() => {
    if (user && userStats && !userLoading) {
      // Check if user is new (has 3 credits and no evaluations) OR if they just signed up
      const isNewUser = userStats.credits === 3 && userStats.total_evaluations === 0;
      const hasSeenWelcome = localStorage.getItem(`hasSeenWelcomeModal_${user.id}`);
      
      // Also check if user was created recently (within last 5 minutes) - indicates fresh signup
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const isRecentSignup = (now - userCreatedAt) < 5 * 60 * 1000; // 5 minutes
      
      console.log('🔍 Welcome modal check:', {
        userId: user.id,
        isNewUser,
        isRecentSignup,
        hasSeenWelcome: !!hasSeenWelcome,
        userCreatedAt: userCreatedAt.toISOString(),
        credits: userStats.credits,
        totalEvaluations: userStats.total_evaluations
      });
      
      if ((isNewUser || isRecentSignup) && !hasSeenWelcome) {
        console.log('🎉 Showing welcome modal for new user');
        setShowWelcomeModal(true);
        localStorage.setItem(`hasSeenWelcomeModal_${user.id}`, 'true');
      }
    }
  }, [user, userStats, userLoading]);

  // Fetch evaluations when user is logged in
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (user?.id) {
        try {
          const startTime = Date.now();
          console.log(`🔄 Loading evaluations for user ${user.id}...`);
          
          // Add timeout to evaluation fetching
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            const timeoutDuration = Date.now() - startTime;
            console.warn('⏰ Evaluations fetch timed out after 15 seconds', {
              duration: `${timeoutDuration}ms`,
              userId: user.id,
              timestamp: new Date().toISOString()
            });
          }, 15000);
          
          // Fetch evaluations using the evaluations service with timeout
          const evalResponse = await api.get(`/evaluations/user/${user.id}`, {
            signal: controller.signal,
            timeout: 15000
          });
          
          clearTimeout(timeoutId);
          const duration = Date.now() - startTime;
          
          console.log(`✅ Evaluations loaded: ${evalResponse.data?.evaluations?.length || 0} items in ${duration}ms`);
          
          // Performance monitoring - log slow requests
          if (duration > 3000) {
            console.warn(`⚠️ Slow evaluations fetch: ${duration}ms for user ${user.id}`);
          }
          
          if (evalResponse.data?.evaluations) {
            setEvaluations(evalResponse.data.evaluations);
          } else {
            setEvaluations([]);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.warn('⏰ Evaluations fetch was aborted due to timeout');
            setEvaluations([]);
          } else {
            console.error('❌ Error fetching evaluations:', error);
            setEvaluations([]);
          }
        }
      }
    };

    fetchEvaluations();
  }, [user]);

  // Set academic level from userStats when available
  useEffect(() => {
    if (userStats?.academicLevel && userStats.academicLevel !== 'N/A') {
      setSelectedLevel(userStats.academicLevel.toLowerCase());
    }
  }, [userStats]);

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
    
    // Save level to user account using the useUser hook function
    if (user?.id) {
      try {
        await updateLevel(level);
      } catch (error) {
        console.error('❌ Error saving academic level:', error);
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
          error: `Your essay is too short. You have ${wordCount} word, but you need at least 100 words for a proper evaluation. We understand you might want to test our AI, for that, please look at our examples on the dashboard. Please write a more detailed response to get meaningful feedback.`
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
    if (!evaluationResult) {
      console.error('❌ No evaluationResult provided');
      return;
    }
    
    const userId = user?.uid || user?.id;
    
    if (!user || !userId) {
      console.error('❌ Cannot evaluate: user not ready');
      setErrorMessage('Please wait for authentication to complete.');
      setShowErrorModal(true);
      return;
    }
    
    // Ensure user_id is set
    if (!evaluationResult.user_id && user?.id) {
      evaluationResult.user_id = user.id;
    }
    
    // Check user credits before allowing evaluation
    if (userStats && userStats.current_plan === 'free' && userStats.credits <= 0) {
      setErrorMessage('No credits remaining. Please upgrade to unlimited for unlimited marking.');
      setShowErrorModal(true);
      return;
    }
    
    // Validate essay content before sending to API
    const validation = validateEssayContent(evaluationResult.student_response, evaluationResult.question_type);
    
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      setShowErrorModal(true);
      return;
    }
    
    setEvaluationLoading(true);
    const evaluationStartTime = Date.now();
    console.log('🚀 PERFORMANCE: Starting evaluation process...');
    
    try {
      const evaluationWithUser = {
        ...evaluationResult,
        user_id: userId
      };
      
      // Pre-request debugging
      console.log('🔍 Pre-request validation:', {
        originalEvaluationResult: evaluationResult,
        userId: userId,
        finalEvaluationData: evaluationWithUser,
        dataTypes: {
          student_response: typeof evaluationWithUser.student_response,
          question_type: typeof evaluationWithUser.question_type,
          user_id: typeof evaluationWithUser.user_id,
          academic_level: typeof evaluationWithUser.academic_level
        },
        dataValidation: {
          hasStudentResponse: !!evaluationWithUser.student_response,
          studentResponseNotEmpty: evaluationWithUser.student_response?.trim().length > 0,
          hasQuestionType: !!evaluationWithUser.question_type,
          hasUserId: !!evaluationWithUser.user_id,
          hasAcademicLevel: !!evaluationWithUser.academic_level
        }
      });
      
      const API = getApiUrl();
      const startTime = Date.now();
      console.log(`🔄 Starting evaluation for ${evaluationResult.question_type}...`);
      
      // Get auth token for the request
      let authHeaders = {
        'Content-Type': 'application/json',
      };
      
      try {
        const authStartTime = Date.now();
        const { data: { session } } = await supabase.auth.getSession();
        const authTime = Date.now() - authStartTime;
        console.log(`📊 Auth session fetch: ${authTime}ms`);
        
        if (session?.access_token) {
          authHeaders.Authorization = `Bearer ${session.access_token}`;
        } else {
          console.warn('⚠️ No auth session found for evaluate request');
        }
      } catch (authError) {
        console.error('❌ Error getting auth session for evaluate:', authError);
      }
      
      const fetchStartTime = Date.now();
      const response = await fetch(`${API}/evaluate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(evaluationWithUser),
      });
      const fetchTime = Date.now() - fetchStartTime;
      console.log(`📊 Evaluation API call: ${fetchTime}ms`);
      
      const duration = Date.now() - startTime;
      const totalDuration = Date.now() - evaluationStartTime;
      console.log(`🚀 PERFORMANCE: API call completed in ${duration}ms`);
      console.log(`🚀 PERFORMANCE: Total evaluation time: ${totalDuration}ms`);
      
      // Performance monitoring - log slow evaluations
      if (duration > 10000) {
        console.warn(`⚠️ PERFORMANCE: Slow API request: ${duration}ms`);
      }
      if (totalDuration > 30000) {
        console.warn(`⚠️ PERFORMANCE: Slow total evaluation: ${totalDuration}ms`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Evaluation request failed:', response.status, errorText);
        
        // Enhanced debugging for 422 errors
        if (response.status === 422) {
          console.error('🚨 422 UNPROCESSABLE ENTITY - Detailed Debug Info:');
          console.error('📊 Request Details:', {
            url: `${API}/evaluate`,
            method: 'POST',
            headers: authHeaders,
            body: evaluationWithUser
          });
          console.error('📝 Request Body Analysis:', {
            hasStudentResponse: !!evaluationWithUser.student_response,
            studentResponseLength: evaluationWithUser.student_response?.length,
            studentResponsePreview: evaluationWithUser.student_response?.substring(0, 100) + '...',
            hasQuestionType: !!evaluationWithUser.question_type,
            questionType: evaluationWithUser.question_type,
            hasUserId: !!evaluationWithUser.user_id,
            userId: evaluationWithUser.user_id,
            hasAcademicLevel: !!evaluationWithUser.academic_level,
            academicLevel: evaluationWithUser.academic_level,
            allKeys: Object.keys(evaluationWithUser),
            fullBody: evaluationWithUser
          });
          console.error('🔍 Response Analysis:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorText
          });
          
          // Try to parse error response as JSON for more details
          try {
            const errorData = JSON.parse(errorText);
            console.error('📋 Parsed Error Response:', errorData);
          } catch (parseError) {
            console.error('⚠️ Could not parse error response as JSON:', parseError);
          }
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const parseStartTime = Date.now();
      const responseData = await response.json();
      const parseTime = Date.now() - parseStartTime;
      console.log(`📊 Response parsing: ${parseTime}ms`);
      
      setEvaluation(responseData);
      setEvaluations(prev => [responseData, ...prev]);
      
      // Refresh user data to get updated questions marked counter from backend
      try {
        const refreshStartTime = Date.now();
        await refreshUserData();
        const refreshTime = Date.now() - refreshStartTime;
        console.log(`📊 User data refresh: ${refreshTime}ms`);
      } catch (refreshError) {
        console.error('❌ Error refreshing user data:', refreshError);
      }
      
      // Navigate to shareable public results page (prefer short_id if present)
      const resultId = responseData?.short_id || responseData?.id;
      
      if (resultId) {
        navigate(`/results/${resultId}`);
      } else {
        console.warn('⚠️ No result ID available, navigating to dashboard');
        navigate(`/dashboard`);
      }
      
      const finalDuration = Date.now() - evaluationStartTime;
      console.log(`🚀 PERFORMANCE: Evaluation process completed in ${finalDuration}ms`);
      console.log(`🚀 PERFORMANCE: Loading animation duration: ${finalDuration}ms`);
      setEvaluationLoading(false);
      
    } catch (error) {
      console.error('❌ Error evaluating submission:', error);
      
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
        errorMsg = 'Network error. You might wanna plug in your router, just a thought. ';
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setEvaluationLoading(false);
    }
  };

  const handleNewEvaluation = () => {
    if (!user) {
      // Show sign-in modal for unauthenticated users
      setShowSignInModal(true);
    } else {
      // For authenticated users, navigate to write page
      setEvaluation(null);
      setSelectedQuestionType(null);
      setCurrentPage('questionTypes');
      navigate('/write');
    }
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
        if (e.altKey && e.key === '5') {
          e.preventDefault();
          navigate('/subscription');
        }
        if (e.altKey && e.key === '6') {
          e.preventDefault();
          navigate('/account/preferences');
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
      console.log('🚀 PERFORMANCE: Loading animation started');
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const newIndex = (prev + 1) % loadingMessages.length;
          console.log(`🚀 PERFORMANCE: Loading message changed to index ${newIndex}: "${loadingMessages[newIndex]}"`);
          return newIndex;
        });
      }, 2000);
      
      return () => {
        console.log('🚀 PERFORMANCE: Loading animation stopped');
        clearInterval(interval);
      };
    } else {
      setLoadingMessageIndex(0);
    }
  }, [evaluationLoading, loadingMessages.length]);









  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <LazyWrapper fallback={<PageSkeleton />}>
            <LandingPage onDiscord={signInWithDiscord} onGoogle={signInWithGoogle} user={user} />
          </LazyWrapper>
        } />
        <Route path="/results/:id" element={
          <PublicResultPageWrapper 
            darkMode={darkMode}
            userStats={userStats}
            showSignInModal={showSignInModal}
            setShowSignInModal={setShowSignInModal}
            user={user}
            signInWithGoogle={signInWithGoogle}
            signInWithDiscord={signInWithDiscord}
          />
        } />
        <Route path="/results/:shortId/admin/josh" element={
          <LazyWrapper fallback={<PageSkeleton />}>
            <AdminResultsPage darkMode={darkMode} />
          </LazyWrapper>
        } />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              {(() => {
                console.log('🔍 DEBUG App.js - Passing userStats to Dashboard:', userStats);
                console.log('🔍 DEBUG App.js - userStats type:', typeof userStats);
                console.log('🔍 DEBUG App.js - userStats keys:', userStats ? Object.keys(userStats) : 'null/undefined');
                return (
                  <Dashboard 
                    questionTypes={questionTypes}
                    onStartQuestion={handleStartQuestion}
                    onPricing={() => navigate('/pricing')}
                    onHistory={() => {
                      console.log('🔍 DEBUG App.js onHistory called');
                      console.log('🔍 DEBUG App.js navigating to /history');
                      navigate('/history');
                    }}
                    onAnalytics={() => {
                      console.log('🔍 DEBUG App.js onAnalytics called');
                      console.log('🔍 DEBUG App.js navigating to /analytics');
                      navigate('/analytics');
                    }}
                    onAccountSettings={() => navigate('/account')}
                    onSubscription={() => navigate('/subscription')}
                    userStats={userStats || {}}
                    user={user}
                    darkMode={darkMode}
                    onSignOut={signOut}
                  />
                );
              })()}
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/write" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
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
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/assessment" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <AssessmentPage 
                selectedQuestionType={selectedQuestionType}
                onEvaluate={handleEvaluate}
                onBack={() => navigate('/write')}
                darkMode={darkMode}
                evaluationLoading={evaluationLoading}
                loadingMessage={loadingMessages[loadingMessageIndex]}
              />
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/results" element={
          <LazyWrapper fallback={<PageSkeleton />}>
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
              user={user}
              signInWithGoogle={signInWithGoogle}
              signInWithDiscord={signInWithDiscord}
              navigate={navigate}
            />
          </LazyWrapper>
        } />
        <Route path="/history" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              {(() => {
                // Check if user has unlimited access
                const hasUnlimitedAccess = userStats?.current_plan === 'unlimited' || userStats?.credits >= 99999;
                
                console.log('🔍 DEBUG /history route - hasUnlimitedAccess check:');
                console.log('🔍 DEBUG userStats:', userStats);
                console.log('🔍 DEBUG current_plan:', userStats?.current_plan);
                console.log('🔍 DEBUG credits:', userStats?.credits);
                console.log('🔍 DEBUG hasUnlimitedAccess:', hasUnlimitedAccess);
                
                if (!hasUnlimitedAccess) {
                  // Redirect to pricing page for free users
                  console.log('🔍 DEBUG REDIRECTING TO PRICING - user does not have unlimited access');
                  navigate('/pricing');
                  return null;
                }
                
                console.log('🔍 DEBUG RENDERING HistoryPage - user has unlimited access');
                return (
                  <HistoryPage 
                    evaluations={evaluations}
                    onBack={handleBack}
                    userPlan={userStats?.currentPlan || 'free'}
                  />
                );
              })()}
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/history/:shortId" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <HistoryDetailPage 
                evaluations={evaluations}
                onBack={handleBack}
                userPlan={userStats?.currentPlan || 'free'}
              />
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/analytics" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <AnalyticsDashboard 
                userStats={userStats || {}}
                user={user}
                evaluations={evaluations}
                onBack={handleBack}
                onUpgrade={() => navigate('/pricing')}
              />
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/account" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <AccountPage 
                user={user}
                userStats={userStats || {}}
                onLevelChange={updateLevel}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onPricing={() => navigate('/pricing')}
                onBack={handleBack}
              />
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/account/preferences" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <AccountPage 
                user={user}
                userStats={userStats || {}}
                onLevelChange={updateLevel}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onPricing={() => navigate('/pricing')}
                onBack={handleBack}
                defaultTab="preferences"
              />
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/pricing" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <ModernPricingPage 
                user={user}
                onBack={handleBack}
                darkMode={darkMode}
              />
            </LazyWrapper>
          </AuthRequired>
        } />
        <Route path="/subscription" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <LazyWrapper fallback={<PageSkeleton />}>
              <SubscriptionDashboard 
                user={user}
                darkMode={darkMode}
              />
            </LazyWrapper>
          </AuthRequired>
        } />
            <Route path="/payment-success" element={
              <LazyWrapper fallback={<PageSkeleton />}>
                <PaymentSuccess
                  user={user}
                  darkMode={darkMode}
                  forceRefreshUserData={forceRefreshUserData}
                />
              </LazyWrapper>
            } />
            <Route path="/admin/payments" element={
              <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
                <LazyWrapper fallback={<PageSkeleton />}>
                  <PaymentsDashboard
                    user={user}
                    darkMode={darkMode}
                  />
                </LazyWrapper>
              </AuthRequired>
            } />
        <Route path="/login/email" element={
          <LazyWrapper fallback={<PageSkeleton />}>
            <EmailLogin />
          </LazyWrapper>
        } />
        <Route path="/terms" element={
          <LazyWrapper fallback={<PageSkeleton />}>
            <TermsOfService />
          </LazyWrapper>
        } />
        <Route path="/refund" element={
          <LazyWrapper fallback={<PageSkeleton />}>
            <RefundPolicy />
          </LazyWrapper>
        } />
        <Route path="/privacy" element={
          <LazyWrapper fallback={<PageSkeleton />}>
            <PrivacyPolicy />
          </LazyWrapper>
        } />
      </Routes>

      {/* Global modals and components */}
                  <SignInModal
              isOpen={showSignInModal}
              onClose={() => setShowSignInModal(false)}
              darkMode={darkMode}
              onDiscord={signInWithDiscord}
              onGoogle={signInWithGoogle}
              user={user}
              navigate={navigate}
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
            <WelcomeModal
              isOpen={showWelcomeModal}
              onClose={() => setShowWelcomeModal(false)}
              onGetStarted={() => {
                setShowWelcomeModal(false);
                navigate('/write');
              }}
            />
            <LaunchPeriodModal 
              darkMode={darkMode}
              getApiUrl={getApiUrl}
            />
      <KeyboardShortcutsHelp 
        isVisible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
      
      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md text-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">🔧 Debug Panel</h3>
            <button 
              onClick={toggleDebugPanel}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <strong>Backend URL:</strong> {getApiUrl()}
            </div>
            <div>
              <strong>User Loading:</strong> {userLoading ? '🔄 Yes' : '✅ No'}
            </div>
            <div>
              <strong>Has User:</strong> {user ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Current Path:</strong> {location.pathname}
            </div>
            
            <hr className="border-gray-600 my-2" />
            
            <button 
              onClick={() => {
                try {
                  window.debugAPI?.pendingRequests();
                } catch (e) {
                  console.error('Debug function error:', e);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs w-full"
            >
              Check Pending Requests
            </button>
            
            <button 
              onClick={() => {
                try {
                  window.debugAPI?.allRequests();
                } catch (e) {
                  console.error('Debug function error:', e);
                }
              }}
              className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs w-full"
            >
              Check All Requests
            </button>
          </div>
        </div>
      )}
      
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
      
      {/* Performance Monitor - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor enabled={true} />
      )}
    </>
  );
};

export default App;