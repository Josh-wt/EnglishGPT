import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthRequired = ({ children, user, userLoading, userStats, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const loadingStartTime = useRef(null);

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
      }
    } else {
      if (loadingStartTime.current) {
        const loadingDuration = Date.now() - loadingStartTime.current;
        console.log('✅ AuthRequired: Loading completed in', loadingDuration, 'ms');
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
        }
      }
    };

    const interval = setInterval(checkPerformance, 1000);
    return () => clearInterval(interval);
  }, [location.pathname, userLoading, user]);

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
