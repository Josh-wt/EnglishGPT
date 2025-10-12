import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../../../utils/backendUrl';
import UserDetailModal from '../Users/UserDetailModal';
import EvaluationDetailModal from '../Evaluations/EvaluationDetailModal';

const AdminSearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], evaluations: [], feedback: [] });
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchSuggestions = [
    { type: 'user', text: 'Search by user ID', example: '02cbd2bd-f360-4606-b183-a99d72d296fa' },
    { type: 'evaluation', text: 'Search by evaluation ID', example: 'iJ0gp' },
    { type: 'question', text: 'Search by question type', example: 'igcse_narrative' },
    { type: 'grade', text: 'Search by grade', example: '85%' },
    { type: 'feedback', text: 'Search feedback', example: 'bug report' }
  ];

  const getAdminHeaders = () => {
    const sessionToken = localStorage.getItem('admin_session_token');
    return {
      'X-Admin-Session': sessionToken,
      'Content-Type': 'application/json',
    };
  };

  const search = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], evaluations: [], feedback: [] });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/admin/search?q=${encodeURIComponent(searchQuery)}&limit=10`, {
        headers: getAdminHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  const handleEvaluationClick = (evaluationId) => {
    setSelectedEvaluationId(evaluationId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatGrade = (grade) => {
    if (typeof grade === 'number') {
      return `${grade.toFixed(1)}%`;
    }
    return grade || 'N/A';
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <MagnifyingGlassIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Global Search
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search across users, evaluations, and feedback with enhanced ID matching and instant results
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center">
                <div className="pl-6 pr-4">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
                <input 
                  className="flex-1 py-6 pr-6 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-xl focus:outline-none" 
                  placeholder="Search users, evaluations, feedback, IDs..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {loading && (
                  <div className="pr-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && !query && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Search Examples</h3>
                  <div className="space-y-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => {
                          setQuery(suggestion.example);
                          setShowSuggestions(false);
                        }}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {suggestion.text}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {suggestion.example}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!query && (
          <div className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start Searching
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Enter a search term to find users, evaluations, and feedback across the platform
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Users</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Search by name, email, or ID</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Evaluations</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Search by ID, type, or grade</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Feedback</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Search by comments or category</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Results Summary */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-2xl px-8 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {results.users.length} Users
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {results.evaluations.length} Evaluations
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {results.feedback.length} Feedback
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Users */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Users</h2>
                    <p className="text-blue-100 text-sm">{results.users.length} found</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {results.users.map((user, index) => (
                    <div 
                      key={user.uid} 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                      onClick={() => handleUserClick(user.uid)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {(user.display_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {user.display_name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                            {user.uid}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {user.current_plan || 'free'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user.credits || 0} credits
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.users.length === 0 && (
                    <div className="text-center py-12">
                      <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluations */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Evaluations</h2>
                    <p className="text-green-100 text-sm">{results.evaluations.length} found</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {results.evaluations.map((evaluation, index) => (
                    <div 
                      key={evaluation.id} 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                      onClick={() => handleEvaluationClick(evaluation.id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {(evaluation.question_type || 'E').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {evaluation.question_type || 'Unknown Type'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {evaluation.user?.display_name || evaluation.user_id}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            {evaluation.short_id || evaluation.id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {formatGrade(evaluation.grade)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{formatDate(evaluation.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.evaluations.length === 0 && (
                    <div className="text-center py-12">
                      <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No evaluations found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Feedback</h2>
                    <p className="text-purple-100 text-sm">{results.feedback.length} found</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {results.feedback.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {(item.category || 'F').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.user?.display_name || item.user_id}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.category || 'General'}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-2">
                            {item.comments || 'No comments'}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                            Eval ID: {item.evaluation_id}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full mb-2">
                            {item.accurate ? (
                              <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            ) : (
                              <XCircleIcon className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.accurate ? 'Accurate' : 'Inaccurate'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.feedback.length === 0 && (
                    <div className="text-center py-12">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No feedback found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        <UserDetailModal 
          userId={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />

        {/* Evaluation Detail Modal */}
        <EvaluationDetailModal 
          evaluationId={selectedEvaluationId}
          open={!!selectedEvaluationId}
          onClose={() => setSelectedEvaluationId(null)}
        />
      </div>
    </div>
    </>
  );
};

export default AdminSearchPage;

