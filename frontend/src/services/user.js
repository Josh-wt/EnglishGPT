import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Get user profile
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} userData - The user data to update
 * @returns {Promise} - API response
 */
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await apiHelpers.put(`${API_ENDPOINTS.USERS}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user academic level
 * @param {string} userId - The user ID
 * @param {string} academicLevel - The academic level
 * @returns {Promise} - API response
 */
export const updateAcademicLevel = async (userId, academicLevel) => {
  try {
    const response = await apiHelpers.put(`${API_ENDPOINTS.USERS}/${userId}`, {
      academic_level: academicLevel,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating academic level:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getUserStats = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Get user subscription status
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getUserSubscription = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}/subscription`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
};

/**
 * Get user transaction history
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.limit - Limit number of results
 * @param {string} filters.offset - Offset for pagination
 * @returns {Promise} - API response
 */
export const getUserTransactions = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${API_ENDPOINTS.TRANSACTIONS}/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiHelpers.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const deleteUserAccount = async (userId) => {
  try {
    const response = await apiHelpers.delete(`${API_ENDPOINTS.USERS}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

/**
 * Export user data
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const exportUserData = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.USERS}/${userId}/export`);
    return response.data;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateAcademicLevel,
  getUserStats,
  getUserSubscription,
  getUserTransactions,
  deleteUserAccount,
  exportUserData,
};
