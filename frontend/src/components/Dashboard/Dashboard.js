import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Dashboard = ({ questionTypes, onStartQuestion, onPricing, onHistory, onAnalytics, onAccountSettings, onSubscription, userStats, user, darkMode, onSignOut }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Helper function to check if user has unlimited access
  const hasUnlimitedAccess = () => {
    const plan = userStats.currentPlan?.toLowerCase();
    return plan === 'unlimited';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-card border-pink-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 sm:space-x-6">
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
                <div className="flex items-center space-x-6">
                {hasUnlimitedAccess() ? (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-fredoka font-bold text-purple-600">{userStats.questionsMarked}</div>
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
                    <div className="text-lg font-fredoka font-bold text-blue-600">{userStats.credits}</div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-green-600 capitalize">
                        Free
                    </div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-purple-600">{userStats.questionsMarked}</div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Marked</div>
                  </div>
                  </>
              )}
              </div>
              
            </div>
            
            {/* New User Welcome Message - Separate from stats */}
            {!hasUnlimitedAccess() && userStats.questionsMarked === 0 && (
              <div className={`hidden lg:block ${darkMode ? 'bg-blue-900 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200'} px-3 py-1.5 rounded-lg border`}>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-sm">🎉 3 free credits</span>
                  <span className={`font-fredoka text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>• Upgrade for $4.99/mo</span>
                </div>
              </div>
            )}
            
            {/* Mobile User Stats - Show condensed version on mobile */}
            <div className="lg:hidden flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-xs">
                {hasUnlimitedAccess() ? (
                  <>
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">{userStats.questionsMarked}</span>
                    </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">Unlimited</span>
                  </div>

                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">{userStats.credits}</span>
                </div>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">Free</span>
                    </div>
                  </>
              )}
              </div>
              
              {/* Mobile Welcome Message - Compact */}
              {!hasUnlimitedAccess() && userStats.questionsMarked === 0 && (
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <span className="font-fredoka text-xs">🎉 3 free</span>
                </div>
              )}
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Social Media Icons - Hide on mobile */}
              <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
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
                Analytics {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
              </button>
              
              {/* FIXED History Button - Always navigate */}
              <button 
                onClick={onHistory} // Always navigate, let HistoryPage handle lock state
                className="hidden sm:flex font-fredoka text-gray-600 hover:text-gray-900 items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
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
                
                {/* Account Dropdown - UPDATED with mobile social links */}
                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {/* Mobile-only Analytics and History - FIXED to always navigate */}
                      <div className="sm:hidden">
                        <button 
                          onClick={() => {
                            onAnalytics(); // Always navigate, let page handle lock state
                            setShowAccountDropdown(false);
                          }} 
                          className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
                        </button>
                        
                        <button 
                          onClick={() => {
                            onHistory(); // Always navigate, let page handle lock state
                            setShowAccountDropdown(false);
                          }} 
                          className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          History {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
                        </button>
                        
                        {/* Mobile stats display */}
                        {(userStats.currentPlan !== 'basic' || userStats.questionsMarked > 0) && (
                          <div className="px-4 py-2 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                              <span className="font-fredoka text-gray-600">Credits:</span>
                              <span className="font-fredoka font-medium text-blue-600">{userStats.credits}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-fredoka text-gray-600">Plan:</span>
                              <span className="font-fredoka font-medium text-green-600">
                                {userStats.currentPlan === 'basic' ? 'No Plan' : userStats.currentPlan}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-fredoka text-gray-600">Marked:</span>
                              <span className="font-fredoka font-medium text-purple-600">{userStats.questionsMarked}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* UPDATED: Mobile Social Links instead of Billing History */}
                        <div className="border-t border-gray-100">
                          <a 
                            href="https://discord.gg/xRqB4BWCcJ" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                            </svg>
                            Join the Discord
                          </a>
                          
                          <a 
                            href="https://www.reddit.com/r/everythingenglish/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                            </svg>
                            Join Reddit
                          </a>
                        </div>
                      </div>
                      
                      {/* Desktop Account Options */}
                      <div className="hidden sm:block">
                        <button
                          onClick={() => {
                            onAccountSettings();
                            setShowAccountDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100"
                        >
                          Account Settings
                        </button>
                        <button
                          onClick={() => {
                            onSubscription();
                            setShowAccountDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100"
                        >
                          Subscription
                        </button>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => {
                              onSignOut();
                              setShowAccountDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left font-fredoka text-red-600 hover:bg-red-50"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <motion.h1 
            className={`text-4xl sm:text-5xl font-fredoka font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome to EnglishGPT
          </motion.h1>
          <motion.p 
            className={`text-lg sm:text-xl font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your AI-powered English essay marking assistant. Get instant feedback, detailed analysis, and personalized recommendations to improve your writing skills.
          </motion.p>
        </div>

        {/* Main Action Button */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={onStartQuestion}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-fredoka font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✨ Mark a Question
          </button>
        </motion.div>

        {/* Question Type Sections */}
        <div className="space-y-12">
          {/* IGCSE Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className={`text-2xl font-fredoka font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              IGCSE Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questionTypes.filter(q => q.category === 'IGCSE').map((questionType, index) => (
                <motion.div
                  key={questionType.id}
                  className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => onStartQuestion(questionType)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{questionType.icon || '📝'}</div>
                    <h3 className={`font-fredoka font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {questionType.name}
                    </h3>
                    <p className={`font-fredoka text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {questionType.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* A-Level Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className={`text-2xl font-fredoka font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              A-Level Section
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questionTypes.filter(q => q.category === 'A-Level').map((questionType, index) => (
                <motion.div
                  key={questionType.id}
                  className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => onStartQuestion(questionType)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{questionType.icon || '📚'}</div>
                    <h3 className={`font-fredoka font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {questionType.name}
                    </h3>
                    <p className={`font-fredoka text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {questionType.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
