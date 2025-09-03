import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthRequired = ({ children, user, userLoading, userStats, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const loadingStartTime = useRef(null);
  const apiCallTracker = useRef(new Map());

  // Track component renders and performance
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    console.log('🔍 AuthRequired Debug:', {
      renderCount: renderCount.current,
      timeSinceLastRender: `${timeSinceLastRender}ms`,
      currentPath: location.pathname,
      userLoading,
      hasUser: !!user,
      hasUserStats: !!userStats,
      userData: {
        id: user?.id,
        email: user?.email,
        uid: user?.uid
      },
      userStatsData: userStats ? {
        currentPlan: userStats.currentPlan,
        credits: userStats.credits,
        questionsMarked: userStats.questionsMarked
      } : null,
      timestamp: new Date().toISOString()
    });

    lastRenderTime.current = currentTime;
  });

  // Track loading state changes
  useEffect(() => {
    if (userLoading) {
      if (!loadingStartTime.current) {
        loadingStartTime.current = Date.now();
        console.log('⏱️ AuthRequired: Loading started at', new Date().toISOString());
        
        // Start monitoring API calls when loading begins
        startAPIMonitoring();
      }
    } else {
      if (loadingStartTime.current) {
        const loadingDuration = Date.now() - loadingStartTime.current;
        console.log('✅ AuthRequired: Loading completed in', loadingDuration, 'ms');
        
        // Stop monitoring API calls when loading completes
        stopAPIMonitoring();
        
        loadingStartTime.current = null;
      }
    }
  }, [userLoading]);

  // Track navigation events
  useEffect(() => {
    console.log('🧭 AuthRequired: Navigation detected', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  // API monitoring functions
  const startAPIMonitoring = () => {
    console.log('🔍 Starting API call monitoring...');
    
    // Monitor network requests using Performance API
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name && entry.name.includes('/api/')) {
              const requestId = Math.random().toString(36).substr(2, 9);
              const startTime = Date.now();
              
              apiCallTracker.current.set(requestId, {
                url: entry.name,
                startTime,
                status: 'pending',
                entry: entry
              });
              
              console.log(`📡 [${requestId}] API call detected:`, {
                url: entry.name,
                startTime: new Date().toISOString(),
                entryType: entry.entryType
              });
              
              // Check if this request completes
              setTimeout(() => {
                const tracked = apiCallTracker.current.get(requestId);
                if (tracked && tracked.status === 'pending') {
                  const duration = Date.now() - tracked.startTime;
                  console.warn(`⚠️ [${requestId}] API call still pending after 5s:`, {
                    url: tracked.url,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString()
                  });
                }
              }, 5000);
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'resource'] });
        
        // Store observer for cleanup
        apiCallTracker.current.observer = observer;
        
      } catch (error) {
        console.error('❌ Error setting up PerformanceObserver:', error);
      }
    }
    
    // Also monitor using fetch/XHR interception
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('/api/')) {
        const requestId = Math.random().toString(36).substr(2, 9);
        const startTime = Date.now();
        
        apiCallTracker.current.set(requestId, {
          url,
          startTime,
          status: 'pending',
          type: 'fetch'
        });
        
        console.log(`📡 [${requestId}] Fetch API call:`, {
          url,
          startTime: new Date().toISOString()
        });
        
        return originalFetch.apply(this, args)
          .then(response => {
            const tracked = apiCallTracker.current.get(requestId);
            if (tracked) {
              tracked.status = 'completed';
              tracked.duration = Date.now() - tracked.startTime;
              tracked.response = response;
              
              console.log(`✅ [${requestId}] Fetch completed in ${tracked.duration}ms:`, {
                url,
                status: response.status,
                statusText: response.statusText
              });
            }
            return response;
          })
          .catch(error => {
            const tracked = apiCallTracker.current.get(requestId);
            if (tracked) {
              tracked.status = 'failed';
              tracked.duration = Date.now() - tracked.startTime;
              tracked.error = error;
              
              console.error(`❌ [${requestId}] Fetch failed after ${tracked.duration}ms:`, {
                url,
                error: error.message
              });
            }
            throw error;
          });
      }
      return originalFetch.apply(this, args);
    };
    
    // Store original fetch for cleanup
    apiCallTracker.current.originalFetch = originalFetch;
  };
  
  const stopAPIMonitoring = () => {
    console.log('🛑 Stopping API call monitoring...');
    
    // Clean up PerformanceObserver
    if (apiCallTracker.current.observer) {
      apiCallTracker.current.observer.disconnect();
      delete apiCallTracker.current.observer;
    }
    
    // Restore original fetch
    if (apiCallTracker.current.originalFetch) {
      window.fetch = apiCallTracker.current.originalFetch;
      delete apiCallTracker.current.originalFetch;
    }
    
    // Log final API call status
    const pending = Array.from(apiCallTracker.current.entries())
      .filter(([id, info]) => info.status === 'pending');
    
    if (pending.length > 0) {
      console.warn('⚠️ API calls still pending when loading stopped:', pending);
    }
    
    // Clear tracker
    apiCallTracker.current.clear();
  };

  // Performance monitoring
  useEffect(() => {
    const checkPerformance = () => {
      const currentTime = Date.now();
      if (loadingStartTime.current) {
        const loadingDuration = currentTime - loadingStartTime.current;
        if (loadingDuration > 5000) {
          console.warn('⚠️ AuthRequired: Loading taking too long!', {
            duration: loadingDuration,
            pathname: location.pathname,
            userLoading,
            hasUser: !!user,
            timestamp: new Date().toISOString()
          });
          
          // Check for pending API calls
          const pending = Array.from(apiCallTracker.current.entries())
            .filter(([id, info]) => info.status === 'pending');
          
          if (pending.length > 0) {
            console.warn('⚠️ Pending API calls detected:', pending);
          }
        }
      }
    };

    const interval = setInterval(checkPerformance, 1000);
    return () => clearInterval(interval);
  }, [location.pathname, userLoading, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAPIMonitoring();
    };
  }, []);

  if (userLoading) {
    console.log('🔄 AuthRequired: Rendering loading state', {
      renderCount: renderCount.current,
      timestamp: new Date().toISOString()
    });

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-main'} flex items-center justify-center p-4`}>
        <div className="text-center max-w-lg">
          {/* Book Loader */}
          <div className="mb-8">
            <LoadingSpinner 
              message="" 
              size="large" 
            />
          </div>
          
          {/* Small text with spacing */}
          <div className="text-gray-600 text-lg font-fredoka mb-8">
            Load. Load.. Load... Loading
          </div>
          
          {/* Pink box modal */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg border border-pink-300 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-3">✨</div>
              <div className="text-gray-800 font-fredoka text-lg font-medium">
                Getting everything ready...
              </div>
              <div className="text-gray-600 text-sm mt-2 font-fredoka">
                Thanks for your patience!
              </div>    
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 AuthRequired: No user, redirecting to home', {
      pathname: location.pathname,
      timestamp: new Date().toISOString()
    });
    navigate('/', { replace: true });
    return null;
  }

  console.log('✅ AuthRequired: Rendering protected content', {
    renderCount: renderCount.current,
    pathname: location.pathname,
    hasUser: !!user,
    hasUserStats: !!userStats,
    timestamp: new Date().toISOString()
  });

  return (
    <div className={darkMode ? 'dark' : ''}>
      {children}
    </div>
  );
};

export default AuthRequired;
