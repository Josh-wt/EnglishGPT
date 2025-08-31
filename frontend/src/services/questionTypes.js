import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Get all question types
 * @returns {Promise} - API response
 */
export const getQuestionTypes = async () => {
  try {
    const response = await apiHelpers.get(API_ENDPOINTS.QUESTION_TYPES);
    return response.data;
  } catch (error) {
    console.error('Error fetching question types:', error);
    throw error;
  }
};

/**
 * Get question types by academic level
 * @param {string} level - The academic level (igcse, alevel)
 * @returns {Promise} - API response
 */
export const getQuestionTypesByLevel = async (level) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.QUESTION_TYPES}/level/${level}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question types by level:', error);
    throw error;
  }
};

/**
 * Get a specific question type
 * @param {string} questionTypeId - The question type ID
 * @returns {Promise} - API response
 */
export const getQuestionType = async (questionTypeId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.QUESTION_TYPES}/${questionTypeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question type:', error);
    throw error;
  }
};

/**
 * Get question type examples
 * @param {string} questionTypeId - The question type ID
 * @returns {Promise} - API response
 */
export const getQuestionTypeExamples = async (questionTypeId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.QUESTION_TYPES}/${questionTypeId}/examples`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question type examples:', error);
    throw error;
  }
};
