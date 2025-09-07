/**
 * Security debug utilities for development and monitoring
 */

/**
 * Log security-related information for debugging
 */
export const logSecurityInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security Debug Info:', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      origin: window.location.origin,
      protocol: window.location.protocol,
    });
  }
};

/**
 * Check for security-related browser features
 */
export const checkSecurityFeatures = () => {
  const features = {
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    secureContext: window.isSecureContext,
    localStorage: typeof(Storage) !== "undefined",
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security Features:', features);
  }
  
  return features;
};

export default {
  logSecurityInfo,
  checkSecurityFeatures,
};
