import { TEST_WORDS } from '../../constants/validationRules';

/**
 * List of profanity words to filter out
 * This is a basic list - in production, you'd want a more comprehensive database
 */
const PROFANITY_WORDS = [
  // Common profanity (censored for documentation)
  'f***', 's***', 'a***', 'b***', 'c***', 'd***', 'p***', 't***',
  // Variations and common misspellings
  'f*ck', 'sh*t', 'a**', 'b*tch', 'c*nt', 'd*ck', 'p*ss', 't*ts',
  // Additional variations
  'fck', 'sht', 'ass', 'btch', 'cnt', 'dck', 'pss', 'tts',
  // Common replacements that might be used
  'fudge', 'shoot', 'darn', 'heck', 'gosh', 'dang',
];

/**
 * Check if text contains profanity
 * @param {string} text - The text to check
 * @returns {Object} - Object containing whether profanity was found and the words
 */
export const checkProfanity = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, foundWords: [] };
  }

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);

  const foundProfanity = words.filter(word => 
    PROFANITY_WORDS.some(profanity => 
      word.includes(profanity) || profanity.includes(word)
    )
  );

  return {
    hasProfanity: foundProfanity.length > 0,
    foundWords: foundProfanity,
  };
};

/**
 * Check if text contains test words (indicating it might be test content)
 * @param {string} text - The text to check
 * @returns {Object} - Object containing whether test words were found and the words
 */
export const checkTestWords = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasTestWords: false, foundWords: [] };
  }

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);

  const foundTestWords = words.filter(word => 
    TEST_WORDS.some(testWord => 
      word.includes(testWord) || testWord.includes(word)
    )
  );

  return {
    hasTestWords: foundTestWords.length > 0,
    foundWords: foundTestWords,
  };
};

/**
 * Sanitize text by removing or replacing profanity
 * @param {string} text - The text to sanitize
 * @param {string} replacement - What to replace profanity with (default: '*')
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text, replacement = '*') => {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;
  
  PROFANITY_WORDS.forEach(profanity => {
    const regex = new RegExp(profanity, 'gi');
    sanitized = sanitized.replace(regex, replacement.repeat(profanity.length));
  });

  return sanitized;
};

/**
 * Check if text is appropriate for academic writing
 * @param {string} text - The text to check
 * @returns {Object} - Object containing appropriateness check results
 */
export const checkAppropriateness = (text) => {
  const profanityCheck = checkProfanity(text);
  const testWordCheck = checkTestWords(text);

  return {
    isAppropriate: !profanityCheck.hasProfanity && !testWordCheck.hasTestWords,
    profanity: profanityCheck,
    testWords: testWordCheck,
    issues: [
      ...(profanityCheck.hasProfanity ? ['profanity'] : []),
      ...(testWordCheck.hasTestWords ? ['test_words'] : []),
    ],
  };
};

export default {
  checkProfanity,
  checkTestWords,
  sanitizeText,
  checkAppropriateness,
};
