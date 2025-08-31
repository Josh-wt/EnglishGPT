import { apiHelpers } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Register a webhook endpoint
 * @param {Object} webhookData - The webhook data
 * @param {string} webhookData.url - The webhook URL
 * @param {string} webhookData.events - The events to listen for
 * @param {string} webhookData.userId - The user ID
 * @returns {Promise} - API response
 */
export const registerWebhook = async (webhookData) => {
  try {
    const response = await apiHelpers.post(`${API_ENDPOINTS.WEBHOOKS}/register`, webhookData);
    return response.data;
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
};

/**
 * Get user's webhooks
 * @param {string} userId - The user ID
 * @returns {Promise} - API response
 */
export const getUserWebhooks = async (userId) => {
  try {
    const response = await apiHelpers.get(`${API_ENDPOINTS.WEBHOOKS}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user webhooks:', error);
    throw error;
  }
};

/**
 * Update a webhook
 * @param {string} webhookId - The webhook ID
 * @param {Object} webhookData - The webhook data to update
 * @returns {Promise} - API response
 */
export const updateWebhook = async (webhookId, webhookData) => {
  try {
    const response = await apiHelpers.put(`${API_ENDPOINTS.WEBHOOKS}/${webhookId}`, webhookData);
    return response.data;
  } catch (error) {
    console.error('Error updating webhook:', error);
    throw error;
  }
};

/**
 * Delete a webhook
 * @param {string} webhookId - The webhook ID
 * @returns {Promise} - API response
 */
export const deleteWebhook = async (webhookId) => {
  try {
    const response = await apiHelpers.delete(`${API_ENDPOINTS.WEBHOOKS}/${webhookId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
};

/**
 * Test a webhook
 * @param {string} webhookId - The webhook ID
 * @returns {Promise} - API response
 */
export const testWebhook = async (webhookId) => {
  try {
    const response = await apiHelpers.post(`${API_ENDPOINTS.WEBHOOKS}/${webhookId}/test`);
    return response.data;
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw error;
  }
};

/**
 * Get webhook delivery history
 * @param {string} webhookId - The webhook ID
 * @param {Object} filters - Optional filters
 * @param {number} filters.limit - Limit number of results
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise} - API response
 */
export const getWebhookDeliveries = async (webhookId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${API_ENDPOINTS.WEBHOOKS}/${webhookId}/deliveries${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiHelpers.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    throw error;
  }
};

/**
 * Retry a failed webhook delivery
 * @param {string} deliveryId - The delivery ID
 * @returns {Promise} - API response
 */
export const retryWebhookDelivery = async (deliveryId) => {
  try {
    const response = await apiHelpers.post(`${API_ENDPOINTS.WEBHOOKS}/deliveries/${deliveryId}/retry`);
    return response.data;
  } catch (error) {
    console.error('Error retrying webhook delivery:', error);
    throw error;
  }
};

export default {
  registerWebhook,
  getUserWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveries,
  retryWebhookDelivery,
};
