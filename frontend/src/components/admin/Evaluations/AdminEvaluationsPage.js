import React, { useState, useMemo } from 'react';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';
import EvaluationDetailModal from './EvaluationDetailModal';
import DataTable from '../tables/DataTable';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Award,
  Eye,
  Loader2,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';

// Simple UI Components (replacements for shadcn/ui)
const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    outline: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    ghost: 'bg-transparent text-gray-500 dark:text-gray-400'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

const Input = ({ id, type = 'text', placeholder, value, onChange, className = '', ...props }) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${className}`}
    {...props}
  />
);

const Select = ({ value, onValueChange, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
      >
        {children}
      </select>
      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const SelectTrigger = ({ children, className = '' }) => (
  <div className={`p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 ${className}`}>
    {children}
  </div>
);

const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;

const SelectContent = ({ children }) => (
  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
    {children}
  </div>
);

const Checkbox = ({ id, checked, onCheckedChange, className = '' }) => (
  <input
    id={id}
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${className}`}
  />
);

const Button = ({ children, variant = 'default', size = 'default', onClick, className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
    outline: 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
    ghost: 'px-2 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
  };
  
  const sizes = {
    default: 'text-sm',
    sm: 'px-3 py-1.5 text-xs'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Label = ({ htmlFor, children, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">{children}</div>;

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Simple Skeleton/Loading Component
const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
);

// Simple LongText Component
const LongText = ({ text, maxLength = 100, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  if (!text || typeof text !== 'string') {
    return <span className="text-gray-400 italic">No content</span>;
  }

  const displayText = isExpanded ? text : text.substring(0, maxLength);
  const shouldTruncate = text.length > maxLength && !isExpanded;
  const hasOverflow = shouldTruncate;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <p 
          className={`text-sm leading-relaxed ${hasOverflow && !isExpanded ? 'line-clamp-2' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {displayText}
          {shouldTruncate && (
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline ml-1" onClick={() => setIsExpanded(true)}>
              ... read more
            </span>
          )}
        </p>
        
        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto mb-3">
              {text}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Show less
            </Button>
          </div>
        )}
      </div>
      
      {isHovered && hasOverflow && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent h-6 pointer-events-none" />
      )}
    </div>
  );
};

const AdminEvaluationsPage = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [showDetails, setShowDetails] = useState(false);
  const [questionTypeFilter, setQuestionTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [gradeContainsFilter, setGradeContainsFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);

  const limit = 25;

  const { data, isLoading, error, refetch } = useEvaluations({
    page: page + 1, // useEvaluations expects 1-based page
    pageSize: limit,
    search,
    sortBy,
    sortDir,
    include: showDetails ? 'details' : 'basic',
    question_types: questionTypeFilter,
    user_id: userIdFilter,
    grade_contains: gradeContainsFilter,
    date_from: dateFromFilter,
    date_to: dateToFilter
  });

  const evaluations = data?.data || [];
  const totalCount = data?.count || 0;

  // Debug logging to see actual data structure
  React.useEffect(() => {
    if (evaluations.length > 0) {
      console.log('First evaluation:', evaluations[0]);
      console.log('Grade field:', evaluations[0]?.grade, typeof evaluations[0]?.grade);
    }
  }, [evaluations]);

  const columns = useMemo(() => [
    {
      id: 'short_id',
      accessor: 'short_id',
      header: 'Short ID',
      sortable: true,
      sortKey: 'short_id',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-mono text-sm"
          onClick={() => setSelectedEvaluationId(row.id)}
        >
          {row.short_id || row.id?.slice(-8) || 'N/A'}
        </Button>
      )
    },
    {
      id: 'user_id',
      accessor: 'user_id',
      header: 'User ID',
      cell: (row) => (
        <div className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
          {row.user_id?.slice(-8) || 'N/A'}
        </div>
      )
    },
    {
      id: 'question_type',
      accessor: 'question_type',
      header: 'Question Type',
      cell: (row) => (
        <Badge variant={
          row.question_type === 'essay' ? 'default' :
          row.question_type === 'mcq' ? 'secondary' :
          row.question_type === 'comprehension' ? 'outline' : 'ghost'
        }>
          {row.question_type || 'Unknown'}
        </Badge>
      )
    },
    {
      id: 'timestamp',
      accessor: 'timestamp',
      header: 'Date',
      sortable: true,
      sortKey: 'timestamp',
      cell: (row) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.timestamp ? new Date(row.timestamp).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      id: 'grade',
      accessor: 'grade',
      header: 'Grade',
      sortable: true,
      sortKey: 'grade',
      cell: (row) => {
        const grade = row.grade;
        
        // Handle null/undefined/empty grades
        if (grade === null || grade === undefined || grade === '') {
          return <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>;
        }
        
        // Handle string grades like "85/100" or "85%"
        let gradeValue = null;
        if (typeof grade === 'string') {
          if (grade.includes('/')) {
            // Handle "85/100" format
            const [numerator, denominator] = grade.split('/');
            const num = parseFloat(numerator);
            const den = parseFloat(denominator);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              gradeValue = (num / den) * 100;
            }
          } else if (grade.includes('%')) {
            // Handle "85%" format
            gradeValue = parseFloat(grade.replace('%', ''));
          } else {
            // Handle plain number as string
            gradeValue = parseFloat(grade);
          }
        } else if (typeof grade === 'number') {
          gradeValue = grade;
        }
        
        // Check if we got a valid number
        if (isNaN(gradeValue) || gradeValue === null) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">Invalid</span>;
        }
        
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(Math.max(gradeValue, 0), 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {gradeValue.toFixed(1)}%
            </span>
          </div>
        );
      }
    },
    ...(showDetails ? [
      {
        id: 'student_response',
        accessor: 'student_response',
        header: 'Essay',
        longText: true,
        max: 100,
        cell: (row) => {
          // Ensure we're passing a string, not an object
          const text = row.student_response;
          if (typeof text === 'object') {
            return <span className="text-gray-400 italic">Complex data</span>;
          }
          return text || '';
        }
      },
      {
        id: 'improvement_suggestions',
        accessor: 'improvement_suggestions', 
        header: 'Improvements',
        longText: true,
        max: 80,
        cell: (row) => {
          const text = row.improvement_suggestions;
          if (typeof text === 'object') {
            return <span className="text-gray-400 italic">Complex data</span>;
          }
          return text || '';
        }
      },
      {
        id: 'strengths',
        accessor: 'strengths',
        header: 'Strengths',
        longText: true,
        max: 80,
        cell: (row) => {
          const text = row.strengths;
          if (typeof text === 'object') {
            return <span className="text-gray-400 italic">Complex data</span>;
          }
          return text || '';
        }
      },
      {
        id: 'feedback',
        accessor: 'feedback',
        header: 'Feedback',
        longText: true,
        max: 120,
        cell: (row) => {
          const text = row.feedback;
          if (typeof text === 'object') {
            return <span className="text-gray-400 italic">Complex data</span>;
          }
          return text || '';
        }
      }
    ] : []),
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedEvaluationId(row.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [showDetails]);

  const handleClearFilters = () => {
    setSearch('');
    setQuestionTypeFilter('');
    setUserIdFilter('');
    setGradeContainsFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setPage(0);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-4">Error loading evaluations</div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={refetch} className="mr-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluations</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {totalCount} total evaluations •{' '}
              {showDetails ? 'Showing detailed view' : 'Showing basic view'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button onClick={refetch} variant="outline" size="sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search evaluations by ID, user, or content..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filters</span>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select value={questionTypeFilter} onValueChange={setQuestionTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="comprehension">Comprehension</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID..."
                  value={userIdFilter}
                  onChange={(e) => {
                    setUserIdFilter(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade Contains</Label>
                <Input
                  id="grade"
                  placeholder="e.g., 85"
                  value={gradeContainsFilter}
                  onChange={(e) => {
                    setGradeContainsFilter(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => {
                    setDateFromFilter(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => {
                    setDateToFilter(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showDetails"
                    checked={showDetails}
                    onCheckedChange={setShowDetails}
                  />
                  <Label htmlFor="showDetails" className="font-normal">
                    Show detailed view (essays, feedback, etc.)
                  </Label>
                </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <Select 
                      value={`${sortBy}-${sortDir}`} 
                      onValueChange={(value) => {
                        const [newSortBy, newSortDir] = value.split('-');
                        setSortBy(newSortBy);
                        setSortDir(newSortDir);
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timestamp-desc">Newest First</SelectItem>
                        <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                        <SelectItem value="grade-desc">Highest Grade</SelectItem>
                        <SelectItem value="grade-asc">Lowest Grade</SelectItem>
                        <SelectItem value="question_type-asc">Type A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Evaluations Table</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <LoadingSkeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No evaluations found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {search || questionTypeFilter || userIdFilter || gradeContainsFilter ? 'Try adjusting your filters or search terms.' : 'No evaluations yet.'}
              </p>
              <Button onClick={refetch} variant="outline">
                Refresh Data
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={evaluations}
              loading={isLoading}
              onSortChange={(sortKey, sortDirection) => {
                setSortBy(sortKey);
                setSortDir(sortDirection);
                setPage(0);
              }}
              sortBy={sortBy}
              sortDir={sortDir}
              emptyMessage={
                search || questionTypeFilter || userIdFilter || gradeContainsFilter 
                  ? 'No evaluations match your filters.' 
                  : 'No evaluations found.'
              }
              footer={
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {Math.min(page * limit + 1, totalCount)} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0 || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {page + 1} of {Math.ceil(totalCount / limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalCount / limit) - 1 || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Evaluation Detail Modal */}
      <EvaluationDetailModal
        evaluationId={selectedEvaluationId}
        open={!!selectedEvaluationId}
        onClose={() => setSelectedEvaluationId(null)}
      />
    </div>
  );
};

export default AdminEvaluationsPage;

