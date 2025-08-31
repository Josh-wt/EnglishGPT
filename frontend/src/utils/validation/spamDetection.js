import { FILLER_WORDS, VALIDATION_RULES } from '../../constants/validationRules';
import { getWordFrequency, getUniqueWordRatio } from './wordCountUtils';

const { REPETITIVE_PATTERN_THRESHOLD, UNIQUE_WORD_RATIO_THRESHOLD } = VALIDATION_RULES;

/**
 * Check for essay spam patterns
 * @param {string} text - The text to check
 * @returns {Object} - Object containing spam detection results
 */
export const detectEssaySpam = (text) => {
  if (!text || typeof text !== 'string') {
    return { isSpam: false, reasons: [] };
  }

  const reasons = [];
  const lowerText = text.toLowerCase();

  // Check for common essay spam patterns
  const spamPatterns = [
    'this is a test essay',
    'this is a sample essay',
    'this is an example essay',
    'this essay is about',
    'in this essay i will',
    'this essay discusses',
    'the purpose of this essay',
    'this essay aims to',
    'this essay explores',
    'this essay examines',
  ];

  const foundSpamPatterns = spamPatterns.filter(pattern => 
    lowerText.includes(pattern)
  );

  if (foundSpamPatterns.length > 0) {
    reasons.push(`Found ${foundSpamPatterns.length} spam pattern(s): ${foundSpamPatterns.join(', ')}`);
  }

  return {
    isSpam: foundSpamPatterns.length > 0,
    reasons,
    foundPatterns: foundSpamPatterns,
  };
};

/**
 * Check for excessive filler words
 * @param {string} text - The text to check
 * @returns {Object} - Object containing filler word analysis
 */
export const checkFillerWords = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasExcessiveFiller: false, fillerCount: 0, fillerWords: [] };
  }

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);

  const foundFillerWords = words.filter(word => 
    FILLER_WORDS.some(filler => 
      word.includes(filler) || filler.includes(word)
    )
  );

  const fillerRatio = words.length > 0 ? foundFillerWords.length / words.length : 0;
  const hasExcessiveFiller = fillerRatio > 0.1; // More than 10% filler words

  return {
    hasExcessiveFiller,
    fillerCount: foundFillerWords.length,
    fillerWords: foundFillerWords,
    fillerRatio,
  };
};

/**
 * Check for repetitive patterns
 * @param {string} text - The text to check
 * @returns {Object} - Object containing repetitive pattern analysis
 */
export const checkRepetitivePatterns = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasRepetitivePatterns: false, patterns: [] };
  }

  const wordFrequency = getWordFrequency(text);
  const words = Object.keys(wordFrequency);
  const patterns = [];

  // Check for words that appear too frequently
  const totalWords = Object.values(wordFrequency).reduce((sum, count) => sum + count, 0);
  
  words.forEach(word => {
    const frequency = wordFrequency[word];
    const ratio = frequency / totalWords;
    
    if (ratio > REPETITIVE_PATTERN_THRESHOLD && frequency > 3) {
      patterns.push({
        word,
        frequency,
        ratio: (ratio * 100).toFixed(1) + '%',
      });
    }
  });

  return {
    hasRepetitivePatterns: patterns.length > 0,
    patterns,
  };
};

/**
 * Check for low unique word ratio (indicating repetitive content)
 * @param {string} text - The text to check
 * @returns {Object} - Object containing unique word ratio analysis
 */
export const checkUniqueWordRatio = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasLowUniqueRatio: false, ratio: 0 };
  }

  const ratio = getUniqueWordRatio(text);
  const hasLowUniqueRatio = ratio < UNIQUE_WORD_RATIO_THRESHOLD;

  return {
    hasLowUniqueRatio,
    ratio,
  };
};

/**
 * Comprehensive spam detection
 * @param {string} text - The text to check
 * @returns {Object} - Object containing comprehensive spam analysis
 */
export const detectSpam = (text) => {
  if (!text || typeof text !== 'string') {
    return { isSpam: false, reasons: [], details: {} };
  }

  const essaySpam = detectEssaySpam(text);
  const fillerWords = checkFillerWords(text);
  const repetitivePatterns = checkRepetitivePatterns(text);
  const uniqueWordRatio = checkUniqueWordRatio(text);

  const reasons = [
    ...essaySpam.reasons,
    ...(fillerWords.hasExcessiveFiller ? [`Excessive filler words (${fillerWords.fillerCount} found)`] : []),
    ...(repetitivePatterns.hasRepetitivePatterns ? [`Repetitive patterns detected (${repetitivePatterns.patterns.length} patterns)`] : []),
    ...(uniqueWordRatio.hasLowUniqueRatio ? [`Low unique word ratio (${(uniqueWordRatio.ratio * 100).toFixed(1)}%)`] : []),
  ];

  const isSpam = reasons.length > 0;

  return {
    isSpam,
    reasons,
    details: {
      essaySpam,
      fillerWords,
      repetitivePatterns,
      uniqueWordRatio,
    },
  };
};

export default {
  detectEssaySpam,
  checkFillerWords,
  checkRepetitivePatterns,
  checkUniqueWordRatio,
  detectSpam,
};
