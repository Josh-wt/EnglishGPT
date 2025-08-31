import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner component with various styles
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg, xl)
 * @param {string} props.color - Spinner color
 * @param {string} props.className - Additional CSS classes
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'purple',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  const classes = [
    'animate-spin rounded-full border-2 border-gray-300 border-t-current',
    sizeClasses[size],
    colorClasses[color],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} />
  );
};

/**
 * Loading Page component for full-page loading states
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @param {string} props.subtitle - Loading subtitle
 * @param {string} props.className - Additional CSS classes
 */
export const LoadingPage = ({
  message = 'Loading...',
  subtitle = 'Please wait while we prepare your content',
  className = '',
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingSpinner size="xl" color="purple" className="mx-auto mb-6" />
        <h2 className="text-2xl font-fredoka font-bold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-600">
          {subtitle}
        </p>
      </motion.div>
    </div>
  );
};

/**
 * Loading Overlay component for overlay loading states
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @param {boolean} props.isVisible - Whether overlay is visible
 * @param {string} props.className - Additional CSS classes
 */
export const LoadingOverlay = ({
  message = 'Loading...',
  isVisible = false,
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
      >
        <LoadingSpinner size="lg" color="purple" className="mx-auto mb-4" />
        <p className="text-gray-700 font-fredoka font-semibold">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

/**
 * Skeleton Loading component for content placeholders
 * @param {Object} props - Component props
 * @param {string} props.variant - Skeleton variant (text, card, avatar, button)
 * @param {string} props.className - Additional CSS classes
 */
export const Skeleton = ({
  variant = 'text',
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    subtitle: 'h-4 w-1/2',
    card: 'h-32 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes} />;
};

/**
 * Skeleton Card component for card placeholders
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of text lines
 * @param {string} props.className - Additional CSS classes
 */
export const SkeletonCard = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <Skeleton variant="title" className="mb-4" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} variant="text" className="mb-2" />
      ))}
    </div>
  );
};

export default LoadingSpinner;
