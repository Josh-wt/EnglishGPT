import React, { useState, useMemo } from 'react';
import { useAdminDashboard } from '../../../hooks/admin/useAdminDashboard';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';
import EvaluationDetailModal from './EvaluationDetailModal';
import DataTable from '../tables/DataTable';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar, 
  User, 
  FileText, 
  Award,
  TrendingUp,
  ChevronUpDown,
  Eye,
  Loader2,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Copy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
  const offset = page * limit;

  const { data, isLoading, error, refetch } = useEvaluations({
    limit,
    offset,
    search,
    sortBy,
    sortDir,
    include: showDetails ? 'details' : 'basic',
    questionTypes: questionTypeFilter,
    userId: userIdFilter,
    gradeContains: gradeContainsFilter,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter
  });

  const evaluations = data?.data || [];
  const totalCount = data?.count || 0;

  const columns = useMemo(() => [
    {
      accessorKey: 'short_id',
      header: ({ column, headerTable: { getIsSorted } }) => (
        <Button
          variant="ghost"
          onClick={column.getToggleSortingHandler()}
          className="flex items-center space-x-1"
        >
          <FileText className="w-4 h-4" />
          <span>Short ID</span>
          <ChevronUpDown className={`w-4 h-4 ${getIsSorted() === 'asc' ? 'rotate-180' : ''}`} />
        </Button>
      ),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-mono text-sm"
          onClick={() => setSelectedEvaluationId(row.original.id)}
        >
          {row.original.short_id || row.original.id?.slice(-8) || 'N/A'}
        </Button>
      ),
      enableSorting: true,
      size: 120
    },
    {
      accessorKey: 'user_uid',
      header: 'User UID',
      cell: ({ row }) => (
        <div className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
          {row.original.user_uid?.slice(-8) || 'N/A'}
        </div>
      ),
      size: 140
    },
    {
      accessorKey: 'question_type',
      header: 'Question Type',
      cell: ({ row }) => (
        <Badge variant={
          row.original.question_type === 'essay' ? 'default' :
          row.original.question_type === 'mcq' ? 'secondary' :
          row.original.question_type === 'comprehension' ? 'outline' : 'ghost'
        }>
          {row.original.question_type || 'Unknown'}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return row.getValue(id).toLowerCase().includes(value.toLowerCase());
      }
    },
    {
      accessorKey: 'timestamp',
      header: ({ column, headerTable: { getIsSorted } }) => (
        <Button
          variant="ghost"
          onClick={column.getToggleSortingHandler()}
          className="flex items-center space-x-1"
        >
          <Calendar className="w-4 h-4" />
          <span>Date</span>
          <ChevronUpDown className={`w-4 h-4 ${getIsSorted() === 'asc' ? 'rotate-180' : ''}`} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.original.timestamp ? new Date(row.original.timestamp).toLocaleDateString() : 'N/A'}
        </div>
      ),
      enableSorting: true,
      size: 140
    },
    {
      accessorKey: 'grade',
      header: ({ column, headerTable: { getIsSorted } }) => (
        <Button
          variant="ghost"
          onClick={column.getToggleSortingHandler()}
          className="flex items-center space-x-1"
        >
          <Award className="w-4 h-4" />
          <span>Grade</span>
          <ChevronUpDown className={`w-4 h-4 ${getIsSorted() === 'asc' ? 'rotate-180' : ''}`} />
        </Button>
      ),
      cell: ({ row }) => {
        const grade = row.original.grade;
        if (grade === null || grade === undefined || isNaN(grade)) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>;
        }
        const gradeValue = parseFloat(grade);
        if (isNaN(gradeValue)) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">Invalid</span>;
        }
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(gradeValue, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {gradeValue.toFixed(1)}%
            </span>
          </div>
        );
      },
      enableSorting: true,
      size: 160
    },
    ...(showDetails ? [
      {
        accessorKey: 'student_response',
        header: 'Essay',
        cell: ({ row }) => (
          <LongText 
            text={row.original.student_response} 
            maxLength={100}
            className="max-w-xs"
          />
        ),
        size: 200
      },
      {
        accessorKey: 'improvement_suggestions',
        header: 'Improvements',
        cell: ({ row }) => (
          <LongText 
            text={row.original.improvement_suggestions} 
            maxLength={80}
            className="max-w-sm"
          />
        ),
        size: 180
      },
      {
        accessorKey: 'strengths',
        header: 'Strengths',
        cell: ({ row }) => (
          <LongText 
            text={row.original.strengths} 
            maxLength={80}
            className="max-w-sm"
          />
        ),
        size: 180
      },
      {
        accessorKey: 'feedback',
        header: 'Feedback',
        cell: ({ row }) => (
          <LongText 
            text={row.original.feedback} 
            maxLength={120}
            className="max-w-md"
          />
        ),
        size: 220
      }
    ] : []),
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedEvaluationId(row.original.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      size: 80
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
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
                  <SelectTrigger id="questionType">
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
                <Skeleton key={i} className="h-12 w-full" />
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
              pageSize={limit}
              pageIndex={page}
              onPageChange={setPage}
              totalCount={totalCount}
              isLoading={isLoading}
              searchable={false}
              sortable={true}
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

