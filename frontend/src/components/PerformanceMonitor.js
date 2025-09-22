import React, { useEffect, useState } from 'react';

const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            navigation: {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              totalTime: entry.loadEventEnd - entry.fetchStart
            }
          }));
        }
        
        if (entry.entryType === 'paint') {
          setMetrics(prev => ({
            ...prev,
            paint: {
              ...prev.paint,
              [entry.name]: entry.startTime
            }
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const resources = entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        type: entry.initiatorType
      }));
      
      setMetrics(prev => ({
        ...prev,
        resources: resources.slice(-10) // Keep last 10 resources
      }));
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Keyboard shortcut to toggle visibility
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [enabled]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md text-sm font-mono">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">📊 Performance Monitor</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {metrics.navigation && (
          <div>
            <strong>Navigation:</strong>
            <div className="ml-2 text-xs">
              <div>DOM Ready: {metrics.navigation.domContentLoaded?.toFixed(2)}ms</div>
              <div>Load Complete: {metrics.navigation.loadComplete?.toFixed(2)}ms</div>
              <div>Total Time: {metrics.navigation.totalTime?.toFixed(2)}ms</div>
            </div>
          </div>
        )}
        
        {metrics.paint && (
          <div>
            <strong>Paint:</strong>
            <div className="ml-2 text-xs">
              {Object.entries(metrics.paint).map(([key, value]) => (
                <div key={key}>{key}: {value?.toFixed(2)}ms</div>
              ))}
            </div>
          </div>
        )}
        
        {metrics.resources && (
          <div>
            <strong>Recent Resources:</strong>
            <div className="ml-2 text-xs max-h-32 overflow-y-auto">
              {metrics.resources.map((resource, index) => (
                <div key={index} className="truncate">
                  {resource.type}: {resource.duration?.toFixed(2)}ms ({resource.size} bytes)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;
