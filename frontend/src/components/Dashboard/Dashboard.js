import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Footer from '../ui/Footer';

const Dashboard = ({ questionTypes, onStartQuestion, onPricing, onHistory, onAnalytics, onAccountSettings, onSubscription, userStats, user, darkMode, onSignOut, onRefreshUserData }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Debug userStats prop
  console.log('🔍 DEBUG Dashboard - Received userStats:', userStats);
  console.log('🔍 DEBUG Dashboard - userStats type:', typeof userStats);
  console.log('🔍 DEBUG Dashboard - userStats keys:', userStats ? Object.keys(userStats) : 'null/undefined');
  
  // Check if backend is having issues
  const hasBackendError = useMemo(() => {
    return userStats?.backend_error === true;
  }, [userStats?.backend_error]);

  // Memoized helper function to check if user has unlimited access
  const hasUnlimitedAccess = useMemo(() => {
    // If backend has errors, don't show unlimited access
    if (hasBackendError) {
      console.log('🔍 DEBUG Dashboard - Backend error detected, not showing unlimited access');
      return false;
    }
    
    const plan = userStats?.current_plan?.toLowerCase();
    const credits = userStats?.credits;
    const result = plan === 'unlimited' || credits >= 99999;
    
    console.log('🔍 DEBUG Dashboard - hasUnlimitedAccess calculation:', {
      plan,
      credits,
      'plan === "unlimited"': plan === 'unlimited',
      'credits >= 99999': credits >= 99999,
      result
    });
    
    return result;
  }, [userStats?.current_plan, userStats?.credits, hasBackendError]);

  // Memoized user stats to prevent unnecessary recalculations
  const memoizedUserStats = useMemo(() => {
    const stats = {
      questionsMarked: userStats?.questions_marked || userStats?.questionsMarked || 0,
      credits: userStats?.credits || 3,
      currentPlan: hasBackendError ? 'Backend Error' : (userStats?.current_plan || 'free')
    };
    
    console.log('🔍 DEBUG Dashboard - memoizedUserStats calculation:', {
      'userStats?.questions_marked': userStats?.questions_marked,
      'userStats?.questionsMarked': userStats?.questionsMarked,
      'userStats?.credits': userStats?.credits,
      'userStats?.current_plan': userStats?.current_plan,
      'hasBackendError': hasBackendError,
      'final stats': stats
    });
    
    return stats;
  }, [userStats?.questions_marked, userStats?.questionsMarked, userStats?.credits, userStats?.current_plan, hasBackendError]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleAccountDropdown = useCallback(() => {
    setShowAccountDropdown(prev => !prev);
  }, []);

  const handleAccountSettings = useCallback(() => {
    onAccountSettings();
    setShowAccountDropdown(false);
  }, [onAccountSettings]);

  const handleSubscription = useCallback(() => {
    onSubscription();
    setShowAccountDropdown(false);
  }, [onSubscription]);

  const handleAnalytics = useCallback(() => {
    onAnalytics();
    setShowAccountDropdown(false);
  }, [onAnalytics]);

  const handleHistory = useCallback(() => {
    onHistory();
    setShowAccountDropdown(false);
  }, [onHistory]);

  const handleSignOut = useCallback(async () => {
    await onSignOut();
    setShowAccountDropdown(false);
  }, [onSignOut]);


  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-card border-pink-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-6 sm:space-x-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                <img 
                  src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
                  alt="EnglishGPT Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className={`ml-1 sm:ml-2 text-base sm:text-xl font-fredoka ${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>EnglishGPT</span>
            </div>
            
            {/* Center Navigation - Hide on mobile - Improved spacing */}
            <div className="hidden lg:flex items-center">
              {/* User Stats - Show for all users */}
                <div className="flex items-center space-x-8">
                {hasUnlimitedAccess ? (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-fredoka font-bold text-purple-600">{memoizedUserStats.questionsMarked}</div>
                      <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Essays Marked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-fredoka font-bold text-blue-600 capitalize">
                        Unlimited
                      </div>
                      <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</div>
                    </div>

                  </>
                ) : (
                  <>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-blue-600">{memoizedUserStats.credits}</div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-green-600 capitalize">
                        Free
                    </div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-purple-600">{memoizedUserStats.questionsMarked}</div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Marked</div>
                  </div>
                  </>
              )}
              </div>
              
            </div>
            
            
            {/* Mobile User Stats - Show condensed version on mobile */}
            <div className="lg:hidden flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-xs">
                {hasUnlimitedAccess ? (
                  <>
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">{memoizedUserStats.questionsMarked}</span>
                    </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">Unlimited</span>
                  </div>

                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">{memoizedUserStats.credits}</span>
                </div>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">Free</span>
                    </div>
                  </>
              )}
              </div>
              
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Social Media Icons - Hide on mobile */}
              <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
                <a href="https://www.reddit.com/r/everythingenglish/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </a>
                <a href="https://discord.gg/xRqB4BWCcJ" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@everythingenglishdotxyz" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/everythingenglish.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
             {/* Navigation Buttons - FIXED to always navigate */}
             <button
                onClick={onPricing}
                className="font-fredoka bg-pink-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm sm:text-base"
              >
                Pricing
              </button>
              
              {/* FIXED Analytics Button - Always navigate */}
              <button 
                onClick={onAnalytics} // Always navigate, let AnalyticsDashboard handle lock state
                className="hidden sm:flex font-fredoka text-gray-600 hover:text-gray-900 items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics {!hasUnlimitedAccess && <span className="ml-1 text-xs">🔒</span>}
              </button>
              
              {/* FIXED History Button - Always navigate */}
              <button 
                onClick={onHistory} // Always navigate, let HistoryPage handle lock state
                className="hidden sm:flex font-fredoka text-gray-600 hover:text-gray-900 items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History {!hasUnlimitedAccess && <span className="ml-1 text-xs">🔒</span>}
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={handleAccountDropdown}
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 p-1 sm:p-2 rounded-lg transition-colors"
                >
                  <img 
                    src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/32'} 
                    alt="User Profile" 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-fredoka text-sm font-medium text-gray-900">{user?.user_metadata?.full_name || 'User'}</span>
                    <span className="font-fredoka text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Account Dropdown */}
                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button 
                        onClick={handleAccountSettings}
                        className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account Settings
                      </button>
                      
                      <button 
                        onClick={handleSubscription}
                        className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Subscription
                      </button>
                      
                      <button 
                        onClick={handleAnalytics}
                        className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analytics
                      </button>
                      
                      <button 
                        onClick={handleHistory}
                        className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                      </button>
                      
                      <div className="border-t border-gray-100"></div>
                      <button 
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left font-fredoka text-red-700 hover:bg-red-50 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* Simplified Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Main Hero Content */}
          <div className="text-center">
            {/* Simple Logo */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
            </motion.div>
            
            {/* Simple Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-4 font-fredoka">
                EnglishGPT
              </h1>
              <p className="text-lg text-gray-600 mb-12 font-fredoka">
                AI-powered essay marking and feedback
              </p>
            </motion.div>
            
            {/* Big Mark a Question Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={onStartQuestion}
                className="group relative px-16 py-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-3xl font-bold text-2xl font-fredoka shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Mark a Question</span>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            </motion.div>
            
            {/* Simple Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center space-x-12 mt-16"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 font-fredoka">{memoizedUserStats.questionsMarked}</div>
                <div className="text-sm text-gray-600 font-fredoka">Essays Marked</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold font-fredoka capitalize ${
                  hasBackendError ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {memoizedUserStats.currentPlan}
                </div>
                <div className="text-sm text-gray-600 font-fredoka">Plan</div>
                {hasBackendError && (
                  <div className="text-xs text-red-500 font-fredoka mt-1">
                    ⚠️ Backend Error
                  </div>
                )}
                {/* Temporary debug button to force refresh user data */}
                <button 
                  onClick={onRefreshUserData}
                  className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Force refresh user data (debug)"
                >
                  🔄 Refresh
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Question Types Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* IGCSE Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg mr-4">
                <span className="font-bold">IGCSE</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">International General Certificate of Secondary Education</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {/* Summary */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#3b82f6'}}>📄</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Summary</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Condensing key information from texts</p>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-1">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
              {/* Narrative */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#8b5cf6'}}>📖</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Narrative</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Creative storytelling and structure</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
              {/* Descriptive */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#22c55e'}}>🖼️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Descriptive</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Vivid imagery and atmospheric writing</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
              {/* Writer's Effect */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#f59e42'}}>⚡</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Writer's Effect</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Language analysis and impact</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
              {/* IGCSE Directed Writing */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#6366f1'}}>✍️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Directed Writing</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Transform text into specific formats</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">IGCSE</span>
                </div>
              </div>
            </div>
          </div>
          {/* A-Level Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-red-500 text-white px-4 py-2 rounded-lg mr-4">
                <span className="font-bold">A-Level</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Level English</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reflective Commentary */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#ef4444'}}>📊</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Reflective Commentary</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Critical reflection and personal response</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">A-Level English (9093)</span>
                </div>
              </div>
              {/* Directed Writing */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#22c55e'}}>✏️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Directed Writing</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Task-specific writing with audience awareness</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">A-Level English (9093)</span>
                </div>
              </div>
              {/* Text Analysis */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#ec4899'}}>🔍</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Text Analysis</h3>
                <p className="font-fredoka text-gray-600 text-sm mb-4">Literary analysis and critical interpretation</p>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">A-Level English (9093)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Dashboard;
