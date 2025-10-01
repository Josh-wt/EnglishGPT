import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import {
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ErrorModal = ({ isOpen, onClose, message, darkMode }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  // Check if this is a "no credits" error
  const isNoCreditsError = message && (
    message.toLowerCase().includes('no credits') || 
    message.toLowerCase().includes('upgrade to unlimited') ||
    message.toLowerCase().includes('402')
  );

  const handleUpgradeClick = () => {
    onClose();
    navigate('/pricing');
  };

  // Features list for unlimited plan
  const unlimitedFeatures = [
    { icon: BoltIcon, text: 'Unlimited essay evaluations', color: 'text-yellow-500' },
    { icon: SparklesIcon, text: 'Advanced AI feedback with detailed analysis', color: 'text-purple-500' },
    { icon: ChartBarIcon, text: 'Advanced analytics dashboard', color: 'text-blue-500' },
    { icon: ClockIcon, text: 'Access to complete essay history', color: 'text-green-500' },
    { icon: HeartIcon, text: 'Priority email support', color: 'text-pink-500' },
    { icon: RocketLaunchIcon, text: 'Lifetime access - pay once, use forever', color: 'text-indigo-500' }
  ];

  if (isNoCreditsError) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors group"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>

            {/* Main Card */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8 md:p-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <SparklesIcon className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-fredoka"
                  >
                    Unlock Unlimited Learning
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-600 max-w-md mx-auto font-fredoka"
                  >
                    You've used all your free credits. Upgrade to unlimited and never worry about limits again!
                  </motion.p>
                </div>

                {/* Features Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center font-fredoka flex items-center justify-center gap-2">
                    <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                    What's Included
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlimitedFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`w-5 h-5 ${feature.color}`} />
                        </div>
                        <p className="text-sm text-gray-700 font-medium pt-1 font-fredoka">{feature.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Pricing Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white text-center shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Lifetime Access</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-5xl font-bold font-fredoka">$4.99</span>
                    <div className="text-left">
                      <div className="text-2xl line-through opacity-60">$142</div>
                      <div className="text-xs font-medium">96% OFF</div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">One-time payment • No subscriptions • Forever yours</p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex flex-col gap-3"
                >
                  <button
                    onClick={handleUpgradeClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl font-fredoka text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <RocketLaunchIcon className="w-6 h-6" />
                    Upgrade to Unlimited Now
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-white/50 hover:bg-white/80 text-gray-700 font-semibold py-3 px-8 rounded-xl font-fredoka border border-gray-200 transition-all duration-200"
                  >
                    Maybe Later
                  </button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600"
                >
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="font-fredoka">Secure payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="font-fredoka">Instant access</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Regular error modal for other errors
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-fredoka">Error</h3>
            <p className="text-gray-600 mb-6 font-fredoka">{message}</p>
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors font-fredoka w-full"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ErrorModal;
