import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_ENDPOINTS.API, // Use API which includes /api prefix
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.baseURL + config.url,
      data: config.data,
      headers: config.headers,
      component: new Error().stack?.split('\n')[2]?.trim() || 'Unknown'
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      hasShortId: !!response.data?.short_id,
      shortId: response.data?.short_id
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      responseData: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get session from Supabase
    const { data: { session } } = await import('../supabaseClient').then(module => module.supabase.auth.getSession());
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access');
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  /**
   * Make a GET request
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  get: (url, config = {}) => api.get(url, config),
  
  /**
   * Make a POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request data
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  /**
   * Make a PUT request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request data
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  /**
   * Make a DELETE request
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  delete: (url, config = {}) => api.delete(url, config),
  
  /**
   * Make a PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request data
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
};

export default api;
