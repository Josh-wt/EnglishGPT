import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ArrowLeftIcon, 
  HomeIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PlayIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import documentationService from '../../services/documentationService';

// Documentation pages configuration
const docPages = {
    'getting-started': {
      title: 'Getting Started',
      icon: <BookOpenIcon className="w-5 h-5" />,
      description: 'Learn the basics and create your first essay'
    },
    'question-types': {
      title: 'Question Types',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      description: 'Understand all supported question types'
    },
    'analytics-guide': {
      title: 'Analytics Guide',
      icon: <ChartBarIcon className="w-5 h-5" />,
      description: 'Master your analytics dashboard'
    },
    'pricing-plans': {
      title: 'Pricing Plans',
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      description: 'Choose the right plan for your needs'
    },
    'tutorials': {
      title: 'Tutorial Videos',
      icon: <PlayIcon className="w-5 h-5" />,
      description: 'Step-by-step video guides'
    },
    'community': {
      title: 'Community & Support',
      icon: <UsersIcon className="w-5 h-5" />,
      description: 'Connect with other learners'
    },
    'support': {
      title: 'Support Center',
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
      description: 'Get help when you need it'
    }
  };

const DocumentationPage = ({ darkMode }) => {
  const { page } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load documentation content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Validate page parameter
        if (!page || !docPages[page]) {
          throw new Error(`Invalid documentation page: ${page}`);
        }

        // Fetch real documentation content
        const content = await documentationService.getDocumentationContent(page);
        setContent(content);
      } catch (error) {
        console.error('Error loading documentation:', error);
        setError(error.message);
        // Don't set any content - let the error state handle it
        setContent('');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [page]);


  const currentPage = docPages[page];
  const filteredPages = Object.entries(docPages).filter(([key, value]) =>
    value.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Loading Documentation
            </h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Please wait while we load the documentation content...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/docs')}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border border-gray-200 dark:border-gray-700 transition-colors`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border border-gray-200 dark:border-gray-700 transition-colors`}
            >
              <HomeIcon className="w-5 h-5" />
            </button>
          </div>
          
          {currentPage && (
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                {currentPage.icon}
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentPage.title}
                </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentPage.description}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={`sticky top-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border border-gray-200 dark:border-gray-700 p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Documentation
              </h3>
              
              {/* Search */}
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {filteredPages.map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => navigate(`/docs/${key}`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      page === key
                        ? darkMode 
                          ? 'bg-blue-900 text-blue-100' 
                          : 'bg-blue-100 text-blue-900'
                        : darkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {value.icon}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{value.title}</div>
                      <div className={`text-sm truncate ${
                        page === key
                          ? darkMode ? 'text-blue-200' : 'text-blue-700'
                          : darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {value.description}
                      </div>
                    </div>
                    {page === key && (
                      <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border border-gray-200 dark:border-gray-700 p-8`}>
              {/* Error Display */}
              {error && (
                <div className="p-8 text-center">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Documentation Not Available
                  </h2>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    {error}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => navigate('/docs')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      Back to Documentation
                    </button>
                  </div>
                </div>
              )}
              
              {/* Documentation Content */}
              {!error && content && (
                <div 
                  className={`prose prose-lg max-w-none ${
                    darkMode 
                      ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300 prose-a:text-blue-400 prose-a:hover:text-blue-300' 
                      : 'prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-a:text-blue-600 prose-a:hover:text-blue-800'
                  }`}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
