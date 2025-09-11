import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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
import LaunchPeriodModal from './components/LaunchPeriodModal/LaunchPeriodModal';
import ModernPricingPage from './components/PricingPage/ModernPricingPage';
import SubscriptionDashboard from './components/SubscriptionDashboard/SubscriptionDashboard';
import PaymentSuccess from './components/PaymentSuccess/PaymentSuccess';
import PaymentsDashboard from './components/AdminDashboard/PaymentsDashboard';
import { TermsOfService, RefundPolicy, PrivacyPolicy } from './components/legal';
import EmailLogin from './components/EmailLogin';

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
import EarlyAccessModal from './components/modals/EarlyAccessModal';
import AuthRequired from './components/auth/AuthRequired';
import PublicResultPageWrapper from './components/results/PublicResultPageWrapper';
import KeyboardShortcutsHelp from './components/help/KeyboardShortcutsHelp';

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

    console.log('🔧 Global debugging functions available:');
    console.log('  - window.debugAPI.pendingRequests() - Check pending API requests');
    console.log('  - window.debugAPI.allRequests() - Check all tracked requests');
    console.log('  - window.debugAPI.backendUrl() - Get current backend URL');
    console.log('  - window.debugAPI.userState() - Get current user state');
    console.log('  - window.debugAPI.supabase - Access Supabase client');
    console.log('  - window.debugAPI.api - Access API instance');

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
    console.log('🔧 Debug panel toggle available: window.toggleDebugPanel()');
    
    return () => {
      delete window.toggleDebugPanel;
    };
  }, []); // Remove dependency

  // Track app renders and performance
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    console.log('🚀 App Debug:', {
      renderCount: renderCount.current,
      timeSinceLastRender: `${timeSinceLastRender}ms`,
      currentPath: location.pathname,
      timestamp: new Date().toISOString()
    });

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

    console.log('🧭 App Navigation:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      navigationHistory: navigationHistory.current.slice(-3), // Last 3 events
      timestamp: new Date().toISOString()
    });
  }, [location]);

  // Use custom hooks for state management
  const { user, userStats, loading: userLoading, signInWithGoogle, signInWithDiscord, signOut, updateLevel, refreshUserData } = useUser();
  const { questionTypes } = useQuestionTypes();

  // Debug user state changes
  useEffect(() => {
    console.log('🔍 DEBUG: User state changed in App.js:', {
      user: user,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userLoading: userLoading,
      timestamp: new Date().toISOString()
    });
  }, [user, userLoading]);

  // Track when new users get unlimited access and show early access modal
  useEffect(() => {
    if (!userLoading && user && userStats) {
      // Check if this is a new user with unlimited access
      const isUnlimitedUser = userStats.currentPlan === 'unlimited' || userStats.credits === 999999;
      const isNewUser = userStats.questionsMarked === 0;
      
      // Check if we've already shown the modal to this user or if they declined
      const hasSeenEarlyAccessModal = localStorage.getItem(`earlyAccessModal_${user.id}`);
      const hasDeclinedUnlimited = localStorage.getItem(`declinedUnlimited_${user.id}`);
      
      if (isUnlimitedUser && isNewUser && !hasSeenEarlyAccessModal && !hasDeclinedUnlimited) {
        console.log('🎉 New unlimited user detected, showing early access modal');
        
        // Delay showing modal to ensure smooth user experience
        setTimeout(() => {
          setShowEarlyAccessModal(true);
          // Mark that we've shown the modal to this user
          localStorage.setItem(`earlyAccessModal_${user.id}`, 'true');
        }, 1000);
      }
    }
  }, [user, userStats, userLoading]);

  // Local state
  const [darkMode, setDarkMode] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showLevelSelectionModal, setShowLevelSelectionModal] = useState(false);
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
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

  // Track user state changes
  useEffect(() => {
    console.log('👤 App User State:', {
      userLoading,
      hasUser: !!user,
      hasUserStats: !!userStats,
      userData: user ? {
        id: user.id,
        email: user.email,
        uid: user.uid
      } : null,
      userStatsData: userStats ? {
        currentPlan: userStats.currentPlan,
        credits: userStats.credits,
        questionsMarked: userStats.questionsMarked
      } : null,
      timestamp: new Date().toISOString()
    });
  }, [user, userStats, userLoading]);

  // Fetch evaluations when user is logged in
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (user?.id) {
        try {
          console.log('📊 Fetching evaluations for user:', user.id);
          const startTime = Date.now();
          
          // Add timeout to evaluation fetching
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.warn('⏰ Evaluations fetch timed out after 15 seconds');
          }, 15000);
          
          // Fetch evaluations using the evaluations service with timeout
          const evalResponse = await api.get(`/evaluations/user/${user.id}`, {
            signal: controller.signal,
            timeout: 15000
          });
          
          clearTimeout(timeoutId);
          const duration = Date.now() - startTime;
          
          console.log('📊 Evaluations fetched in', duration, 'ms:', {
            count: evalResponse.data?.evaluations?.length || 0,
            hasData: !!evalResponse.data?.evaluations,
            fullResponse: evalResponse.data
          });
          
          if (evalResponse.data?.evaluations) {
            setEvaluations(evalResponse.data.evaluations);
            console.log('✅ Evaluations set in state:', evalResponse.data.evaluations.length, 'items');
          } else {
            console.log('⚠️ No evaluations found in response, setting empty array');
            setEvaluations([]);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.warn('⏰ Evaluations fetch was aborted due to timeout');
            setEvaluations([]);
          } else {
            console.error('❌ Error fetching evaluations:', error);
            console.error('❌ Error details:', {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              config: error.config,
              message: error.message,
              code: error.code
            });
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
      console.log('🎓 Setting academic level from userStats:', userStats.academicLevel);
      setSelectedLevel(userStats.academicLevel.toLowerCase());
    }
  }, [userStats]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Navigation handlers
  const handleStartQuestion = () => {
    console.log('🎯 handleStartQuestion called:', {
      selectedLevel,
      currentPage,
      timestamp: new Date().toISOString()
    });
    
    if (selectedLevel) {
      setCurrentPage('questionTypes');
      navigate('/write');
    } else {
      // Show level selection modal for first-time users
      console.log('🎓 Showing level selection modal');
      setShowLevelSelectionModal(true);
    }
  };

  const handleLevelSelect = async (level) => {
    console.log('🎓 handleLevelSelect called:', {
      level,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    setSelectedLevel(level);
    setShowLevelSelectionModal(false);
    
    // Save level to user account using the useUser hook function
    if (user?.id) {
      try {
        await updateLevel(level);
        console.log('✅ Academic level saved and cached');
      } catch (error) {
        console.error('❌ Error saving academic level:', error);
      }
    }
    
    // Navigate to write page
    setCurrentPage('questionTypes');
    navigate('/write');
  };

  const handleSelectQuestionType = (questionType) => {
    console.log('📝 handleSelectQuestionType called:', {
      questionType: questionType?.id,
      hasStudentResponse: !!questionType?.studentResponse,
      timestamp: new Date().toISOString()
    });
    
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
      
      const API = getApiUrl();
      console.log('🔍 DEBUG: API endpoint:', `${API}/evaluate`);
      console.log('🔍 DEBUG: Full URL:', `${API}/evaluate`);
      
      console.log('🔍 DEBUG: About to make fetch request');
      
      // Get auth token for the request
      let authHeaders = {
        'Content-Type': 'application/json',
      };
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authHeaders.Authorization = `Bearer ${session.access_token}`;
          console.log('🔐 Auth token added to evaluate request');
        } else {
          console.warn('⚠️ No auth session found for evaluate request');
        }
      } catch (authError) {
        console.error('❌ Error getting auth session for evaluate:', authError);
      }
      
      const response = await fetch(`${API}/evaluate`, {
        method: 'POST',
        headers: authHeaders,
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
      
      // Refresh user data to get updated questions marked counter from backend
      console.log('🔍 DEBUG: Refreshing user data to get updated questions marked counter');
      try {
        await refreshUserData();
        console.log('🔍 DEBUG: User data refreshed successfully');
      } catch (refreshError) {
        console.error('🔍 DEBUG: Error refreshing user data:', refreshError);
      }
      
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
    console.log('🔍 DEBUG: handleNewEvaluation called');
    console.log('🔍 DEBUG: user state:', {
      user: user,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userLoading: userLoading,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      console.log('❌ DEBUG: No user found, showing sign-in modal');
      // Show sign-in modal for unauthenticated users
      setShowSignInModal(true);
    } else {
      console.log('✅ DEBUG: User authenticated, redirecting to /write');
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

  const handleDeclineUnlimited = async () => {
    console.log('🔄 User declined unlimited access, setting to free plan');
    
    if (!user?.id) {
      console.error('❌ No user ID available');
      return;
    }
    
    try {
      console.log('🔄 Updating user plan to free via backend API');
      
      // Update user plan via backend API
      const response = await fetch(`${getApiUrl()}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          current_plan: 'free',
          credits: 3
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend API update error:', errorData);
        throw new Error(`API Error: ${errorData.detail || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ User plan updated to free via backend API:', result);
      
      // Mark that user declined unlimited for future reference
      localStorage.setItem(`declinedUnlimited_${user.id}`, 'true');
      
      // Refresh user data to reflect changes
      await refreshUserData();
      
      // Show success message
      setErrorMessage('Plan updated to free successfully!');
      setShowErrorModal(true);
      
    } catch (error) {
      console.error('❌ Error setting user to free plan:', error);
      // Show error to user
      setErrorMessage('Failed to update plan. Please try again.');
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
            user={user}
            signInWithGoogle={signInWithGoogle}
            signInWithDiscord={signInWithDiscord}
          />
        } />
        
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
              user={user}
              signInWithGoogle={signInWithGoogle}
              signInWithDiscord={signInWithDiscord}
              navigate={navigate}
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
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
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
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
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
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <ModernPricingPage 
              user={user}
              onBack={handleBack}
              darkMode={darkMode}
            />
          </AuthRequired>
        } />
        <Route path="/subscription" element={
          <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
            <SubscriptionDashboard 
              user={user}
              darkMode={darkMode}
            />
          </AuthRequired>
        } />
            <Route path="/payment-success" element={
              <PaymentSuccess
                user={user}
                darkMode={darkMode}
              />
            } />
            <Route path="/admin/payments" element={
              <AuthRequired user={user} userLoading={userLoading} userStats={userStats} darkMode={darkMode}>
                <PaymentsDashboard
                  user={user}
                  darkMode={darkMode}
                />
              </AuthRequired>
            } />
        <Route path="/login/email" element={<EmailLogin />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
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
            <EarlyAccessModal
              isOpen={showEarlyAccessModal}
              onClose={() => setShowEarlyAccessModal(false)}
              userName={user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'}
              onDeclineUnlimited={handleDeclineUnlimited}
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
    </>
  );
};

export default App;