import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  KeyIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { KeyIcon as KeyIconSolid, StarIcon } from '@heroicons/react/24/solid';
import LicenseKeyModal from './LicenseKeyModal';
import { licenseService } from '../../services';

const LicenseAuthPage = ({ user, darkMode, onBack }) => {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [userLicense, setUserLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      checkUserLicense();
    }
  }, [user]);

  const checkUserLicense = async () => {
    try {
      const response = await licenseService.getUserLicenseStatus(user.id);
      setUserLicense(response);
    } catch (error) {
      console.error('Error checking user license:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseSuccess = (licenseData) => {
    setUserLicense({
      has_license: true,
      license_type: licenseData.license_type,
      expires_at: licenseData.expires_at,
      max_evaluations: licenseData.max_evaluations
    });
    setShowLicenseModal(false);
    
    // Redirect to dashboard after successful activation
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const formatLicenseType = (type) => {
    const types = {
      'trial': 'Trial',
      'basic': 'Basic',
      'premium': 'Premium',
      'enterprise': 'Enterprise',
      'lifetime': 'Lifetime'
    };
    return types[type] || type;
  };

  const getLicenseTypeColor = (type) => {
    const colors = {
      'trial': 'text-blue-600 bg-blue-100 border-blue-200',
      'basic': 'text-green-600 bg-green-100 border-green-200',
      'premium': 'text-purple-600 bg-purple-100 border-purple-200',
      'enterprise': 'text-orange-600 bg-orange-100 border-orange-200',
      'lifetime': 'text-yellow-600 bg-yellow-100 border-yellow-200'
    };
    return colors[type] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const features = [
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: "Unlimited Essay Marking",
      description: "Mark as many essays as you need without restrictions"
    },
    {
      icon: <ChartBarIcon className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Track your progress with detailed performance insights"
    },
    {
      icon: <AcademicCapIcon className="w-6 h-6" />,
      title: "All Question Types",
      description: "Access to IGCSE, A-Level, and university-level assessments"
    },
    {
      icon: <SparklesIcon className="w-6 h-6" />,
      title: "AI-Powered Feedback",
      description: "Get detailed, personalized feedback on your writing"
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-4`}
          >
            <SparklesIcon className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </motion.div>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Checking license status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
                <KeyIconSolid className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                License Activation
              </h1>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {userLicense?.has_license ? (
          // User already has a license
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} mb-6`}>
              <CheckCircleIcon className={`w-10 h-10 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>

            <div>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                License Already Active!
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                You already have an active license and access to all premium features.
              </p>
            </div>

            {/* License Info Card */}
            <div className={`max-w-md mx-auto p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  License Type
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLicenseTypeColor(userLicense.license_type)}`}>
                  {formatLicenseType(userLicense.license_type)}
                </span>
              </div>
              
              {userLicense.expires_at && (
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expires
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(userLicense.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {userLicense.max_evaluations && (
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Evaluations
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {userLicense.max_evaluations.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <RocketLaunchIcon className="w-5 h-5 mr-2" />
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          // User needs to activate a license
          <div className="space-y-12">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-6`}>
                <KeyIconSolid className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>

              <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Activate Your License
              </h1>
              <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Enter your license key to unlock unlimited access to EnglishGPT's premium features
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-4`}>
                    <div className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* License Key Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`max-w-md mx-auto p-8 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
            >
              <div className="text-center space-y-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-4`}>
                  <KeyIcon className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>

                <div>
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Ready to Activate?
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click below to enter your license key and start using premium features
                  </p>
                </div>

                <button
                  onClick={() => setShowLicenseModal(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <KeyIconSolid className="w-5 h-5" />
                  <span>Enter License Key</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Secure activation process</span>
                </div>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`max-w-2xl mx-auto p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
            >
              <div className="text-center space-y-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Need Help?
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  If you don't have a license key or need assistance, please contact our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors"
                  >
                    View Pricing Plans
                  </button>
                  <button
                    onClick={() => window.open('https://discord.gg/xRqB4BWCcJ', '_blank')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors"
                  >
                    Join Discord Support
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* License Key Modal */}
      <LicenseKeyModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        onSuccess={handleLicenseSuccess}
        user={user}
        darkMode={darkMode}
      />
    </div>
  );
};

export default LicenseAuthPage;
