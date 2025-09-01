import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/backendUrl';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResultsPage from '../ResultsPage/ResultsPage';
import SignInModal from '../modals/SignInModal';

const PublicResultPageWrapper = ({ darkMode, userStats, showSignInModal, setShowSignInModal }) => {
  const { id } = useParams();
  const [loadingEval, setLoadingEval] = useState(true);
  const [publicEval, setPublicEval] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchEvaluation = async () => {
      try {
        console.log('🔍 DEBUG: Fetching evaluation with ID:', id);
        console.log('🔍 DEBUG: Using API URL:', getApiUrl());
        
        // Use the correct endpoint for fetching evaluation by ID
        const response = await fetch(`${getApiUrl()}/evaluate/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('🔍 DEBUG: Response status:', response.status);
        console.log('🔍 DEBUG: Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 DEBUG: Response not ok, error text:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('🔍 DEBUG: Response data:', responseData);
        console.log('🔍 DEBUG: Response data type:', typeof responseData);
        console.log('🔍 DEBUG: Response data keys:', Object.keys(responseData || {}));

        if (!isMounted) return;

        // Handle different response structures
        let evaluationData;
        if (responseData.evaluation) {
          evaluationData = responseData.evaluation;
        } else if (responseData.id) {
          evaluationData = responseData;
        } else {
          evaluationData = responseData;
        }

        console.log('🔍 DEBUG: Final evaluation data:', evaluationData);
        setPublicEval(evaluationData);
      } catch (error) {
        console.error('🔍 DEBUG: Failed to fetch evaluation:', error);
        console.error('🔍 DEBUG: Error name:', error.name);
        console.error('🔍 DEBUG: Error message:', error.message);
        console.error('🔍 DEBUG: Error stack:', error.stack);
        
        if (isMounted) {
          setPublicEval(null);
        }
      } finally {
        if (isMounted) {
          setLoadingEval(false);
        }
      }
    };

    fetchEvaluation();
    return () => { isMounted = false; };
  }, [id]);

  const handlePublicNewEvaluation = () => {
    // Show sign-in modal for unauthenticated users
    setShowSignInModal(true);
  };

  if (loadingEval) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} flex items-center justify-center p-4`}>
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
            Loading result, please wait
          </div>
          
          {/* Pink box modal */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg border border-pink-300 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-3">✨</div>
              <div className="text-gray-800 font-fredoka text-lg font-medium">
                Loading result...
              </div>
              <div className="text-gray-600 text-sm mt-2 font-fredoka">
                Please wait while we fetch your evaluation
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!publicEval) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-2xl font-fredoka font-bold mb-2">Result not found</h1>
          <p className="text-gray-600">The evaluation you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <ResultsPage 
        evaluation={publicEval}
        onNewEvaluation={handlePublicNewEvaluation}
        userPlan={userStats?.currentPlan || 'free'}
        darkMode={darkMode}
      />
      {/* Sign-in modal for unauthenticated users */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        darkMode={darkMode}
      />
    </div>
  );
};

export default PublicResultPageWrapper;
