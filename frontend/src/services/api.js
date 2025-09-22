import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_ENDPOINTS.API, // Use API which includes /api prefix
  timeout: 15000, // 15 seconds - reduced from 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track request timing and lifecycle
const requestTracker = new Map();

// Request deduplication cache
const requestCache = new Map();
const pendingRequests = new Map();

// Combined request interceptor for debugging and auth token
api.interceptors.request.use(
  async (config) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();
    
    // Track this request
    requestTracker.set(requestId, {
      startTime,
      config: { ...config },
      status: 'pending'
    });
    
    console.log(`🚀 [${requestId}] API Request STARTED:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.baseURL + config.url,
      data: config.data,
      headers: config.headers,
      hasAuth: !!config.headers.Authorization,
      component: new Error().stack?.split('\n')[2]?.trim() || 'Unknown',
      timestamp: new Date().toISOString()
    });
    
    // Add auth token first
    try {
      const { data: { session } } = await import('../supabaseClient').then(module => module.supabase.auth.getSession());
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log(`🔐 [${requestId}] Auth token added to request`);
      } else {
        console.warn(`⚠️ [${requestId}] No auth session found for request`);
      }
    } catch (error) {
      console.error(`❌ [${requestId}] Error getting auth session:`, error);
    }
    
    // Store requestId in config for response tracking
    config.requestId = requestId;
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Combined response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    const requestId = response.config.requestId;
    const requestInfo = requestTracker.get(requestId);
    const duration = requestInfo ? Date.now() - requestInfo.startTime : 'unknown';
    
    if (requestInfo) {
      requestInfo.status = 'completed';
      requestInfo.duration = duration;
      requestInfo.response = response;
    }
    
    console.log(`✅ [${requestId}] API Response SUCCESS:`, {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      hasShortId: !!response.data?.short_id,
      shortId: response.data?.short_id,
      duration: `${duration}ms`,
      responseHeaders: response.headers,
      timestamp: new Date().toISOString()
    });
    
    // Clean up tracker after successful response
    setTimeout(() => requestTracker.delete(requestId), 5000);
    
    return response;
  },
  (error) => {
    const requestId = error.config?.requestId;
    const requestInfo = requestTracker.get(requestId);
    const duration = requestInfo ? Date.now() - requestInfo.startTime : 'unknown';
    
    if (requestInfo) {
      requestInfo.status = 'failed';
      requestInfo.duration = duration;
      requestInfo.error = error;
    }
    
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error(`🚫 [${requestId}] Unauthorized access`);
          break;
        case 403:
          // Forbidden
          console.error(`🚫 [${requestId}] Access forbidden`);
          break;
        case 404:
          // Not found
          console.error(`🚫 [${requestId}] Resource not found`);
          break;
        case 500:
          // Server error
          console.error(`🚫 [${requestId}] Server error`);
          break;
        default:
          console.error(`🚫 [${requestId}] API error:`, error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error(`🌐 [${requestId}] Network error:`, error.request);
    } else {
      // Other error
      console.error(`❌ [${requestId}] Error:`, error.message);
    }
    
    console.error(`❌ [${requestId}] API Response Error:`, {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      responseData: error.response?.data,
      duration: `${duration}ms`,
      errorType: error.code || 'unknown',
      isCanceled: error.name === 'CanceledError' || error.code === 'ERR_CANCELED',
      isAborted: error.name === 'AbortError' || error.code === 'ABORT_ERR',
      timestamp: new Date().toISOString()
    });
    
    // Clean up tracker after error
    setTimeout(() => requestTracker.delete(requestId), 5000);
    
    return Promise.reject(error);
  }
);

// Add timeout debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      const requestId = error.config?.requestId;
      console.error(`⏰ [${requestId}] Request TIMEOUT after 30 seconds:`, {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        fullUrl: error.config?.baseURL + error.config?.url,
        timestamp: new Date().toISOString()
      });
    }
    return Promise.reject(error);
  }
);

// Debug function to check pending requests
export const debugPendingRequests = () => {
  const now = Date.now();
  const pending = Array.from(requestTracker.entries())
    .filter(([id, info]) => info.status === 'pending')
    .map(([id, info]) => ({
      id,
      duration: now - info.startTime,
      url: info.config.url,
      method: info.config.method?.toUpperCase(),
      fullUrl: info.config.baseURL + info.config.url
    }));
  
  if (pending.length > 0) {
    console.log('🔍 Pending API Requests:', pending);
  } else {
    console.log('✅ No pending API requests');
  }
  
  return pending;
};

// Debug function to check all tracked requests
export const debugAllRequests = () => {
  const now = Date.now();
  const all = Array.from(requestTracker.entries()).map(([id, info]) => ({
    id,
    status: info.status,
    duration: info.status === 'pending' ? now - info.startTime : info.duration,
    url: info.config.url,
    method: info.config.method?.toUpperCase(),
    fullUrl: info.config.baseURL + info.config.url,
    timestamp: new Date(info.startTime).toISOString()
  }));
  
  console.log('📊 All Tracked API Requests:', all);
  return all;
};

// API helper functions
export const apiHelpers = {
  /**
   * Make a GET request with deduplication and caching
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @param {Object} options - Request options
   * @param {boolean} options.cache - Whether to cache the response (default: true)
   * @param {number} options.cacheTime - Cache duration in ms (default: 30000)
   * @param {boolean} options.deduplicate - Whether to deduplicate identical requests (default: true)
   * @returns {Promise} - Axios response
   */
  get: (url, config = {}, options = {}) => {
    const { cache = true, cacheTime = 30000, deduplicate = true } = options;
    const cacheKey = `${url}_${JSON.stringify(config)}`;
    
    console.log(`📡 Making GET request to: ${url}`);
    
    // Check cache first
    if (cache && requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTime) {
        console.log(`🚀 [CACHE HIT] Returning cached response for: ${url}`);
        return Promise.resolve(cached.response);
      } else {
        requestCache.delete(cacheKey);
      }
    }
    
    // Check for pending identical requests
    if (deduplicate && pendingRequests.has(cacheKey)) {
      console.log(`🔄 [DEDUP] Joining pending request for: ${url}`);
      return pendingRequests.get(cacheKey);
    }
    
    // Add timeout monitoring
    const startTime = Date.now();
    const timeoutWarning = setTimeout(() => {
      console.warn(`⚠️ GET request to ${url} taking longer than 8s`, {
        duration: Date.now() - startTime,
        url,
        timestamp: new Date().toISOString()
      });
    }, 8000);
    
    // Create the request promise
    const requestPromise = api.get(url, config).then(response => {
      // Cache successful responses
      if (cache) {
        requestCache.set(cacheKey, {
          response,
          timestamp: Date.now()
        });
      }
      
      // Clean up pending request
      pendingRequests.delete(cacheKey);
      
      return response;
    }).catch(error => {
      const duration = Date.now() - startTime;
      
      // Clean up pending request on error
      pendingRequests.delete(cacheKey);
      
      // Enhanced error logging for debugging
      console.error(`❌ GET request failed: ${url}`, {
        error: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        timeout: error.config?.timeout,
        duration,
        timestamp: new Date().toISOString(),
        isCanceled: error.name === 'CanceledError' || error.code === 'ERR_CANCELED',
        fullError: error
      });
      
      throw error;
    }).finally(() => {
      clearTimeout(timeoutWarning);
      const duration = Date.now() - startTime;
      if (duration > 5000) {
        console.warn(`⚠️ Slow GET request to ${url}: ${duration}ms`);
      }
    });
    
    // Store pending request for deduplication
    if (deduplicate) {
      pendingRequests.set(cacheKey, requestPromise);
    }
    
    return requestPromise;
  },
  
  /**
   * Make a POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request data
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  post: (url, data = {}, config = {}) => {
    console.log(`📡 Making POST request to: ${url}`, data);
    return api.post(url, data, config);
  },
  
  /**
   * Make a PUT request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request data
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  put: (url, data = {}, config = {}) => {
    console.log(`📡 Making PUT request to: ${url}`, data);
    return api.put(url, data, config);
  },
  
  /**
   * Make a DELETE request
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  delete: (url, config = {}) => {
    console.log(`📡 Making DELETE request to: ${url}`);
    return api.delete(url, config);
  },
  
  /**
   * Make a PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request data
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Axios response
   */
  patch: (url, data = {}, config = {}) => {
    console.log(`📡 Making PATCH request to: ${url}`, data);
    return api.patch(url, data, config);
  },
};

// Cache management functions
export const cacheHelpers = {
  /**
   * Clear all cached requests
   */
  clearAll: () => {
    requestCache.clear();
    pendingRequests.clear();
    console.log('🧹 Cleared all API caches');
  },
  
  /**
   * Clear cache for specific URL pattern
   * @param {string} pattern - URL pattern to match
   */
  clearPattern: (pattern) => {
    let cleared = 0;
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
        cleared++;
      }
    }
    console.log(`🧹 Cleared ${cleared} cached requests matching pattern: ${pattern}`);
  },
  
  /**
   * Clear user-specific cache (call on sign out)
   */
  clearUserCache: () => {
    let cleared = 0;
    for (const key of requestCache.keys()) {
      if (key.includes('/users/') || key.includes('/analytics/') || key.includes('/evaluations/')) {
        requestCache.delete(key);
        cleared++;
      }
    }
    console.log(`🧹 Cleared ${cleared} user-specific cached requests`);
  },
  
  /**
   * Get cache statistics
   */
  getStats: () => {
    return {
      cachedRequests: requestCache.size,
      pendingRequests: pendingRequests.size,
      cacheKeys: Array.from(requestCache.keys())
    };
  }
};

export { api, apiHelpers, debugAllRequests, cacheHelpers };
export default api;
