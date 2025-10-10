import React, { useState, useEffect } from 'react';
import { Shield, Key, AlertCircle } from 'lucide-react';
import AdminAuthModal from './AdminAuthModal';
import { getApiUrl } from '../../utils/backendUrl';

const AdminGuard = ({ user, children, darkMode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  console.log('🔐 AdminGuard render - user:', user, 'darkMode:', darkMode);
  console.log('🔐 AdminGuard state - loading:', loading, 'isAdminAuthenticated:', isAdminAuthenticated, 'showAuthModal:', showAuthModal, 'sessionExpired:', sessionExpired);

  // Check admin session on component mount
  useEffect(() => {
    console.log('🔐 AdminGuard useEffect triggered');
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    console.log('🔐 checkAdminSession called');
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const sessionExpires = localStorage.getItem('admin_session_expires');
      
      console.log('🔐 Session token:', sessionToken);
      console.log('🔐 Session expires:', sessionExpires);

      if (!sessionToken || !sessionExpires) {
        console.log('🔐 No session found, setting loading to false');
        setLoading(false);
        return;
      }

      // Check if session is expired
      if (new Date() > new Date(sessionExpires)) {
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_session_expires');
        setSessionExpired(true);
        setLoading(false);
        return;
      }

      // Verify session with backend
      const apiUrl = `${getApiUrl()}/admin/status`;
      console.log('🔐 Admin status API URL:', apiUrl);
      console.log('🔐 Session token:', sessionToken);
      
      const response = await fetch(apiUrl, {
        headers: {
          'X-Admin-Session': sessionToken,
        },
      });

      console.log('🔐 Status response:', response.status);
      const data = await response.json();
      console.log('🔐 Status data:', data);
      
      if (data.authenticated) {
        setIsAdminAuthenticated(true);
      } else {
        // Session invalid, clear it
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_session_expires');
        setSessionExpired(true);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      setSessionExpired(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (sessionToken) => {
    console.log('🔐 handleAuthSuccess called with token:', sessionToken);
    setIsAdminAuthenticated(true);
    setSessionExpired(false);
  };

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        await fetch(`${getApiUrl()}/admin/logout`, {
          method: 'POST',
          headers: {
            'X-Admin-Session': sessionToken,
          },
        });
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_session_expires');
      setIsAdminAuthenticated(false);
      setSessionExpired(false);
    }
  };

  console.log('🔐 AdminGuard render state - loading:', loading, 'isAdminAuthenticated:', isAdminAuthenticated, 'showAuthModal:', showAuthModal);

  if (loading) {
    console.log('🔐 Rendering loading state');
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Checking admin access...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    console.log('🔐 Rendering admin access required state');
    return (
      <>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-gray-500 mb-6">
              This section requires administrative privileges. Please authenticate with your admin key.
            </p>
            
            {sessionExpired && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-700 text-sm">Your admin session has expired</span>
              </div>
            )}
            
            <button
              onClick={(e) => {
                console.log('🔐 Admin key button clicked!');
                console.log('🔐 Event:', e);
                console.log('🔐 Current showAuthModal state:', showAuthModal);
                console.log('🔐 Setting showAuthModal to true');
                setShowAuthModal(true);
                console.log('🔐 showAuthModal should now be true');
                // Force a re-render to see if state changes
                setTimeout(() => {
                  console.log('🔐 After timeout - showAuthModal state should be true');
                }, 100);
              }}
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Key className="w-5 h-5" />
              <span>Enter Admin Key</span>
            </button>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Security:</strong> Admin access is protected by a secure key system. 
              Only authorized administrators with the correct key can access this section.
            </p>
          </div>
        </div>
        
        <AdminAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            console.log('🔐 AdminAuthModal onClose called');
            setShowAuthModal(false);
          }}
          onSuccess={handleAuthSuccess}
          darkMode={darkMode}
        />
      </>
    );
  }

  console.log('🔐 Rendering authenticated admin state');
  return (
    <>
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-green-700 text-sm font-medium">Admin Access Granted</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Logout
        </button>
      </div>
      {children}
      
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('🔐 AdminAuthModal onClose called');
          setShowAuthModal(false);
        }}
        onSuccess={handleAuthSuccess}
        darkMode={darkMode}
      />
    </>
  );
};

export default AdminGuard;

