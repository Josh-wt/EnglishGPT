import { VALIDATION_RULES } from '../../constants/validationRules';
import { countWords, meetsMinimumWordCount, exceedsMaximumWordCount } from './wordCountUtils';
import { checkProfanity } from './profanityFilter';
import { detectSpam } from './spamDetection';

/**
 * Validate essay content comprehensively
 * @param {string} studentResponse - The essay text to validate
 * @param {string} questionType - The type of question (IGCSE or A-Level)
 * @returns {Object} - Validation results
 */
export const validateEssayContent = (studentResponse, questionType) => {
  try {
    if (!studentResponse || typeof studentResponse !== 'string') {
      return {
        isValid: false,
        error: 'validation_error',
        message: 'No essay content provided',
      };
    }

    const wordCount = countWords(studentResponse);
    const maxWordLimit = questionType === 'A-Level' ? VALIDATION_RULES.WORD_LIMITS.A_LEVEL : VALIDATION_RULES.WORD_LIMITS.IGCSE;

    // Check word count limits
    if (wordCount > maxWordLimit) {
      return {
        isValid: false,
        error: 'word_limit_exceeded',
        message: `Essay exceeds ${maxWordLimit} word limit (current: ${wordCount} words)`,
        details: {
          current: wordCount,
          limit: maxWordLimit,
          questionType,
        },
      };
    }

    if (wordCount < VALIDATION_RULES.MIN_WORD_COUNT) {
      return {
        isValid: false,
        error: 'word_count_too_low',
        message: `Essay is too short (${wordCount} words). Minimum required: ${VALIDATION_RULES.MIN_WORD_COUNT} words`,
        details: {
          current: wordCount,
          minimum: VALIDATION_RULES.MIN_WORD_COUNT,
        },
      };
    }

    // Check for profanity
    const profanityCheck = checkProfanity(studentResponse);
    if (profanityCheck.hasProfanity) {
      return {
        isValid: false,
        error: 'profanity_detected',
        message: 'Inappropriate language detected in essay',
        details: {
          foundWords: profanityCheck.foundWords,
        },
      };
    }

    // Check for spam content
    const spamCheck = detectSpam(studentResponse);
    if (spamCheck.isSpam) {
      return {
        isValid: false,
        error: 'spam_detected',
        message: 'Essay appears to contain spam or test content',
        details: {
          reasons: spamCheck.reasons,
          details: spamCheck.details,
        },
      };
    }

    // Check if essay is too brief (subjective check)
    if (wordCount < 100) {
      return {
        isValid: false,
        error: 'too_brief',
        message: 'Essay is too brief to provide meaningful analysis',
        details: {
          current: wordCount,
          recommended: 100,
        },
      };
    }

    // All checks passed
    return {
      isValid: true,
      wordCount,
      maxWordLimit,
      questionType,
    };

  } catch (error) {
    console.error('Essay validation error:', error);
    return {
      isValid: false,
      error: 'validation_error',
      message: 'An error occurred during validation',
      details: {
        originalError: error.message,
      },
    };
  }
};

/**
 * Get validation error details for display
 * @param {string} errorType - The type of validation error
 * @param {Object} details - Additional error details
 * @returns {Object} - Formatted error information
 */
export const getValidationErrorDetails = (errorType, details = {}) => {
  const errorMessages = {
    word_limit_exceeded: {
      title: 'Word Limit Exceeded',
      message: `Your essay exceeds the maximum word limit for ${details.questionType || 'this question type'}.`,
      details: details.questionType === 'A-Level' 
        ? 'A-Level essays should be no more than 1400 words.'
        : 'IGCSE essays should be no more than 700 words.',
    },
    profanity_detected: {
      title: 'Inappropriate Language Detected',
      message: 'Your essay contains language that is not appropriate for academic writing.',
      details: 'Please review your essay and remove any inappropriate language before submitting.',
    },
    spam_detected: {
      title: 'Spam Content Detected',
      message: 'Your essay appears to contain spam or test content.',
      details: 'Please write original content that addresses the question properly.',
    },
    too_brief: {
      title: 'Essay Too Brief',
      message: 'Your essay is too short to provide meaningful analysis.',
      details: 'Please expand your response with more detailed analysis and examples.',
    },
    word_count_too_low: {
      title: 'Minimum Word Count Not Met',
      message: 'Your essay does not meet the minimum word count requirement.',
      details: 'Please add more content to meet the minimum word count.',
    },
    validation_error: {
      title: 'Validation Error',
      message: 'An error occurred while validating your essay.',
      details: 'Please try again or contact support if the problem persists.',
    },
  };

  return errorMessages[errorType] || errorMessages.validation_error;
};

/**
 * Check if essay meets basic requirements
 * @param {string} essay - The essay text
 * @param {string} questionType - The question type
 * @returns {boolean} - Whether essay meets basic requirements
 */
export const meetsBasicRequirements = (essay, questionType) => {
  const validation = validateEssayContent(essay, questionType);
  return validation.isValid;
};

/**
 * Get essay statistics
 * @param {string} essay - The essay text
 * @returns {Object} - Essay statistics
 */
export const getEssayStats = (essay) => {
  if (!essay || typeof essay !== 'string') {
    return {
      wordCount: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      averageWordLength: 0,
      uniqueWordRatio: 0,
    };
  }

  const wordCount = countWords(essay);
  const characterCount = essay.length;
  const characterCountNoSpaces = essay.replace(/\s/g, '').length;
  const averageWordLength = wordCount > 0 ? (characterCountNoSpaces / wordCount).toFixed(1) : 0;

  // Calculate unique word ratio
  const words = essay.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  const uniqueWords = new Set(words);
  const uniqueWordRatio = words.length > 0 ? (uniqueWords.size / words.length) : 0;

  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    averageWordLength,
    uniqueWordRatio: (uniqueWordRatio * 100).toFixed(1),
  };
};

export default {
  validateEssayContent,
  getValidationErrorDetails,
  meetsBasicRequirements,
  getEssayStats,
};
