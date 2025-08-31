import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Toast component for notifications
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether toast is visible
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {string} props.title - Toast title
 * @param {string} props.message - Toast message
 * @param {Function} props.onClose - Function to close toast
 * @param {number} props.duration - Auto-close duration in milliseconds
 * @param {string} props.className - Additional CSS classes
 */
export const Toast = ({
  isVisible,
  type = 'info',
  title,
  message,
  onClose,
  duration = 5000,
  className = '',
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeConfig = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${className}`}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        >
          <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl shadow-lg p-4`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className={`text-lg ${config.iconColor}`}>
                  {config.icon}
                </span>
              </div>
              
              <div className="ml-3 flex-1">
                {title && (
                  <h3 className={`text-sm font-fredoka font-semibold ${config.textColor} mb-1`}>
                    {title}
                  </h3>
                )}
                
                {message && (
                  <p className={`text-sm ${config.textColor}`}>
                    {message}
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <motion.button
                  onClick={onClose}
                  className={`${config.textColor} hover:opacity-70 transition-opacity duration-200`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Toast Container for managing multiple toasts
 * @param {Object} props - Component props
 * @param {Array} props.toasts - Array of toast objects
 * @param {Function} props.removeToast - Function to remove a toast
 * @param {string} props.className - Additional CSS classes
 */
export const ToastContainer = ({
  toasts = [],
  removeToast,
  className = '',
}) => {
  return (
    <div className={`fixed top-4 right-4 z-50 space-y-4 ${className}`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          >
            <Toast
              isVisible={true}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Toast Hook for managing toast state
 * @returns {Object} - Toast state and functions
 */
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = React.useCallback((message, title = 'Success') => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = React.useCallback((message, title = 'Error') => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const showWarning = React.useCallback((message, title = 'Warning') => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = React.useCallback((message, title = 'Info') => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default Toast;
