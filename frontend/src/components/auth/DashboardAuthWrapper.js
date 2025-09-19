import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

const DashboardAuthWrapper = ({ children, darkMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 DashboardAuthWrapper: Checking authentication...');
        
        const response = await fetch('https://everythingenglish.xyz/auth/get-session', {
          credentials: 'include'
        });

        console.log('🔐 DashboardAuthWrapper: Auth response status:', response.status);

        if (response.status === 200) {
          const data = await response.json();
          console.log('✅ DashboardAuthWrapper: Authentication successful');
          
          // Store access_token in memory (not localStorage)
          if (data.access_token) {
            setAccessToken(data.access_token);
            console.log('🔐 DashboardAuthWrapper: Access token stored in memory');
          }
          
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          console.log('🚫 DashboardAuthWrapper: Authentication failed, redirecting to login');
          
          // Redirect to login with next parameter
          window.location = 'https://everythingenglish.xyz/login?next=https://englishgpt.everythingenglish.xyz/dashboard';
          return;
        } else {
          console.error('❌ DashboardAuthWrapper: Unexpected response status:', response.status);
          // For other status codes, redirect to login as well
          window.location = 'https://everythingenglish.xyz/login?next=https://englishgpt.everythingenglish.xyz/dashboard';
          return;
        }
      } catch (error) {
        console.error('❌ DashboardAuthWrapper: Error checking authentication:', error);
        // On error, redirect to login
        window.location = 'https://everythingenglish.xyz/login?next=https://englishgpt.everythingenglish.xyz/dashboard';
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
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
            Verifying authentication...
          </div>
          
          {/* Pink box modal */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg border border-pink-300 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-3">🔐</div>
              <div className="text-gray-800 font-fredoka text-lg font-medium">
                Checking your session...
              </div>
              <div className="text-gray-600 text-sm mt-2 font-fredoka">
                Please wait while we verify your access
              </div>    
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This should not render as we redirect on auth failure
    return null;
  }

  // Pass the access token to children via context or props if needed
  return (
    <div className={darkMode ? 'dark' : ''}>
      {React.cloneElement(children, { accessToken })}
    </div>
  );
};

export default DashboardAuthWrapper;
