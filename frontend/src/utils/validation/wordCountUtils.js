/**
 * Count words in a text string
 * @param {string} text - The text to count words in
 * @returns {number} - Number of words
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and split by spaces
  const words = text.trim().split(/\s+/);
  
  // Filter out empty strings
  return words.filter(word => word.length > 0).length;
};

/**
 * Get word count statistics
 * @param {string} text - The text to analyze
 * @returns {Object} - Word count statistics
 */
export const getWordCountStats = (text) => {
  const wordCount = countWords(text);
  const charCount = text ? text.length : 0;
  const charCountNoSpaces = text ? text.replace(/\s/g, '').length : 0;
  
  return {
    words: wordCount,
    characters: charCount,
    charactersNoSpaces: charCountNoSpaces,
    averageWordLength: wordCount > 0 ? (charCountNoSpaces / wordCount).toFixed(1) : 0,
  };
};

/**
 * Calculate unique word ratio
 * @param {string} text - The text to analyze
 * @returns {number} - Ratio of unique words to total words
 */
export const getUniqueWordRatio = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  if (words.length === 0) return 0;
  
  const uniqueWords = new Set(words);
  return uniqueWords.size / words.length;
};

/**
 * Get word frequency map
 * @param {string} text - The text to analyze
 * @returns {Object} - Map of words to their frequency
 */
export const getWordFrequency = (text) => {
  if (!text || typeof text !== 'string') return {};
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return frequency;
};

/**
 * Check if text meets minimum word count
 * @param {string} text - The text to check
 * @param {number} minimum - Minimum word count required
 * @returns {boolean} - Whether text meets minimum
 */
export const meetsMinimumWordCount = (text, minimum = 50) => {
  return countWords(text) >= minimum;
};

/**
 * Check if text exceeds maximum word count
 * @param {string} text - The text to check
 * @param {number} maximum - Maximum word count allowed
 * @returns {boolean} - Whether text exceeds maximum
 */
export const exceedsMaximumWordCount = (text, maximum = 2000) => {
  return countWords(text) > maximum;
};

export default {
  countWords,
  getWordCountStats,
  getUniqueWordRatio,
  getWordFrequency,
  meetsMinimumWordCount,
  exceedsMaximumWordCount,
};
