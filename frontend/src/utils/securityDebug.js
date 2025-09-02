/**
 * Security debugging utility to identify browser extensions and recording tools
 * that might be causing nodeType permission errors
 */

export const detectSecurityIssues = () => {
  const issues = {
    browserExtensions: [],
    recordingTools: [],
    iframeIssues: false,
    corsIssues: false,
    timestamp: new Date().toISOString()
  };

  // Check for common browser extension APIs
  if (window.chrome && window.chrome.runtime) {
    issues.browserExtensions.push('Chrome Extension API detected');
  }

  if (window.browser && window.browser.runtime) {
    issues.browserExtensions.push('Firefox Extension API detected');
  }

  // Check for recording tools
  if (window.__RECORDING__) {
    issues.recordingTools.push('Generic recording tool detected');
  }

  if (window.__RECORD_JS__) {
    issues.recordingTools.push('Record.js detected');
  }

  if (window.__PLAYWRIGHT__) {
    issues.recordingTools.push('Playwright detected');
  }

  if (window.__SELENIUM__) {
    issues.recordingTools.push('Selenium detected');
  }

  if (window.__CYPRESS__) {
    issues.recordingTools.push('Cypress detected');
  }

  if (window.__PUPPETEER__) {
    issues.recordingTools.push('Puppeteer detected');
  }

  // Check for iframe issues
  if (window.parent !== window) {
    issues.iframeIssues = true;
  }

  // Check for CORS issues
  try {
    // Try to access a cross-origin property
    const test = window.location.href;
  } catch (error) {
    if (error.message.includes('cross-origin')) {
      issues.corsIssues = true;
    }
  }

  return issues;
};

export const logSecurityInfo = () => {
  const issues = detectSecurityIssues();
  
  console.log('🔒 Security Analysis:', issues);
  
  if (issues.browserExtensions.length > 0) {
    console.warn('⚠️ Browser extensions detected that may cause issues:', issues.browserExtensions);
  }
  
  if (issues.recordingTools.length > 0) {
    console.warn('⚠️ Recording tools detected that may cause issues:', issues.recordingTools);
  }
  
  if (issues.iframeIssues) {
    console.warn('⚠️ App is running in an iframe - this may cause security restrictions');
  }
  
  if (issues.corsIssues) {
    console.warn('⚠️ CORS issues detected');
  }
  
  return issues;
};

export const createSafeDOMAccess = () => {
  // Create safe versions of DOM access methods
  const safeMethods = {
    querySelector: (selector) => {
      try {
        return document.querySelector(selector);
      } catch (error) {
        if (error.message.includes('nodeType')) {
          console.warn('🔒 Safe DOM access: querySelector blocked for', selector);
          return null;
        }
        throw error;
      }
    },
    
    querySelectorAll: (selector) => {
      try {
        return document.querySelectorAll(selector);
      } catch (error) {
        if (error.message.includes('nodeType')) {
          console.warn('🔒 Safe DOM access: querySelectorAll blocked for', selector);
          return [];
        }
        throw error;
      }
    },
    
    getElementById: (id) => {
      try {
        return document.getElementById(id);
      } catch (error) {
        if (error.message.includes('nodeType')) {
          console.warn('🔒 Safe DOM access: getElementById blocked for', id);
          return null;
        }
        throw error;
      }
    }
  };
  
  return safeMethods;
};

// Auto-run security analysis on load
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure all scripts are loaded
  setTimeout(() => {
    logSecurityInfo();
  }, 1000);
}
