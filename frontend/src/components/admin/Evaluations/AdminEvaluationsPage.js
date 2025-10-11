import React, { useMemo, useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Award, TrendingUp, Calendar, Clock, Zap, BookOpen } from 'lucide-react';
import DataTable from '../tables/DataTable';
import EvaluationDetailModal from './EvaluationDetailModal';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';

const AdminEvaluationsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [showDetails, setShowDetails] = useState(false);
  const [questionTypes, setQuestionTypes] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [gradeContains, setGradeContains] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 25;
  const { data, isLoading } = useEvaluations({ 
    page, 
    pageSize, 
    search, 
    sortBy, 
    sortDir, 
    include: showDetails ? 'details' : 'basic', 
    question_types: questionTypes, 
    user_id: userFilter, 
    date_from: dateFrom, 
    date_to: dateTo, 
    grade_contains: gradeContains 
  });
  const [selectedEvalId, setSelectedEvalId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const activeFilters = useMemo(() => ({
    questionTypes,
    userFilter,
    dateFrom,
    dateTo,
    gradeContains
  }), [questionTypes, userFilter, dateFrom, dateTo, gradeContains]);

  const hasActiveFilters = Object.values(activeFilters).some(v => v);

  const clearAllFilters = () => {
    setQuestionTypes('');
    setUserFilter('');
    setDateFrom('');
    setDateTo('');
    setGradeContains('');
    setSearch('');
    setPage(1);
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (grade >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (grade >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  const columns = useMemo(() => ([
    { 
      header: 'ID', 
      accessor: 'short_id', 
      width: '10%', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-800 font-mono text-sm truncate" 
            onClick={(e) => { e.stopPropagation(); setSelectedEvalId(row.id); }}
          >
            {row.short_id || row.id?.slice(-8)}
          </button>
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 -m-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === row.id ? null : row.id); }}
          >
            {expandedRow === row.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      ) 
    },
    { 
      header: 'User', 
      accessor: 'user_id', 
      width: '12%', 
      cell: (row) => <div className="font-medium text-gray-900 dark:text-white truncate">{row.user_display_name || row.user_id}</div> 
    },
    { 
      header: 'Type', 
      accessor: 'question_type', 
      width: '10%', 
      cell: (row) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
          row.question_type === 'essay' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
          row.question_type === 'comprehension' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          row.question_type === 'mcq' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {row.question_type}
        </span>
      )
    },
    { 
      header: 'Overall Grade', 
      accessor: 'grade', 
      width: '10%', 
      sortable: true,
      sortKey: 'grade',
      cell: (row) => (
        <div className="flex items-center justify-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(row.grade || 0)}`}>
            {(row.grade || 0).toFixed(1)}%
          </div>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-2 rounded-full" 
              style={{ width: `${row.grade || 0}%` }}
            ></div>
          </div>
        </div>
      )
    },
    { 
      header: 'Reading', 
      accessor: 'reading_marks', 
      width: '8%', 
      cell: (row) => (
        <span className={`text-xs px-2 py-1 rounded ${getGradeColor((row.reading_marks || 0) * 10)}`}>
          {(row.reading_marks || 0) * 10}%
        </span>
      )
    },
    { 
      header: 'Writing', 
      accessor: 'writing_marks', 
      width: '8%', 
      cell: (row) => (
        <span className={`text-xs px-2 py-1 rounded ${getGradeColor((row.writing_marks || 0) * 10)}`}>
          {(row.writing_marks || 0) * 10}%
        </span>
      )
    },
    { 
      header: 'AO1', 
      accessor: 'ao1_marks', 
      width: '6%', 
      cell: (row) => <div className="text-center text-sm">{row.ao1_marks || '—'}</div> 
    },
    { 
      header: 'AO2', 
      accessor: 'ao2_marks', 
      width: '6%', 
      cell: (row) => <div className="text-center text-sm">{row.ao2_marks || '—'}</div> 
    },
    { 
      header: 'AO3', 
      accessor: 'ao3_marks', 
      width: '6%', 
      cell: (row) => <div className="text-center text-sm">{row.ao3_marks || '—'}</div> 
    },
    ...(showDetails ? [
      { 
        header: 'Essay', 
        accessor: 'student_response', 
        width: '15%', 
        longText: true, 
        cell: (row) => row.student_response ? (
          <div className="text-xs max-h-16 overflow-hidden" title={row.student_response}>
            {row.student_response.substring(0, 100)}...
          </div>
        ) : '—'
      },
      { 
        header: 'Improvements', 
        accessor: 'improvement_suggestions', 
        width: '12%', 
        longText: true, 
        cell: (row) => {
          const suggestions = Array.isArray(row.improvement_suggestions) ? row.improvement_suggestions : [row.improvement_suggestions].filter(Boolean);
          return suggestions.length > 0 ? (
            <div className="space-y-1">
              {suggestions.slice(0, 2).map((s, i) => (
                <div key={i} className="text-xs bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border-l-4 border-yellow-400">
                  • {s}
                </div>
              ))}
              {suggestions.length > 2 && <div className="text-xs text-gray-500">+{suggestions.length - 2} more</div>}
            </div>
          ) : '—'
        }
      },
      { 
        header: 'Strengths', 
        accessor: 'strengths', 
        width: '12%', 
        longText: true, 
        cell: (row) => {
          const strengths = Array.isArray(row.strengths) ? row.strengths : [row.strengths].filter(Boolean);
          return strengths.length > 0 ? (
            <div className="space-y-1">
              {strengths.slice(0, 2).map((s, i) => (
                <div key={i} className="text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border-l-4 border-green-400">
                  • {s}
                </div>
              ))}
              {strengths.length > 2 && <div className="text-xs text-gray-500">+{strengths.length - 2} more</div>}
            </div>
          ) : '—'
        }
      },
      { 
        header: 'Feedback', 
        accessor: 'feedback', 
        width: '15%', 
        longText: true, 
        cell: (row) => row.feedback ? (
          <div className="text-xs max-h-16 overflow-hidden" title={row.feedback}>
            {row.feedback.substring(0, 100)}...
          </div>
        ) : '—'
      },
    ] : []),
    { 
      header: 'Date', 
      accessor: 'timestamp', 
      width: '12%', 
      sortable: true, 
      sortKey: 'timestamp',
      cell: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(row.timestamp).toLocaleDateString()}</span>
        </div>
      )
    },
  ]), [showDetails, expandedRow, getGradeColor]);

  const expandedRowRender = (row) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase">User Details</div>
          <div className="text-sm font-semibold">{row.user_display_name || row.user_id}</div>
          <div className="text-xs text-gray-500">{row.user_email || '—'}</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase">Question</div>
          <div className="text-sm">{row.question_prompt?.substring(0, 100) || '—'}...</div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase">Response Length</div>
          <div className="text-sm">{row.response_length || '—'} words</div>
        </div>
      </div>
      {showDetails && row.student_response && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Student Response Preview</div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border max-h-32 overflow-y-auto text-sm prose dark:prose-invert">
            {row.student_response.substring(0, 300)}...
          </div>
        </div>
      )}
      <div className="flex justify-end mt-4 space-x-2">
        <button 
          onClick={() => setSelectedEvalId(row.id)} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          View Full Details
        </button>
      </div>
    </div>
  );

  const onSortChange = (col, dir) => {
    setSortBy(col); 
    setSortDir(dir); 
    setPage(1);
  };

  const toolbar = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder="Search evaluations by ID, user, or content..." 
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
              <option value="timestamp">Sort by Date</option>
              <option value="grade">Grade</option>
              <option value="question_type">Question Type</option>
              <option value="user_id">User</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              value={sortDir} 
              onChange={(e) => { setSortDir(e.target.value); setPage(1); }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" 
                checked={showDetails} 
                onChange={(e) => setShowDetails(e.target.checked)} 
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Details</span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Clear ({Object.values(activeFilters).filter(v => v).length})
            </button>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {data?.count?.toLocaleString() || 0} evaluations
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Question Types</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              placeholder="e.g., essay, mcq (comma separated)" 
              value={questionTypes} 
              onChange={(e) => { setQuestionTypes(e.target.value); setPage(1); }} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">User ID</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              placeholder="Enter user UID" 
              value={userFilter} 
              onChange={(e) => { setUserFilter(e.target.value); setPage(1); }} 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date Range</label>
            <div className="flex gap-3">
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                type="date" 
                value={dateFrom} 
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} 
              />
              <span className="px-2 py-2 text-gray-400 self-center">to</span>
              <input 
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                type="date" 
                value={dateTo} 
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grade Contains</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              type="text" 
              placeholder="e.g., 70-80, A, good" 
              value={gradeContains} 
              onChange={(e) => { setGradeContains(e.target.value); setPage(1); }} 
            />
          </div>
        </div>
      )}

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 pb-4">
          {questionTypes && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Types: {questionTypes}
              <button onClick={() => setQuestionTypes('')} className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400">&times;</button>
            </span>
          )}
          {userFilter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              User: {userFilter}
              <button onClick={() => setUserFilter('')} className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400">&times;</button>
            </span>
          )}
          {gradeContains && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Grade: {gradeContains}
              <button onClick={() => setGradeContains('')} className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400">&times;</button>
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              Date: {dateFrom || 'Start'} to {dateTo || 'Now'}
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">&times;</button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data?.count || 0)} of {data?.count?.toLocaleString() || '—'} evaluations
      </div>
      <div className="flex items-center gap-2">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors disabled:hover:bg-transparent flex items-center space-x-1"
        >
          <ChevronDown className="w-4 h-4 rotate-270" />
          <span>Previous</span>
        </button>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors disabled:hover:bg-transparent"
          >
            1
          </button>
          {page > 2 && (
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
          )}
          <button 
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors disabled:hover:bg-transparent"
          >
            {page}
          </button>
          <button 
            onClick={() => setPage(Math.min(Math.ceil((data?.count || 0) / pageSize), page + 1))}
            disabled={(data?.count || 0) <= page * pageSize}
            className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors disabled:hover:bg-transparent"
          >
            {Math.min(Math.ceil((data?.count || 0) / pageSize), page + 1)}
          </button>
          {page < Math.ceil((data?.count || 0) / pageSize) - 1 && (
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
          )}
          <button 
            onClick={() => setPage(Math.ceil((data?.count || 0) / pageSize))}
            disabled={(data?.count || 0) <= page * pageSize}
            className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors disabled:hover:bg-transparent"
          >
            {Math.ceil((data?.count || 0) / pageSize)}
          </button>
        </div>
        
        <button 
          disabled={(data?.count || 0) <= page * pageSize} 
          onClick={() => setPage(p => p + 1)} 
          className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors disabled:hover:bg-transparent flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <button 
          onClick={clearAllFilters}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors ml-2"
          disabled={!hasActiveFilters}
        >
          {hasActiveFilters ? `Reset (${Object.values(activeFilters).filter(v => v).length})` : 'No Filters'}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <div className="h-12 w-full max-w-lg bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ml-auto"></div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluations Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and analyze all student evaluations with detailed insights</p>
        </div>
        <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
          {data?.count?.toLocaleString() || 0} evaluations
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
            <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No evaluations found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              There are no evaluations matching your current filters. Try adjusting your search criteria or 
              <button onClick={clearAllFilters} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium ml-1">
                clear all filters
              </button>
              to see all data.
            </p>
          </div>
        } 
        onSortChange={onSortChange} 
        sortBy={sortBy} 
        sortDir={sortDir}
        expandable={true}
        expandedRowRender={expandedRowRender}
        expandedRowId={expandedRow}
        rowClassName={(index) => index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
        rowHoverClassName="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
      />

      <EvaluationDetailModal evaluationId={selectedEvalId} open={!!selectedEvalId} onClose={() => setSelectedEvalId(null)} />
    </div>
  );
};

export default AdminEvaluationsPage;

