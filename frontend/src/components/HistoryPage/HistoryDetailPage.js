import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EvaluationDetailModal from './EvaluationDetailModal';

const HistoryDetailPage = ({ evaluations, onBack, userPlan }) => {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the evaluation by short_id
    const foundEvaluation = evaluations.find(eval => eval.short_id === shortId);
    if (foundEvaluation) {
      setEvaluation(foundEvaluation);
      setLoading(false);
    } else {
      // If not found in current evaluations, try to fetch from API
      fetchEvaluationFromAPI();
    }
  }, [shortId, evaluations]);

  const fetchEvaluationFromAPI = async () => {
    try {
      const response = await fetch(`/api/evaluations/${shortId}`);
      if (response.ok) {
        const data = await response.json();
        setEvaluation(data);
      } else {
        // Evaluation not found, redirect to history
        navigate('/history');
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const parseFeedbackToBullets = (feedback) => {
    if (!feedback) return [];
    
    // If feedback is already an array, return it as is
    if (Array.isArray(feedback)) {
      return feedback.filter(item => item && item.trim());
    }
    
    // If feedback is a string, split it by newlines
    if (typeof feedback === 'string') {
      return feedback.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '').trim());
    }
    
    // Fallback for other types
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching evaluation details</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Not Found</h2>
          <p className="text-gray-600 mb-6">The evaluation you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/history')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {evaluation.questionType || evaluation.question_type || 'Essay Evaluation'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date(evaluation.timestamp || evaluation.created_at).toLocaleDateString()}
              </span>
              {evaluation.short_id && (
                <a 
                  href={`/results/${evaluation.short_id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Full Results
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EvaluationDetailModal
          evaluation={evaluation}
          isOpen={true}
          onClose={() => navigate('/history')}
          parseFeedbackToBullets={parseFeedbackToBullets}
        />
      </div>
    </div>
  );
};

export default HistoryDetailPage;
