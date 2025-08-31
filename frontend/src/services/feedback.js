import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Submit feedback for an evaluation
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.evaluationId - The evaluation ID
 * @param {string} feedbackData.userId - The user ID
 * @param {string} feedbackData.category - The feedback category
 * @param {boolean} feedbackData.accurate - Whether the feedback is accurate
 * @param {string} feedbackData.comments - Additional comments
 * @returns {Promise} - API response
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await apiHelpers.post(API_ENDPOINTS.FEEDBACK, feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Get feedback for an evaluation
 * @param {string} evaluationId - The evaluation ID
 * @returns {Promise} - API response
 */
export const getFeedback = async (evaluationId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.FEEDBACK}/${evaluationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

/**
 * Get all feedback for a user
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.limit - Limit number of results
 * @param {string} filters.offset - Offset for pagination
 * @returns {Promise} - API response
 */
export const getUserFeedback = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${API_ENDPOINTS.FEEDBACK}/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiHelpers.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    throw error;
  }
};
