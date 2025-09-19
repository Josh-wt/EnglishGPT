import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiUrl } from '../../utils/backendUrl';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminResultsPage = ({ darkMode }) => {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);
  const [fullChat, setFullChat] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('prompt');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getApiUrl()}/evaluations/${shortId}/admin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvaluation(data.evaluation);
        setFullChat(data.full_chat);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shortId) {
      fetchAdminData();
    }
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Evaluation Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/results/${shortId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin View - {evaluation.question_type || 'Essay Evaluation'}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ID: {evaluation.short_id || evaluation.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(evaluation.timestamp || evaluation.created_at).toLocaleDateString()}
              </span>
              <a 
                href={`/results/${evaluation.short_id || evaluation.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Public Results
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'prompt', label: 'Full Prompt' },
              { id: 'response', label: 'AI Response' },
              { id: 'evaluation', label: 'Evaluation Data' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'prompt' && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Full AI Prompt (with injection)
                </h3>
                <button
                  onClick={() => copyToClipboard(fullChat?.prompt || '')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <div className="p-6">
                <pre className={`whitespace-pre-wrap text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-800'} bg-gray-100 p-4 rounded-lg overflow-auto max-h-96`}>
                  {fullChat?.prompt || 'No prompt data available'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'response' && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Raw AI Response (unformatted)
                </h3>
                <button
                  onClick={() => copyToClipboard(fullChat?.response || '')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <div className="p-6">
                <pre className={`whitespace-pre-wrap text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-800'} bg-gray-100 p-4 rounded-lg overflow-auto max-h-96`}>
                  {fullChat?.response || 'No response data available'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Evaluation Data
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Basic Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Question Type:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.question_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Grade:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>User ID:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Timestamp:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(evaluation.timestamp || evaluation.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Marks</h4>
                    <div className="space-y-2">
                      {evaluation.reading_marks && (
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reading:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.reading_marks}</span>
                        </div>
                      )}
                      {evaluation.writing_marks && (
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Writing:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.writing_marks}</span>
                        </div>
                      )}
                      {evaluation.ao1_marks && (
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AO1:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.ao1_marks}</span>
                        </div>
                      )}
                      {evaluation.ao2_marks && (
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AO2:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.ao2_marks}</span>
                        </div>
                      )}
                      {evaluation.ao3_marks && (
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AO3:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{evaluation.ao3_marks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Student Response</h4>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {evaluation.student_response}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Parsed Feedback</h4>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {evaluation.feedback}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminResultsPage;
