import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Submit an essay for evaluation
 * @param {Object} evaluationData - The evaluation data
 * @param {string} evaluationData.studentResponse - The essay text
 * @param {string} evaluationData.questionType - The question type
 * @param {string} evaluationData.markScheme - The mark scheme (optional)
 * @param {string} evaluationData.userId - The user ID
 * @returns {Promise} - API response
 */
export const submitEvaluation = async (evaluationData) => {
  try {
    const response = await apiHelpers.post(API_ENDPOINTS.EVALUATIONS, evaluationData);
    return response.data;
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    throw error;
  }
};

/**
 * Get user's evaluation history
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.questionType - Filter by question type
 * @param {string} filters.dateFrom - Filter from date
 * @param {string} filters.dateTo - Filter to date
 * @param {number} filters.limit - Limit number of results
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise} - API response
 */
export const getEvaluations = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.questionType) params.append('question_type', filters.questionType);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${API_ENDPOINTS.EVALUATIONS}/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiHelpers.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    throw error;
  }
};

/**
 * Get a specific evaluation by ID
 * @param {string} evaluationId - The evaluation ID
 * @returns {Promise} - API response
 */
export const getEvaluation = async (evaluationId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.EVALUATIONS}/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    throw error;
  }
};

/**
 * Delete an evaluation
 * @param {string} evaluationId - The evaluation ID
 * @returns {Promise} - API response
 */
export const deleteEvaluation = async (evaluationId) => {
  try {
    const response = await apiHelpers.delete(`${API_ENDPOINTS.EVALUATIONS}/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw error;
  }
};

/**
 * Update an evaluation
 * @param {string} evaluationId - The evaluation ID
 * @param {Object} updateData - The data to update
 * @returns {Promise} - API response
 */
export const updateEvaluation = async (evaluationId, updateData) => {
  try {
    const response = await apiHelpers.put(`${API_ENDPOINTS.EVALUATIONS}/${evaluationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating evaluation:', error);
    throw error;
  }
};

/**
 * Get evaluation statistics for a user
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getEvaluationStats = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.EVALUATIONS}/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
    throw error;
  }
};

export default {
  submitEvaluation,
  getEvaluations,
  getEvaluation,
  deleteEvaluation,
  updateEvaluation,
  getEvaluationStats,
};
