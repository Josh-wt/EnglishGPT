import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '../../constants/uiConstants';

const EarlyAccessModal = ({ isOpen, onClose, userName = '', onDeclineUnlimited }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDeclining, setIsDeclining] = useState(false);

  const steps = [
    {
      emoji: '🎉',
      title: 'Welcome to Early Access!',
      subtitle: `Hi ${userName}! You're in for a treat.`,
      message: 'You\'ve joined English GPT during our exclusive early access period.',
      buttonText: 'Tell me more!',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      emoji: '🚀',
      title: 'Unlimited Access Unlocked!',
      subtitle: 'No limits, no restrictions',
      message: 'As an early access member, you get unlimited essay marking, analytics, and all premium features - completely free!',
      buttonText: 'Amazing! What else?',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      emoji: '💎',
      title: 'You\'re VIP Forever!',
      subtitle: 'Early access perks',
      message: 'Your early access unlimited plan will never expire. Consider it our thank you for believing in us early!',
      buttonText: 'Let\'s get started!',
      gradient: 'from-green-600 to-blue-600'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - close modal
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200/60 w-full max-w-lg"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${currentStepData.gradient} p-8 text-center text-white relative overflow-hidden`}>
              {/* Floating particles background */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    initial={{ x: Math.random() * 400, y: Math.random() * 200 }}
                    animate={{
                      x: Math.random() * 400,
                      y: Math.random() * 200,
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Logo */}
              <motion.img
                src={LOGO_URL}
                alt="English GPT"
                className="w-16 h-16 mx-auto mb-4 relative z-10"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              />

              {/* Emoji */}
              <motion.div
                className="text-6xl mb-4 relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                key={currentStep} // Re-animate when step changes
              >
                {currentStepData.emoji}
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-2xl font-bold mb-2 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                key={`title-${currentStep}`}
              >
                {currentStepData.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg opacity-90 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                key={`subtitle-${currentStep}`}
              >
                {currentStepData.subtitle}
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Message */}
              <motion.p
                className="text-gray-700 text-lg text-center mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                key={`message-${currentStep}`}
              >
                {currentStepData.message}
              </motion.p>

              {/* Progress indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentStep
                          ? 'bg-purple-600'
                          : index < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: index === currentStep ? 1.2 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                {/* Skip button */}
                <motion.button
                  onClick={handleSkip}
                  className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip intro
                </motion.button>

                {/* Next/Close button */}
                <motion.button
                  onClick={handleNext}
                  className={`flex-2 px-8 py-3 bg-gradient-to-r ${currentStepData.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  {currentStepData.buttonText}
                </motion.button>
              </div>

              {/* I don't want unlimited button - small and unobtrusive */}
              {onDeclineUnlimited && (
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <button
                    onClick={async () => {
                      setIsDeclining(true);
                      try {
                        await onDeclineUnlimited();
                        onClose();
                      } catch (error) {
                        console.error('Error declining unlimited:', error);
                      } finally {
                        setIsDeclining(false);
                      }
                    }}
                    disabled={isDeclining}
                    className={`text-xs underline transition-colors duration-200 ${
                      isDeclining 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isDeclining ? 'Switching...' : 'Switch to free plan instead'}
                  </button>
                </motion.div>
              )}

              {/* Fun fact */}
              {currentStep === 1 && (
                <motion.div
                  className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💡</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Fun Fact</p>
                      <p className="text-sm text-yellow-700">
                        Our AI has analyzed over 10,000+ essays and helps students improve their grades by an average of 15%!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Confetti effect on final step */}
              {currentStep === 2 && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ 
                        x: Math.random() * 400, 
                        y: -10,
                        scale: 0
                      }}
                      animate={{
                        y: 600,
                        scale: [0, 1, 0],
                        rotate: 360
                      }}
                      transition={{
                        duration: 2 + Math.random() * 1,
                        delay: Math.random() * 0.5,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EarlyAccessModal;
