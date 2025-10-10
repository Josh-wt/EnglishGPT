import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { logSecurityInfo } from "./utils/securityDebug";
import * as serviceWorker from "./utils/serviceWorker";

// Add global error handler for nodeType permission errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('nodeType')) {
    console.warn('🔒 Browser security restriction detected:', {
      error: event.error.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString()
    });
    
    // Prevent the error from being logged as an uncaught error
    event.preventDefault();
    return false;
  }
});

// Add unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('nodeType')) {
    console.warn('🔒 Browser security restriction detected (unhandled rejection):', {
      reason: event.reason.message,
      timestamp: new Date().toISOString()
    });
    
    // Prevent the rejection from being logged
    event.preventDefault();
    return false;
  }
});

// Add debugging for DOM access issues
const originalQuerySelector = document.querySelector;
const originalQuerySelectorAll = document.querySelectorAll;

document.querySelector = function(...args) {
  try {
    return originalQuerySelector.apply(this, args);
  } catch (error) {
    if (error.message && error.message.includes('nodeType')) {
      console.warn('🔒 DOM access blocked by browser security:', {
        selector: args[0],
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
    throw error;
  }
};

document.querySelectorAll = function(...args) {
  try {
    return originalQuerySelectorAll.apply(this, args);
  } catch (error) {
    if (error.message && error.message.includes('nodeType')) {
      console.warn('🔒 DOM access blocked by browser security:', {
        selector: args[0],
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return [];
    }
    throw error;
  }
};

// Add debugging for iframe access
if (window.parent !== window) {
  console.log('🔍 App running in iframe - this may cause security restrictions');
}

// Add debugging for browser extensions
if (window.chrome && window.chrome.runtime) {
  console.log('🔍 Chrome extension API detected');
}

// Add debugging for recording tools
if (window.__RECORDING__ || window.__RECORD_JS__) {
  console.log('🔍 Recording tool detected');
}

// Run security analysis
logSecurityInfo();

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for performance optimization
serviceWorker.register({
  onSuccess: (registration) => {
    console.log('✅ Service worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('🔄 Service worker updated');
  }
});

// Measure Core Web Vitals
serviceWorker.performanceUtils.measureWebVitals((metric) => {
  console.log('📊 Web Vital:', metric);
  
  // Send to analytics if needed
  if (window.posthog) {
    window.posthog.capture('web_vital', {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id
    });
  }
});
