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
    console.log('🔧 Using REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Otherwise, dynamically detect based on current domain
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔧 Current origin:', origin);
    
    // If we're on localhost, use localhost:8000
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      const backendUrl = 'http://localhost:8000';
      console.log('🔧 Using localhost backend URL:', backendUrl);
      return backendUrl;
    }
    
    // For production, use the same domain but port 8000
    // This assumes the backend is running on the same domain but different port
    const backendUrl = `${origin.replace(/:\d+/, '')}:8000`;
    console.log('🔧 Using production backend URL:', backendUrl);
    return backendUrl;
  }
  
  // Fallback for SSR
  console.log('🔧 Using fallback backend URL: http://localhost:8000');
  return 'http://localhost:8000';
};

/**
 * Get the API base URL
 * @returns {string} - The API base URL
 */
export const getApiUrl = () => {
  const apiUrl = `${getBackendUrl()}/api`;
  console.log('🔧 API URL:', apiUrl);
  return apiUrl;
};
