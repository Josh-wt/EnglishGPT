export const ERROR_MESSAGES = {
  VALIDATION: {
    WORD_LIMIT_EXCEEDED: {
      title: 'Word Limit Exceeded',
      message: 'Your essay exceeds the maximum word limit for this question type.',
      details: {
        IGCSE: 'IGCSE essays should be no more than 700 words.',
        A_LEVEL: 'A-Level essays should be no more than 1000 words.',
      },
    },
    PROFANITY_DETECTED: {
      title: 'Inappropriate Language Detected',
      message: 'Your essay contains language that is not appropriate for academic writing.',
      details: 'Please review your essay and remove any inappropriate language before submitting.',
    },
    SPAM_DETECTED: {
      title: 'Spam Content Detected',
      message: 'Your essay appears to contain spam or test content.',
      details: 'Please write original content that addresses the question properly.',
    },
    TOO_BRIEF: {
      title: 'Essay Too Brief',
      message: 'Your essay is too short to provide meaningful analysis.',
      details: 'Please expand your response with more detailed analysis and examples.',
    },
    WORD_COUNT_TOO_LOW: {
      title: 'Minimum Word Count Not Met',
      message: 'Your essay does not meet the minimum word count requirement.',
      details: 'Please add more content to meet the minimum word count.',
    },
    VALIDATION_ERROR: {
      title: 'Validation Error',
      message: 'An error occurred while validating your essay.',
      details: 'Please try again or contact support if the problem persists.',
    },
  },
  API: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. Please check your permissions.',
    NOT_FOUND: 'The requested resource was not found.',
    TIMEOUT: 'Request timed out. Please try again.',
  },
  AUTH: {
    SIGN_IN_REQUIRED: 'Please sign in to continue.',
    SIGN_IN_FAILED: 'Sign in failed. Please try again.',
    SIGN_OUT_FAILED: 'Sign out failed. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  },
  SUBSCRIPTION: {
    UPGRADE_REQUIRED: 'This feature requires a premium subscription.',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  },
  GENERAL: {
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    LOADING_FAILED: 'Failed to load content. Please refresh the page.',
    SAVE_FAILED: 'Failed to save your work. Please try again.',
  },
};

export default ERROR_MESSAGES;
