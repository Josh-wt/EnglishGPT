import React, { useMemo, useState } from 'react';
import { 
  Database, Users, FileText, MessageCircle, Search, Filter, ChevronDown, ChevronUp, Download, AlertCircle, Loader2 
} from 'lucide-react';
import DataTable from '../tables/DataTable';
import { useUsers } from '../../../hooks/admin/useUsers';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';
import { useFeedback } from '../../../hooks/admin/useFeedback';
import { getApiUrl } from '../../../utils/backendUrl';

const TABS = [
  { id: 'users', label: 'Users (assessment_users)', icon: Users, color: 'blue' },
  { id: 'evaluations', label: 'Evaluations (assessment_evaluations)', icon: FileText, color: 'green' },
  { id: 'feedback', label: 'Feedback (assessment_feedback)', icon: MessageCircle, color: 'purple' },
];

const ICONS = {
  users: Users,
  evaluations: FileText,
  feedback: MessageCircle,
};

const downloadCsv = (rows, columns, filename) => {
  const header = columns.map(c => `"${c.header}"`).join(',');
  const body = (rows || []).map(r => columns.map(c => `"${String(r[c.accessor] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const SearchSuggestion = ({ suggestion, onSelect, selected }) => (
  <div className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
    selected ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-md' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm'
  }`}>
    <div className="font-mono text-sm text-gray-900 dark:text-white mb-1">{suggestion.highlighted || suggestion.text}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
      <span className="capitalize">{suggestion.type}</span>
      <span>• {suggestion.score}% match</span>
    </div>
    <div className="text-xs text-gray-400 dark:text-gray-500">ID: {suggestion.id}</div>
  </div>
);

const FilterPanel = ({ title, children, open, onToggle }) => (
  <div className="mb-4">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">{children}</div>}
  </div>
);

const AdminDatabaseBrowser = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalResults, setGlobalResults] = useState(null);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  const [globalSearchSelected, setGlobalSearchSelected] = useState(0);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Tab-specific states
  const [tabFilters, setTabFilters] = useState({
    users: { plan: '', level: '', minCredits: '', maxCredits: '', createdFrom: '', createdTo: '' },
    evaluations: { types: '', userId: '', dateFrom: '', dateTo: '' },
    feedback: {}
  });

  const pageSize = 25;

  // Global Search
  const runGlobalSearch = async (value) => {
    setGlobalSearch(value);
    if (!value.trim()) {
      setGlobalResults(null);
      setGlobalSearchSelected(0);
      return;
    }

    try {
      setIsGlobalSearching(true);
      const sessionToken = localStorage.getItem('admin_session_token');
      const res = await fetch(`${getApiUrl()}/admin/search?q=${encodeURIComponent(value)}`, { 
        headers: { 'X-Admin-Session': sessionToken } 
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setGlobalResults(json);
      setGlobalSearchSelected(0);
    } catch (e) {
      console.error('Global search error', e);
      setGlobalResults({ error: String(e) });
      setGlobalSearchSelected(0);
    } finally {
      setIsGlobalSearching(false);
    }
  };

  // Tab-specific queries
  const usersQuery = useUsers({ 
    page, pageSize, 
    search: activeTab === 'users' ? globalSearch : '', 
    sortBy, sortDir,
    ...tabFilters.users 
  });

  const evalsQuery = useEvaluations({ 
    page, pageSize, 
    search: activeTab === 'evaluations' ? globalSearch : '', 
    sortBy, sortDir,
    ...tabFilters.evaluations 
  });

  const feedbackQuery = useFeedback({ 
    page, pageSize, 
    search: activeTab === 'feedback' ? globalSearch : '', 
    sortBy, sortDir 
  });

  const currentQuery = activeTab === 'users' ? usersQuery :
                       activeTab === 'evaluations' ? evalsQuery : feedbackQuery;

  const config = useMemo(() => {
    const queries = { users: usersQuery, evaluations: evalsQuery, feedback: feedbackQuery };
    const q = queries[activeTab];
    return {
      rows: q?.data?.data || [],
      count: q?.data?.count || 0,
      loading: q?.isLoading || false,
      error: q?.error
    };
  }, [activeTab, usersQuery, evalsQuery, feedbackQuery]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setGlobalSearch('');
  };

  const handleFilterChange = (tab, key, value) => {
    setTabFilters(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: value }
    }));
    setPage(1);
  };

  const clearFilters = (tab) => {
    setTabFilters(prev => ({
      ...prev,
      [tab]: {}
    }));
    setPage(1);
  };

  const allColumns = useMemo(() => {
    const usersCols = [
      { header: 'UID', accessor: 'uid', primary: true },
      { header: 'Name', accessor: 'display_name', primary: true },
      { header: 'Email', accessor: 'email' },
      { header: 'Phone', accessor: 'phone' },
      { header: 'Level', accessor: 'academic_level' },
      { header: 'Questions Marked', accessor: 'questions_marked' },
      { header: 'Credits', accessor: 'credits' },
      { header: 'Plan', accessor: 'current_plan' },
      { header: 'Created', accessor: 'created_at' },
      { header: 'Updated', accessor: 'updated_at' }
    ];

    const evalsCols = [
      { header: 'ID', accessor: 'id', primary: true },
      { header: 'Short ID', accessor: 'short_id' },
      { header: 'User ID', accessor: 'user_id' },
      { header: 'Type', accessor: 'question_type' },
      { header: 'Grade', accessor: 'grade' },
      { header: 'Reading', accessor: 'reading_marks' },
      { header: 'Writing', accessor: 'writing_marks' },
      { header: 'AO1', accessor: 'ao1_marks' },
      { header: 'AO2', accessor: 'ao2_marks' },
      { header: 'AO3', accessor: 'ao3_marks' },
      { header: 'Timestamp', accessor: 'timestamp' }
    ];

    const feedbackCols = [
      { header: 'ID', accessor: 'id', primary: true },
      { header: 'Evaluation ID', accessor: 'evaluation_id' },
      { header: 'User ID', accessor: 'user_id' },
      { header: 'Category', accessor: 'category' },
      { header: 'Accurate', accessor: 'accurate' },
      { header: 'Comments', accessor: 'comments' },
      { header: 'Created At', accessor: 'created_at' }
    ];

    return {
      users: usersCols,
      evaluations: evalsCols,
      feedback: feedbackCols
    };
  }, []);

  const currentColumns = allColumns[activeTab];

  const toolbar = (
    <div className="space-y-4">
      {/* Global Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 text-gray-400 ${isGlobalSearching ? 'animate-pulse' : ''}`} />
        </div>
        <input
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-all duration-200"
          placeholder="🔍 Search across all tables (users, evaluations, feedback)..."
          value={globalSearch}
          onChange={(e) => runGlobalSearch(e.target.value)}
        />
        {isGlobalSearching && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 rounded-t-xl overflow-hidden bg-white dark:bg-gray-800">
        {TABS.map((tab) => {
          const Icon = ICONS[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex-1 py-3 px-4 border-b-2 font-medium transition-all duration-200 relative
                ${isActive 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                <span className="text-sm">{tab.label}</span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab-specific Filters */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {activeTab === 'users' && (
          <FilterPanel title="Users Filter" open={tabFilters.users.plan !== '' || tabFilters.users.level !== ''} onToggle={() => {}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                <select 
                  value={tabFilters.users.plan} 
                  onChange={(e) => handleFilterChange('users', 'plan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Plans</option>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Level</label>
                <select 
                  value={tabFilters.users.level} 
                  onChange={(e) => handleFilterChange('users', 'level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="igcse">IGCSE</option>
                  <option value="alevel">A-Level</option>
                  <option value="gp">GP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Credits Range</label>
                <div className="flex space-x-2">
                  <input 
                    type="number"
                    placeholder="Min"
                    value={tabFilters.users.minCredits}
                    onChange={(e) => handleFilterChange('users', 'minCredits', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="number"
                    placeholder="Max"
                    value={tabFilters.users.maxCredits}
                    onChange={(e) => handleFilterChange('users', 'maxCredits', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Created Date</label>
                <div className="flex space-x-2">
                  <input 
                    type="date"
                    value={tabFilters.users.createdFrom}
                    onChange={(e) => handleFilterChange('users', 'createdFrom', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="date"
                    value={tabFilters.users.createdTo}
                    onChange={(e) => handleFilterChange('users', 'createdTo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => clearFilters('users')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </FilterPanel>
        )}

        {activeTab === 'evaluations' && (
          <FilterPanel title="Evaluations Filter" open={tabFilters.evaluations.types !== '' || tabFilters.evaluations.userId !== ''} onToggle={() => {}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Question Types</label>
                <input 
                  placeholder="e.g., essay, mcq"
                  value={tabFilters.evaluations.types}
                  onChange={(e) => handleFilterChange('evaluations', 'types', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</label>
                <input 
                  placeholder="Enter user UID"
                  value={tabFilters.evaluations.userId}
                  onChange={(e) => handleFilterChange('evaluations', 'userId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                <div className="flex space-x-2">
                  <input 
                    type="date"
                    value={tabFilters.evaluations.dateFrom}
                    onChange={(e) => handleFilterChange('evaluations', 'dateFrom', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="date"
                    value={tabFilters.evaluations.dateTo}
                    onChange={(e) => handleFilterChange('evaluations', 'dateTo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => clearFilters('evaluations')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </FilterPanel>
        )}

        {activeTab === 'feedback' && (
          <FilterPanel title="Feedback Filter" open={false} onToggle={() => {}}>
            <p className="text-sm text-gray-600 dark:text-gray-400">No specific filters available for feedback</p>
          </FilterPanel>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => downloadCsv(config.rows, currentColumns, `${activeTab}-export-${Date.now()}.csv`)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          disabled={config.rows.length === 0}
        >
          <Download className="w-4 h-4" />
          <span>Export {activeTab} ({config.rows.length} rows)</span>
        </button>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {Math.ceil(config.count / pageSize)} • {config.count.toLocaleString()} total records
      </div>
      <div className="flex space-x-2">
        <button 
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button 
          disabled={page * pageSize >= config.count}
          onClick={() => setPage(p => Math.min(Math.ceil(config.count / pageSize), p + 1))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  if (globalResults && !globalResults.error) {
    const { users = [], evaluations = [], feedback = [] } = globalResults;
    const totalResults = users.length + evaluations.length + feedback.length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Browser</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <span>{totalResults}</span>
              <span>results for "{globalSearch}"</span>
            </div>
            <button 
              onClick={() => { setGlobalSearch(''); setGlobalResults(null); }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              New Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Results */}
          {users.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Users ({users.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {users.map((user, index) => (
                  <SearchSuggestion 
                    key={user.uid}
                    suggestion={{ 
                      type: 'user', 
                      text: user.display_name || user.email, 
                      highlighted: user.display_name?.toLowerCase().includes(globalSearch.toLowerCase()) ? globalSearch : null,
                      id: user.uid,
                      score: 95 // Assume high score
                    }}
                    selected={false}
                    onSelect={() => handleTabChange('users')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Evaluations Results */}
          {evaluations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Evaluations ({evaluations.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {evaluations.map((eval, index) => (
                  <SearchSuggestion 
                    key={eval.id}
                    suggestion={{ 
                      type: 'evaluation', 
                      text: `${eval.question_type} - ${eval.grade}%`, 
                      highlighted: eval.question_type.toLowerCase().includes(globalSearch.toLowerCase()) ? globalSearch : null,
                      id: eval.short_id || eval.id,
                      score: 85
                    }}
                    selected={false}
                    onSelect={() => handleTabChange('evaluations')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Feedback Results */}
          {feedback.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Feedback ({feedback.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {feedback.map((fb, index) => (
                  <SearchSuggestion 
                    key={fb.id}
                    suggestion={{ 
                      type: 'feedback', 
                      text: `${fb.category} - ${fb.accurate ? 'Accurate' : 'Inaccurate'}`, 
                      highlighted: fb.comments?.toLowerCase().includes(globalSearch.toLowerCase()) ? globalSearch : null,
                      id: fb.id,
                      score: 75
                    }}
                    selected={false}
                    onSelect={() => handleTabChange('feedback')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {totalResults === 0 && (
          <div className="text-center py-12 col-span-full">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Try different keywords or check your spelling. The search covers all major tables in the database.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => { setGlobalSearch(''); setGlobalResults(null); }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                New Search
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <Database className="w-8 h-8 text-indigo-600" />
              <span>Database Browser</span>
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Explore and manage your database tables with powerful search and filtering
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Global Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="🔍 Search everything - users, evaluations, feedback, and more..."
                value={globalSearch}
                onChange={(e) => runGlobalSearch(e.target.value)}
              />
              {isGlobalSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner">
              {TABS.map((tab) => {
                const Icon = ICONS[tab.id];
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      flex-1 py-3 px-6 border-r last:border-r-0 font-medium transition-all duration-200 relative
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span className="text-sm">{tab.icon === Users ? 'Users' : tab.icon === FileText ? 'Evaluations' : 'Feedback'}</span>
                    </div>
                    {isActive && <div className="absolute inset-x-0 bottom-0 h-1 bg-white"></div>}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {config.loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">Loading {activeTab} data...</span>
                </div>
              ) : config.error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <div className="text-red-600 dark:text-red-400 mb-2">Error loading {activeTab} data</div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg mt-2"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Table
                    </h3>
                    <button 
                      onClick={() => downloadCsv(config.rows, currentColumns, `${activeTab}-data-${Date.now()}.csv`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                      disabled={config.rows.length === 0}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export ({config.rows.length} rows)</span>
                    </button>
                  </div>

                  {config.rows.length > 0 ? (
                    <DataTable 
                      columns={currentColumns} 
                      data={config.rows} 
                      loading={false} 
                      emptyMessage="" 
                      onSortChange={(c,d) => { setSortBy(c); setSortDir(d); setPage(1); }}
                      sortBy={sortBy} 
                      sortDir={sortDir}
                      page={page}
                      pageSize={pageSize}
                      totalCount={config.count}
                      onPageChange={setPage}
                      rowClassName="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No data available</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                        The {activeTab} table is currently empty or no records match your current filters.
                      </p>
                      <div className="flex justify-center space-x-3">
                        <button 
                          onClick={() => { setGlobalSearch(''); /* Reset other filters too */ }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Clear Search
                        </button>
                        <button 
                          onClick={() => window.location.reload()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                        >
                          Refresh Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          {!config.loading && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, config.count)} of {config.count.toLocaleString()} results
              </div>
              <div className="flex space-x-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <ChevronDown className="w-4 h-4 rotate-270" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button 
                  disabled={page * pageSize >= config.count}
                  onClick={() => setPage(p => Math.min(Math.ceil(config.count / pageSize), p + 1))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDatabaseBrowser;

