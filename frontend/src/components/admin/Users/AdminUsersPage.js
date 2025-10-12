import React, { useMemo, useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, BadgeCheck, Clock, UserCheck, Zap, Shield, Users } from 'lucide-react';
import DataTable from '../tables/DataTable';
import UserDetailModal from './UserDetailModal';
import { useUsers } from '../../../hooks/admin/useUsers';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [subscription, setSubscription] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [minCredits, setMinCredits] = useState('');
  const [maxCredits, setMaxCredits] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 25;
  const { data, isLoading } = useUsers({ 
    page, 
    pageSize, 
    search, 
    sortBy, 
    sortDir, 
    subscription, 
    academic_level: academicLevel, 
    min_credits: minCredits ? Number(minCredits) : undefined, 
    max_credits: maxCredits ? Number(maxCredits) : undefined, 
    created_from: createdFrom, 
    created_to: createdTo 
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const activeFilters = useMemo(() => ({
    subscription: subscription,
    academicLevel,
    minCredits,
    maxCredits,
    createdFrom,
    createdTo
  }), [subscription, academicLevel, minCredits, maxCredits, createdFrom, createdTo]);

  const hasActiveFilters = Object.values(activeFilters).some(v => v);

  const clearAllFilters = () => {
    setSubscription('');
    setAcademicLevel('');
    setMinCredits('');
    setMaxCredits('');
    setCreatedFrom('');
    setCreatedTo('');
    setSearch('');
    setPage(1);
  };

  const columns = useMemo(() => ([
    { 
      header: 'UID', 
      accessor: 'uid', 
      width: '12%', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-800 font-mono text-sm truncate max-w-[120px]" 
            onClick={(e) => { e.stopPropagation(); setSelectedUserId(row.uid); }}
          >
            {row.uid}
          </button>
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 -m-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === row.uid ? null : row.uid); }}
          >
            {expandedRow === row.uid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      ) 
    },
    { 
      header: 'Name', 
      accessor: 'display_name', 
      cell: (row) => (
        <div className="font-medium text-gray-900 dark:text-white truncate">{row.display_name || 'N/A'}</div>
      )
    },
    { 
      header: 'Email', 
      accessor: 'email', 
      cell: (row) => <div className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{row.email}</div> 
    },
    { 
      header: 'Phone', 
      accessor: 'phone', 
      cell: (row) => <div className="text-gray-500 dark:text-gray-400">{row.phone || '—'}</div> 
    },
    { 
      header: 'Level', 
      accessor: 'academic_level', 
      cell: (row) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row.academic_level === 'igcse' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
          row.academic_level === 'alevel' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          row.academic_level === 'gp' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {row.academic_level?.toUpperCase() || '—'}
        </span>
      )
    },
    { 
      header: 'Questions', 
      accessor: 'questions_marked', 
      cell: (row) => (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
            row.questions_marked > 50 ? 'bg-green-100 text-green-800' : 
            row.questions_marked > 10 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {row.questions_marked || 0}
          </span>
        </div>
      )
    },
    { 
      header: 'Credits', 
      accessor: 'credits', 
      cell: (row) => (
        <div className={`text-center font-mono ${
          row.credits < 10 ? 'text-red-600' : 
          row.credits < 100 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {row.credits || 0}
        </div>
      )
    },
    { 
      header: 'Plan', 
      accessor: 'current_plan', 
      cell: (row) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          row.current_plan === 'pro' || row.current_plan === 'enterprise' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          row.current_plan === 'starter' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {row.current_plan === 'pro' && <Zap className="w-3 h-3 mr-1" />}
          {row.current_plan === 'enterprise' && <Shield className="w-3 h-3 mr-1" />}
          {row.current_plan?.charAt(0).toUpperCase() + row.current_plan?.slice(1) || 'Free'}
        </span>
      )
    },
    { 
      header: 'Joined', 
      accessor: 'created_at', 
      cell: (row) => <div className="text-sm text-gray-500">{new Date(row.created_at).toLocaleDateString()}</div> 
    },
  ]), [expandedRow]);

  const expandedRowRender = (row) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-gray-500">Last Active</div>
          <div className="font-medium">{row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'Never'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Total Spent</div>
          <div className="font-medium">${(row.total_spent || 0).toLocaleString()}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Evaluations</div>
          <div className="font-medium">{row.evaluations_count || 0}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Avg Grade</div>
          <div className="font-medium">{row.avg_grade ? `${row.avg_grade.toFixed(1)}%` : '—'}</div>
        </div>
      </div>
      {row.recent_activity && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Recent Activity</div>
          <div className="space-y-2 max-h-20 overflow-y-auto">
            {row.recent_activity.slice(0, 3).map((act, i) => (
              <div key={i} className="flex items-center space-x-3 text-xs">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div>{act.action} on {new Date(act.timestamp).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const toolbar = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder="Search by name, email, or phone..." 
              value={search} 
              onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="created_at">Sort by Created</option>
              <option value="updated_at">Updated</option>
              <option value="display_name">Name</option>
              <option value="email">Email</option>
              <option value="credits">Credits</option>
              <option value="questions_marked">Questions</option>
              <option value="current_plan">Plan</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              value={sortDir} 
              onChange={(e) => { setSortDir(e.target.value); setPage(1); }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filters ({Object.values(activeFilters).filter(v => v).length})
            </button>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold">{data?.count?.toLocaleString() || '—'}</span> users
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {/* Plan Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subscription Plan</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              value={subscription} 
              onChange={(e) => { setSubscription(e.target.value); setPage(1); }}
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Academic Level */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Academic Level</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              value={academicLevel} 
              onChange={(e) => { setAcademicLevel(e.target.value); setPage(1); }}
            >
              <option value="">All Levels</option>
              <option value="igcse">IGCSE</option>
              <option value="alevel">A-Level</option>
              <option value="gp">GP</option>
            </select>
          </div>

          {/* Credits Range */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Credits Range</label>
            <div className="flex gap-3">
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                type="number" 
                placeholder="Min" 
                value={minCredits} 
                onChange={(e) => setMinCredits(e.target.value)} 
              />
              <span className="px-2 py-2 text-gray-400 self-center">to</span>
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                type="number" 
                placeholder="Max" 
                value={maxCredits} 
                onChange={(e) => setMaxCredits(e.target.value)} 
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created Date Range</label>
            <div className="flex gap-3">
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                type="date" 
                value={createdFrom} 
                onChange={(e) => setCreatedFrom(e.target.value)} 
              />
              <span className="px-2 py-2 text-gray-400 self-center">to</span>
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                type="date" 
                value={createdTo} 
                onChange={(e) => setCreatedTo(e.target.value)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {subscription && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Plan: {subscription}
              <button onClick={() => setSubscription('')} className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400">&times;</button>
            </span>
          )}
          {academicLevel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Level: {academicLevel}
              <button onClick={() => setAcademicLevel('')} className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400">&times;</button>
            </span>
          )}
          {minCredits && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Min Credits: {minCredits}
              <button onClick={() => setMinCredits('')} className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400">&times;</button>
            </span>
          )}
          {maxCredits && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Max Credits: {maxCredits}
              <button onClick={() => setMaxCredits('')} className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400">&times;</button>
            </span>
          )}
          {(createdFrom || createdTo) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              Date: {createdFrom} to {createdTo}
              <button onClick={() => { setCreatedFrom(''); setCreatedTo(''); }} className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">&times;</button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data?.count || 0)} of {data?.count?.toLocaleString() || '—'} users
      </div>
      <div className="flex items-center gap-2">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:hover:bg-transparent"
        >
          <ChevronDown className="w-4 h-4 rotate-270" />
        </button>
        <span className="px-3 py-2 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg">
          Page {page}
        </span>
        <button 
          disabled={(data?.count || 0) <= page * pageSize} 
          onClick={() => setPage(p => p + 1)} 
          className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:hover:bg-transparent"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button 
          onClick={clearAllFilters}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          disabled={!hasActiveFilters}
        >
          {hasActiveFilters ? 'Reset All' : 'No Filters'}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <div className="h-12 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all registered users with advanced filtering</p>
        </div>
        <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
          {data?.count?.toLocaleString() || 0} users
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.data || []} 
        loading={isLoading} 
        toolbar={toolbar} 
        footer={footer} 
        emptyMessage={
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            <button 
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
      </div>
        } 
        onSortChange={(c,d)=>{setSortBy(c);setSortDir(d);setPage(1);}} 
        sortBy={sortBy} 
        sortDir={sortDir}
        expandable={true}
        expandedRowRender={expandedRowRender}
        expandedRowId={expandedRow}
        rowClassName={(index) => index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
        }
        rowHoverClassName="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      />

      <UserDetailModal userId={selectedUserId} open={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};

export default AdminUsersPage;

