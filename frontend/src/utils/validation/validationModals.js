import React from 'react';
import { motion } from 'framer-motion';
import { ERROR_MESSAGES } from '../../constants/errorMessages';

/**
 * Validation Error Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {string} props.errorType - Type of validation error
 * @param {Object} props.details - Additional error details
 * @returns {JSX.Element} - Modal component
 */
export const ValidationErrorModal = ({ isOpen, onClose, errorType, details = {} }) => {
  if (!isOpen) return null;

  const errorInfo = ERROR_MESSAGES.VALIDATION[errorType] || ERROR_MESSAGES.VALIDATION.VALIDATION_ERROR;

  const getModalContent = () => {
    switch (errorType) {
      case 'word_limit_exceeded':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            <div className="bg-red-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-red-700">
                <strong>Current:</strong> {details.current} words<br />
                <strong>Limit:</strong> {details.limit} words<br />
                <strong>Excess:</strong> {details.current - details.limit} words
              </p>
            </div>
            <p className="text-sm text-gray-500">{errorInfo.details}</p>
          </div>
        );

      case 'profanity_detected':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🚫</span>
            </div>
            <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            {details.foundWords && details.foundWords.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-orange-700">
                  <strong>Detected words:</strong> {details.foundWords.join(', ')}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">{errorInfo.details}</p>
          </div>
        );

      case 'spam_detected':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            {details.reasons && details.reasons.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-yellow-700">
                  <strong>Issues found:</strong>
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  {details.reasons.map((reason, index) => (
                    <li key={index}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-500">{errorInfo.details}</p>
          </div>
        );

      case 'too_brief':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📏</span>
            </div>
            <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-blue-700">
                <strong>Current:</strong> {details.current} words<br />
                <strong>Recommended:</strong> {details.recommended} words minimum
              </p>
            </div>
            <p className="text-sm text-gray-500">{errorInfo.details}</p>
          </div>
        );

      case 'word_count_too_low':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-purple-700">
                <strong>Current:</strong> {details.current} words<br />
                <strong>Minimum:</strong> {details.minimum} words
              </p>
            </div>
            <p className="text-sm text-gray-500">{errorInfo.details}</p>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">{errorInfo.message}</p>
            <p className="text-sm text-gray-500">{errorInfo.details}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
      >
        {getModalContent()}
        
        <motion.button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-fredoka font-bold py-3 px-6 rounded-2xl hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ValidationErrorModal;
