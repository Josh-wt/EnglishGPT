import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthRequired = ({ children, user, userLoading, userStats, darkMode }) => {
  const navigate = useNavigate();

  if (userLoading) {
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
            Doing the magic, please wait
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
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      {children}
    </div>
  );
};

export default AuthRequired;
