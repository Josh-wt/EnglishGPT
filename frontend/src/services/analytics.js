import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Get user analytics data
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.timeRange - Time range filter (week, month, year, all)
 * @param {string} filters.questionType - Filter by question type
 * @returns {Promise} - API response
 */
export const getUserAnalytics = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.timeRange) params.append('time_range', filters.timeRange);
    if (filters.questionType) params.append('question_type', filters.questionType);
    
    const url = `${API_ENDPOINTS.ANALYTICS}/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiHelpers.get(url, {}, {
      cache: true,
      cacheTime: 120000, // 2 minutes cache for analytics
      deduplicate: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

/**
 * Get performance trends
 * @param {string} userId - The user ID
 * @param {string} timeRange - Time range (week, month, year)
 * @returns {Promise} - API response
 */
export const getPerformanceTrends = async (userId, timeRange = 'month') => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/trends?time_range=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    throw error;
  }
};

/**
 * Get grade distribution
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getGradeDistribution = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/grades`);
    return response.data;
  } catch (error) {
    console.error('Error fetching grade distribution:', error);
    throw error;
  }
};

/**
 * Get question type performance
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getQuestionTypePerformance = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/question-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question type performance:', error);
    throw error;
  }
};

/**
 * Get submark analysis
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getSubmarkAnalysis = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/submarks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching submark analysis:', error);
    throw error;
  }
};

/**
 * Get AI recommendations
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getAIRecommendations = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/recommendations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    throw error;
  }
};

/**
 * Get weekly performance data
 * @param {string} userId - The user ID
 * @param {number} weeks - Number of weeks to fetch
 * @returns {Promise} - API response
 */
export const getWeeklyPerformance = async (userId, weeks = 12) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/weekly?weeks=${weeks}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly performance:', error);
    throw error;
  }
};

/**
 * Get improvement metrics
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getImprovementMetrics = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.ANALYTICS}/${userId}/improvement`);
    return response.data;
  } catch (error) {
    console.error('Error fetching improvement metrics:', error);
    throw error;
  }
};

export default {
  getUserAnalytics,
  getPerformanceTrends,
  getGradeDistribution,
  getQuestionTypePerformance,
  getSubmarkAnalysis,
  getAIRecommendations,
  getWeeklyPerformance,
  getImprovementMetrics,
};
