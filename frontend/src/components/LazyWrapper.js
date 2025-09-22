import React, { Suspense } from 'react';

// Skeleton loading component
const SkeletonLoader = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-8 w-3/4 mb-4"></div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-1/2 mb-2"></div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-2/3 mb-2"></div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-1/3"></div>
  </div>
);

// Page-level skeleton
const PageSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8">
      <SkeletonLoader className="max-w-4xl mx-auto" />
    </div>
  </div>
);

// Component-level skeleton
const ComponentSkeleton = ({ height = "h-64" }) => (
  <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg ${height} flex items-center justify-center`}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Lazy wrapper with error boundary
const LazyWrapper = ({ 
  children, 
  fallback = <PageSkeleton />,
  errorFallback = <div className="text-center py-8 text-red-600">Failed to load component</div>
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export { LazyWrapper, SkeletonLoader, PageSkeleton, ComponentSkeleton };
