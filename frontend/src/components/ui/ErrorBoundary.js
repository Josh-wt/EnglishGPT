import React from 'react';
import { motion } from 'framer-motion';

/**
 * Error Boundary component for catching React errors
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

/**
 * Error Fallback component
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that occurred
 * @param {Object} props.errorInfo - Additional error information
 */
export const ErrorFallback = ({ error, errorInfo }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h1 className="text-2xl font-fredoka font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono text-gray-800 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.toString()}
              </div>
              {errorInfo && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleReload}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-fredoka font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Refresh Page
          </motion.button>
          
          <motion.button
            onClick={handleGoHome}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-fredoka font-semibold rounded-xl hover:bg-gray-300 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Error Alert component for displaying error messages
 * @param {Object} props - Component props
 * @param {string} props.message - Error message
 * @param {string} props.details - Additional error details
 * @param {Function} props.onRetry - Function to retry the action
 * @param {Function} props.onDismiss - Function to dismiss the error
 * @param {string} props.className - Additional CSS classes
 */
export const ErrorAlert = ({
  message = 'An error occurred',
  details,
  onRetry,
  onDismiss,
  className = '',
}) => {
  return (
    <motion.div
      className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-red-500 text-lg">⚠️</span>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-fredoka font-semibold text-red-800">
            {message}
          </h3>
          
          {details && (
            <p className="mt-1 text-sm text-red-700">
              {details}
            </p>
          )}
          
          <div className="mt-3 flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorBoundary;
