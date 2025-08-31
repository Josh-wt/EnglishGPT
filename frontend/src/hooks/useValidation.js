import { useState, useCallback } from 'react';
import { validateEssayContent, getValidationErrorDetails } from '../utils/validation/essayValidation';

/**
 * Custom hook for essay validation
 * @returns {Object} - Validation state and functions
 */
export const useValidation = () => {
  const [validationError, setValidationError] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate essay content
   * @param {string} essay - The essay text to validate
   * @param {string} questionType - The question type
   * @returns {Object} - Validation result
   */
  const validateEssay = useCallback(async (essay, questionType) => {
    console.log('🔍 DEBUG: validateEssay called with:', { essay, questionType });
    console.log('🔍 DEBUG: Essay length:', essay?.length);
    console.log('🔍 DEBUG: Question type:', questionType);
    
    try {
      setIsValidating(true);
      setValidationError(null);
      setShowValidationModal(false);
      console.log('🔍 DEBUG: Set validation state');

      console.log('🔍 DEBUG: About to call validateEssayContent');
      const result = validateEssayContent(essay, questionType);
      console.log('🔍 DEBUG: validateEssayContent result:', result);

      if (!result.isValid) {
        console.log('🔍 DEBUG: Validation failed, setting error');
        setValidationError({
          type: result.error,
          message: result.message,
          details: result.details,
        });
        setShowValidationModal(true);
      } else {
        console.log('🔍 DEBUG: Validation passed');
      }

      return result;
    } catch (error) {
      console.error('🔍 DEBUG: Validation error:', error);
      setValidationError({
        type: 'validation_error',
        message: 'An error occurred during validation',
        details: { originalError: error.message },
      });
      setShowValidationModal(true);
      return { isValid: false, error: 'validation_error' };
    } finally {
      setIsValidating(false);
      console.log('🔍 DEBUG: Set isValidating to false');
    }
  }, []);

  /**
   * Clear validation error
   */
  const clearValidationError = useCallback(() => {
    setValidationError(null);
    setShowValidationModal(false);
  }, []);

  /**
   * Close validation modal
   */
  const closeValidationModal = useCallback(() => {
    setShowValidationModal(false);
  }, []);

  /**
   * Get validation error details for display
   * @param {string} errorType - The error type
   * @param {Object} details - Additional details
   * @returns {Object} - Formatted error information
   */
  const getErrorDetails = useCallback((errorType, details = {}) => {
    return getValidationErrorDetails(errorType, details);
  }, []);

  return {
    validationError,
    showValidationModal,
    isValidating,
    validateEssay,
    clearValidationError,
    closeValidationModal,
    getErrorDetails,
  };
};
