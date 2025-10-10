import React from 'react';
import { Card } from '../../ui/card';

const Stat = ({ label, value, children }) => (
  <div className="rounded-2xl backdrop-blur bg-white/70 dark:bg-gray-800/70 shadow-sm border border-gray-200 dark:border-gray-700 p-5">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {children}
  </div>
);

const AdminOverview = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Stat label="Total Users" value="—" />
        <Stat label="Total Evaluations" value="—" />
        <Stat label="Average Grade" value="—" />
        <Stat label="Total Credits Used" value="—" />
        <Stat label="Active Users Today" value="—" />
        <Stat label="Completion Rate" value="—" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Evaluations Over Time</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Grade Distribution</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Question Types</div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 h-80">Subscription Status</div>
      </div>
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">Recent Activity</div>
    </div>
  );
};

export default AdminOverview;

