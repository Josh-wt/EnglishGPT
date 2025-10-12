import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import { useFeedback } from '../../../hooks/admin/useFeedback';
import { 
  ChatBubbleLeftRightIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const AdminFeedbackPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [accurate, setAccurate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 25;
  
  const { data, isLoading, isError, error } = useFeedback({ 
    page, 
    pageSize, 
    search, 
    category, 
    accurate 
  });

  const columns = useMemo(() => ([
    { 
      header: 'Evaluation', 
      accessor: 'evaluation.short_id', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-mono text-sm font-medium text-blue-600">
              {row.evaluation?.short_id || row.evaluation_id}
            </div>
            <div className="text-xs text-gray-500">
              {row.evaluation?.question_type || 'Unknown'}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'User', 
      accessor: 'user.display_name', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <UserIcon className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-sm text-gray-900 dark:text-white">
              {row.user?.display_name || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">
              {row.user?.email || row.user_id}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Category', 
      accessor: 'category',
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.category === 'feedback' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
          row.category === 'bug' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          row.category === 'suggestion' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {row.category || 'General'}
        </span>
      )
    },
    { 
      header: 'Accurate', 
      accessor: 'accurate', 
      cell: (row) => (
        <div className="flex items-center space-x-1">
          {row.accurate ? (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-700 dark:text-green-400 font-medium text-sm">Yes</span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-4 h-4 text-red-500" />
              <span className="text-red-700 dark:text-red-400 font-medium text-sm">No</span>
            </>
          )}
        </div>
      )
    },
    { 
      header: 'Grade', 
      accessor: 'evaluation.grade',
      cell: (row) => (
        <div className="text-sm font-medium">
          {row.evaluation?.grade ? (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              row.evaluation.grade >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              row.evaluation.grade >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {row.evaluation.grade}%
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      )
    },
    { 
      header: 'Comments', 
      accessor: 'comments',
      cell: (row) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 dark:text-white truncate" title={row.comments}>
            {row.comments || '—'}
          </div>
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: 'created_at',
      cell: (row) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date(row.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
  ]), []);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setAccurate('');
    setPage(1);
  };

  const activeFiltersCount = [search, category, accurate].filter(Boolean).length;

  const toolbar = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
            <span>Feedback Management</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review user feedback and suggestions to improve the platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            Total: {data?.count?.toLocaleString() ?? '—'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Search comments and feedback..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }} 
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="feedback">Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>

            {/* Accuracy Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accuracy
              </label>
              <select
                value={accurate}
                onChange={(e) => {
                  setAccurate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Accurate</option>
                <option value="false">Inaccurate</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="sm:col-span-2 lg:col-span-2 flex items-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Category: {category}
              <button onClick={() => setCategory('')} className="ml-1 text-green-600 hover:text-green-800">×</button>
            </span>
          )}
          {accurate && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Accuracy: {accurate === 'true' ? 'Accurate' : 'Inaccurate'}
              <button onClick={() => setAccurate('')} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
      <div className="flex items-center space-x-2">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {Math.ceil((data?.count || 0) / pageSize)}
        </span>
        <button 
          disabled={(data?.count || 0) <= page * pageSize} 
          onClick={() => setPage(p => p + 1)} 
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Next
        </button>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {Math.min((page - 1) * pageSize + 1, data?.count || 0)} to {Math.min(page * pageSize, data?.count || 0)} of {data?.count || 0} results
      </div>
    </div>
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load feedback</h3>
          <p className="text-gray-500 dark:text-gray-400">{error?.message || 'An error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable 
        columns={columns} 
        data={data?.data || []} 
        loading={isLoading} 
        toolbar={toolbar} 
        footer={footer} 
        emptyMessage="No feedback found. Try adjusting your search or filters." 
      />
    </div>
  );
};

export default AdminFeedbackPage;

