/**
 * Dynamic backend URL detection utility
 * Same logic as used in App.js.backup
 */

/**
 * Get the backend URL dynamically based on current environment
 * @returns {string} - The backend URL
 */
export const getBackendUrl = () => {
  // If REACT_APP_BACKEND_URL is set, use it
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Otherwise, dynamically detect based on current domain
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // If we're on localhost, use localhost:8000
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:8000';
    }
    
    // For production, use the same domain but port 8000
    // This assumes the backend is running on the same domain but different port
    return `${origin.replace(/:\d+/, '')}:8000`;
  }
  
  // Fallback for SSR
  return 'http://localhost:8000';
};

/**
 * Get the API base URL
 * @returns {string} - The API base URL
 */
export const getApiUrl = () => {
  return `${getBackendUrl()}/api`;
};
