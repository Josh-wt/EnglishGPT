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
    // Use the existing /history/{user_id} endpoint since there's no dedicated /stats endpoint
    const response = await apiHelpers.get(`/history/${userId}`);
    
    // Extract evaluations and construct stats
    const evaluations = response.data.evaluations || [];
    
    // Calculate basic stats
    const stats = {
      totalEvaluations: evaluations.length,
      averageScore: 0,
      questionTypes: {},
      recentEvaluations: evaluations.slice(0, 5),
      evaluations: evaluations
    };
    
    // Calculate average score if there are evaluations
    if (evaluations.length > 0) {
      const scores = evaluations.map(evaluation => {
        const scoreMatch = (evaluation.grade || '').match(/(\d+)\s*\/\s*(\d+)/);
        return scoreMatch ? Number(scoreMatch[1]) : 0;
      }).filter(score => score > 0);
      
      if (scores.length > 0) {
        stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    }
    
    // Count question types
    evaluations.forEach(evaluation => {
      const type = evaluation.question_type || 'unknown';
      stats.questionTypes[type] = (stats.questionTypes[type] || 0) + 1;
    });
    
    return stats;
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
