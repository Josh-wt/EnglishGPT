import React from 'react';

const AdminSearchPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Search users, evaluations, feedback" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">Users</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">Evaluations</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">Feedback</div>
      </div>
    </div>
  );
};

export default AdminSearchPage;

