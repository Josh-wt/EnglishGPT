import React from 'react';

const AdminAnalyticsPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Average grade by question type</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Average grade by academic level</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Grade trends over time</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Mark correlations</div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

