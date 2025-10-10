import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, KeyIcon, CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { KeyIcon as KeyIconSolid, RocketLaunchIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { licenseService } from '../../services';

const LicenseKeyModal = ({ isOpen, onClose, onSuccess, user, darkMode }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'validating', 'success', 'error'
  const [error, setError] = useState('');
  const [licenseInfo, setLicenseInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    if (!user?.id) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError('');
    setStep('validating');

    try {
      // First validate the license key
      const validationResponse = await licenseService.validateLicenseKey(licenseKey.trim(), user.id);

      if (!validationResponse.valid) {
        setError(validationResponse.error || 'Invalid license key');
        setStep('error');
        return;
      }

      setLicenseInfo(validationResponse);

      // If valid, activate the license
      const activationResponse = await licenseService.activateLicenseKey(
        licenseKey.trim(), 
        user.id, 
        licenseService.generateDeviceInfo()
      );

      if (activationResponse.success) {
        setStep('success');
        toast.success('License activated successfully!');
        
        // Refresh user data to get updated plan/credits
        if (onSuccess) {
          onSuccess(activationResponse);
        }
      } else {
        setError(activationResponse.error || 'Failed to activate license');
        setStep('error');
      }

    } catch (error) {
      console.error('License activation error:', error);
      setError(error.response?.data?.detail || 'Failed to activate license key');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLicenseKey('');
    setError('');
    setStep('input');
    setLicenseInfo(null);
    onClose();
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
      'trial': 'text-blue-600 bg-blue-100',
      'basic': 'text-green-600 bg-green-100',
      'premium': 'text-purple-600 bg-purple-100',
      'enterprise': 'text-orange-600 bg-orange-100',
      'lifetime': 'text-yellow-600 bg-yellow-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
                  <KeyIconSolid className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Activate License
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter your license key to unlock premium features
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
              >
                <XMarkIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'input' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-4`}>
                    <KeyIcon className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Enter Your License Key
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your license key should look like: EGPT-XXXX-XXXX-XXXX-XXXX
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      License Key
                    </label>
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                      placeholder="EGPT-XXXX-XXXX-XXXX-XXXX"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      maxLength={25}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !licenseKey.trim()}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                        loading || !licenseKey.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {loading ? 'Activating...' : 'Activate License'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'validating' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-4`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <SparklesIcon className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </motion.div>
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Validating License Key
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Please wait while we verify your license...
                </p>
              </motion.div>
            )}

            {step === 'success' && licenseInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} mb-4`}>
                  <CheckCircleIcon className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    License Activated Successfully!
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Your license has been activated and you now have access to premium features.
                  </p>
                </div>

                {/* License Info Card */}
                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      License Type
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLicenseTypeColor(licenseInfo.license_type)}`}>
                      {formatLicenseType(licenseInfo.license_type)}
                    </span>
                  </div>
                  
                  {licenseInfo.expires_at && (
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expires
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(licenseInfo.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {licenseInfo.max_evaluations && (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Max Evaluations
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {licenseInfo.max_evaluations.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Your account has been upgraded</span>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <RocketLaunchIcon className="w-5 h-5 inline mr-2" />
                  Start Using Premium Features
                </button>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-red-900' : 'bg-red-100'} mb-4`}>
                  <ExclamationTriangleIcon className={`w-8 h-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Activation Failed
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {error || 'There was an error activating your license key.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setStep('input');
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LicenseKeyModal;
