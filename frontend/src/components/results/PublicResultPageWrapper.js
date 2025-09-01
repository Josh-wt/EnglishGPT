import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
        // Try different endpoint patterns
        let response;
        try {
          response = await api.get(`/evaluate/${id}`);
          console.log('🔍 DEBUG: Success with /evaluate endpoint:', response.data);
        } catch (err1) {
          console.log('🔍 DEBUG: /evaluate failed, trying /evaluations:', err1);
          try {
            response = await api.get(`/evaluations/${id}`);
            console.log('🔍 DEBUG: Success with /evaluations endpoint:', response.data);
          } catch (err2) {
            console.log('🔍 DEBUG: /evaluations failed, trying /history:', err2);
            try {
              response = await api.get(`/history/${id}`);
              console.log('🔍 DEBUG: Success with /history endpoint:', response.data);
            } catch (err3) {
              console.log('🔍 DEBUG: All endpoints failed:', err3);
              throw err3;
            }
          }
        }

        if (!isMounted) return;

        // Handle different response structures
        let evaluationData;
        if (response.data.evaluation) {
          evaluationData = response.data.evaluation;
        } else if (response.data.id) {
          evaluationData = response.data;
        } else {
          evaluationData = response.data;
        }

        console.log('🔍 DEBUG: Final evaluation data:', evaluationData);
        setPublicEval(evaluationData);
      } catch (error) {
        console.error('🔍 DEBUG: Failed to fetch evaluation:', error);
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
