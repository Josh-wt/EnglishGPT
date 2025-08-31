/**
 * Dynamic backend URL detection utility
 * Same logic as used in App.js.backup
 */

/**
 * Get the backend URL dynamically based on current environment
 * @returns {string} - The backend URL
 */
export const getBackendUrl = () => {
  console.log('🔧 getBackendUrl called from:', new Error().stack?.split('\n')[2]?.trim() || 'Unknown');
  
  if (process.env.REACT_APP_BACKEND_URL) {
    console.log('🔧 Using REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔧 Window origin:', origin);
    
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const url = 'http://localhost:8000';
      console.log('🔧 Localhost detected, using:', url);
      return url;
    }
    
    const url = `${origin.replace(/:\d+/, '')}:8000`;
    console.log('🔧 Production detected, using:', url);
    return url;
  }
  
  console.log('🔧 Fallback to localhost:8000');
  return 'http://localhost:8000';
};

/**
 * Get the API base URL
 * @returns {string} - The API base URL
 */
export const getApiUrl = () => {
  const backendUrl = getBackendUrl();
  const apiUrl = `${backendUrl}/api`;
  console.log('🔧 getApiUrl returning:', apiUrl);
  return apiUrl;
};
