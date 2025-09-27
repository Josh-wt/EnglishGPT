/**
 * Utility functions for formatting question type names and IDs
 */

// Mapping of question type IDs to display names
const QUESTION_TYPE_DISPLAY_NAMES = {
  // IGCSE
  'igcse_summary': 'Summary',
  'igcse_narrative': 'Narrative',
  'igcse_descriptive': 'Descriptive',
  'igcse_writers_effect': "Writer's Effect",
  'igcse_directed': 'Directed Writing',
  
  // A-Level
  'alevel_comparative': 'Comparative Analysis 1(b)',
  'alevel_directed': 'Directed Writing 1(a)',
  'alevel_text_analysis': 'Text Analysis Q2',
  'alevel_language_change': 'Language Change Analysis (P3, Section A)',
  'alevel_reflective': 'Reflective Commentary',
  'alevel_reflective_commentary': 'Reflective Commentary',
  
  // General Paper
  'gp_essay': 'Essay (Paper 1)',
  'gp_comprehension': 'Comprehension (Paper 2) Q1(a)',
  
  // SAT
  'sat_essay': 'SAT Essay',
  
  // Fallback for unknown types
  'essay': 'Essay',
  'default': 'Essay'
};

/**
 * Formats a question type ID into a human-readable display name
 * @param {string} questionTypeId - The question type ID (e.g., 'gp_essay')
 * @returns {string} - The formatted display name (e.g., 'Essay (Paper 1)')
 */
export const formatQuestionTypeName = (questionTypeId) => {
  if (!questionTypeId) return 'Essay';
  
  // Handle both questionType and question_type properties
  const id = questionTypeId.toLowerCase().trim();
  
  // Direct lookup in mapping
  if (QUESTION_TYPE_DISPLAY_NAMES[id]) {
    return QUESTION_TYPE_DISPLAY_NAMES[id];
  }
  
  // Fallback: convert snake_case to Title Case
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gets the category/level for a question type
 * @param {string} questionTypeId - The question type ID
 * @returns {string} - The category name
 */
export const getQuestionTypeCategory = (questionTypeId) => {
  if (!questionTypeId) return 'General';
  
  const id = questionTypeId.toLowerCase().trim();
  
  if (id.startsWith('igcse_')) return 'IGCSE';
  if (id.startsWith('alevel_')) return 'A-Level English (9093)';
  if (id.startsWith('gp_')) return 'English General Paper (8021)';
  if (id.startsWith('sat_')) return 'SAT';
  
  return 'General';
};

/**
 * Gets a short, clean version of the question type name for compact displays
 * @param {string} questionTypeId - The question type ID
 * @returns {string} - The short display name
 */
export const getShortQuestionTypeName = (questionTypeId) => {
  if (!questionTypeId) return 'Essay';
  
  const id = questionTypeId.toLowerCase().trim();
  
  // Special cases for very long names
  const shortNames = {
    'igcse_writers_effect': "Writer's Effect",
    'alevel_comparative': 'Comparative Analysis',
    'alevel_language_change': 'Language Change',
    'gp_comprehension': 'Comprehension',
    'alevel_reflective_commentary': 'Reflective Commentary'
  };
  
  if (shortNames[id]) {
    return shortNames[id];
  }
  
  return formatQuestionTypeName(questionTypeId);
};

/**
 * Formats question type for search/filter purposes
 * @param {string} questionTypeId - The question type ID
 * @returns {string} - The search-friendly name
 */
export const formatQuestionTypeForSearch = (questionTypeId) => {
  return formatQuestionTypeName(questionTypeId).toLowerCase();
};

export default {
  formatQuestionTypeName,
  getQuestionTypeCategory,
  getShortQuestionTypeName,
  formatQuestionTypeForSearch
};
