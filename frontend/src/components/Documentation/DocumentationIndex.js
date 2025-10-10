import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PlayIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const DocumentationIndex = ({ darkMode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Documentation pages configuration
  const docPages = {
    'getting-started': {
      title: 'Getting Started',
      icon: <BookOpenIcon className="w-8 h-8" />,
      description: 'Learn the basics and create your first essay',
      category: 'Getting Started',
      color: 'from-blue-500 to-cyan-500',
      features: ['Platform overview', 'Account setup', 'First essay guide', 'Understanding results']
    },
    'question-types': {
      title: 'Question Types',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      description: 'Understand all supported question types',
      category: 'Learning',
      color: 'from-green-500 to-emerald-500',
      features: ['IGCSE question types', 'A-Level formats', 'General Paper', 'Writing strategies']
    },
    'analytics-guide': {
      title: 'Analytics Guide',
      icon: <ChartBarIcon className="w-8 h-8" />,
      description: 'Master your analytics dashboard',
      category: 'Learning',
      color: 'from-purple-500 to-violet-500',
      features: ['Performance tracking', 'AI recommendations', 'Progress visualization', 'Goal setting']
    },
    'pricing-plans': {
      title: 'Pricing Plans',
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      description: 'Choose the right plan for your needs',
      category: 'Account',
      color: 'from-yellow-500 to-orange-500',
      features: ['Free vs Unlimited', 'Feature comparison', 'Payment info', 'Upgrade process']
    },
    'tutorials': {
      title: 'Tutorial Videos',
      icon: <PlayIcon className="w-8 h-8" />,
      description: 'Step-by-step video guides',
      category: 'Learning',
      color: 'from-red-500 to-pink-500',
      features: ['Video tutorials', 'Question type guides', 'Writing skills', 'Exam preparation']
    },
    'community': {
      title: 'Community & Support',
      icon: <UsersIcon className="w-8 h-8" />,
      description: 'Connect with other learners',
      category: 'Community',
      color: 'from-indigo-500 to-blue-500',
      features: ['Discord community', 'Study groups', 'Peer review', 'Teacher resources']
    },
    'support': {
      title: 'Support Center',
      icon: <QuestionMarkCircleIcon className="w-8 h-8" />,
      description: 'Get help when you need it',
      category: 'Support',
      color: 'from-gray-500 to-slate-500',
      features: ['Contact support', 'FAQ', 'Troubleshooting', 'Common issues']
    }
  };

  const categories = {
    'Getting Started': {
      color: 'from-blue-500 to-cyan-500',
      description: 'Essential guides for new users'
    },
    'Learning': {
      color: 'from-green-500 to-emerald-500',
      description: 'Educational resources and guides'
    },
    'Account': {
      color: 'from-yellow-500 to-orange-500',
      description: 'Account management and billing'
    },
    'Community': {
      color: 'from-indigo-500 to-blue-500',
      description: 'Connect with other learners'
    },
    'Support': {
      color: 'from-gray-500 to-slate-500',
      description: 'Get help and support'
    }
  };

  const filteredPages = Object.entries(docPages).filter(([key, value]) =>
    value.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedPages = filteredPages.reduce((acc, [key, value]) => {
    if (!acc[value.category]) {
      acc[value.category] = [];
    }
    acc[value.category].push([key, value]);
    return acc;
  }, {});

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Documentation
            </h1>
          </div>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Comprehensive guides and resources to help you master EnglishGPT and improve your English writing skills
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </motion.div>

        {/* Quick Start Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl border border-gray-200 dark:border-gray-700 p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <RocketLaunchIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Start
              </h2>
            </div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              New to EnglishGPT? Start here to get up and running quickly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/docs/getting-started')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
              >
                <BookOpenIcon className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Getting Started</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Learn the basics</div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/write')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors group"
              >
                <AcademicCapIcon className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Start Writing</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Create your first essay</div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-green-500 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
              >
                <SparklesIcon className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Upgrade</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Get unlimited access</div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-purple-500 ml-auto" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Documentation Categories */}
        <div className="space-y-12">
          {Object.entries(groupedPages).map(([category, pages], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + categoryIndex * 0.1 }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-1 h-8 bg-gradient-to-b ${categories[category].color} rounded-full`}></div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category}
                  </h2>
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {categories[category].description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(([key, value]) => (
                  <motion.button
                    key={key}
                    onClick={() => navigate(`/docs/${key}`)}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 bg-gradient-to-r ${value.color} rounded-lg group-hover:scale-110 transition-transform`}>
                        {value.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                          {value.title}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {value.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {value.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                      {value.features.length > 3 && (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{value.features.length - 3} more features
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Read Guide
                      </span>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl border border-gray-200 dark:border-gray-700 p-8`}>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Need More Help?
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/docs/support')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => window.open('https://discord.gg/xRqB4BWCcJ', '_blank')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Join Discord
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentationIndex;
