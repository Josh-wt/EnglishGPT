import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon, ChartBarIcon, ClockIcon, CreditCardIcon, CheckIcon, GiftIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

const WelcomeModal = ({ isOpen, onClose, onGetStarted }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <CreditCardIcon className="w-8 h-8 text-blue-500" />,
      title: '3 Free Credits',
      description: 'Start with 3 essay evaluations to test our AI-powered marking system'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8 text-purple-500" />,
      title: 'Analytics Dashboard',
      description: 'Track your progress with detailed analytics and performance insights'
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-green-500" />,
      title: 'Essay History',
      description: 'Access all your past evaluations and track improvement over time'
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-yellow-500" />,
      title: 'AI Feedback',
      description: 'Get detailed feedback on structure, grammar, and content quality'
    }
  ];

  const handleDiscordClick = () => {
    window.open('https://discord.gg/xRqB4BWCcJ', '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 rounded-t-3xl text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
              >
                <SparklesIcon className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold mb-2">Welcome to EnglishGPT!</h1>
              <p className="text-white/90 text-lg">
                Your AI-powered essay marking companion
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Discord Offer - Main Feature */}
            <motion.div 
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-center mb-3">
                <GiftIcon className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Get Unlimited Access FREE!
              </h2>
              <p className="text-green-700 mb-4 text-lg">
                Join our Discord community and get <strong>lifetime unlimited access</strong> to all features!
              </p>
              <button
                onClick={handleDiscordClick}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center mx-auto gap-3"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                Join Discord Now
                <RocketLaunchIcon className="w-6 h-6" />
              </button>
              <p className="text-green-600 text-sm mt-3">
                Limited time offer - Join now to claim your free unlimited plan!
              </p>
            </motion.div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
                How EnglishGPT Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{feature.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Credit System Explanation */}
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5" />
                Credit System
              </h3>
              <div className="space-y-2 text-blue-800">
                <p>• <strong>3 Free Credits:</strong> Start with 3 essay evaluations</p>
                <p>• <strong>1 Credit = 1 Essay:</strong> Each evaluation uses one credit</p>
                <p>• <strong>Unlimited Plan:</strong> Get unlimited credits for $4.99 (one-time payment)</p>
                <p>• <strong>Or Join Discord:</strong> Get unlimited access completely free!</p>
              </div>
            </motion.div>

            {/* Features Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-600" />
                What You Can Do
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Write essays for IGCSE, A-Level, and General Paper</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Get instant AI feedback and grading</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Track progress with detailed analytics</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Access your complete essay history</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Compare essays and see improvement</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Export results and feedback</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDiscordClick}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Join Discord (Free Unlimited)
              </button>
              <button
                onClick={onGetStarted}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Start Writing Essays
              </button>
            </div>
            <p className="text-center text-gray-500 text-sm mt-3">
              Questions? Join our Discord community for support and updates!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
