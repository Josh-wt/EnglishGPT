import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import EvaluationDetailModal from './EvaluationDetailModal';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';

const AdminEvaluationsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [showDetails, setShowDetails] = useState(false);
  const pageSize = 25;
  const { data, isLoading } = useEvaluations({ page, pageSize, search, sortBy, sortDir, include: showDetails ? 'details' : 'basic' });
  const [selectedEvalId, setSelectedEvalId] = useState(null);

  const columns = useMemo(() => ([
    { header: 'Short ID', accessor: 'short_id', cell: (row) => (
      <button className="text-blue-600 hover:underline font-mono" onClick={() => setSelectedEvalId(row.id)}>{row.short_id || row.id}</button>
    ) },
    { header: 'User', accessor: 'user_id' },
    { header: 'Question Type', accessor: 'question_type' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Reading', accessor: 'reading_marks' },
    { header: 'Writing', accessor: 'writing_marks' },
    { header: 'AO1', accessor: 'ao1_marks' },
    { header: 'AO2', accessor: 'ao2_marks' },
    { header: 'AO3', accessor: 'ao3_marks' },
    ...(showDetails ? [
      { header: 'Essay', accessor: 'student_response', cell: (row) => <div className="max-w-xs truncate" title={row.student_response}>{row.student_response}</div> },
      { header: 'Improvements', accessor: 'improvement_suggestions', cell: (row) => Array.isArray(row.improvement_suggestions) ? row.improvement_suggestions.join(' | ') : row.improvement_suggestions },
      { header: 'Strengths', accessor: 'strengths', cell: (row) => Array.isArray(row.strengths) ? row.strengths.join(' | ') : row.strengths },
      { header: 'Feedback', accessor: 'feedback', cell: (row) => <div className="max-w-xs truncate" title={row.feedback}>{row.feedback}</div> },
    ] : []),
    { header: 'Date', accessor: 'timestamp' },
  ]), [showDetails]);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2 w-64" placeholder="Search evaluations" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        <select className="border rounded px-2 py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="timestamp">Date</option>
          <option value="grade">Grade</option>
          <option value="question_type">Question Type</option>
        </select>
        <select className="border rounded px-2 py-2" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} /> Show details</label>
      </div>
      <div className="text-sm text-gray-500">Total: {data?.count ?? '—'}</div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Prev</button>
      <div className="text-sm">Page {page}</div>
      <button disabled={(data?.count || 0) <= page * pageSize} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evaluations</h1>
      </div>
      <DataTable columns={columns} data={data?.data} loading={isLoading} toolbar={toolbar} footer={footer} emptyMessage="No evaluations found" />
      <EvaluationDetailModal evaluationId={selectedEvalId} open={!!selectedEvalId} onClose={() => setSelectedEvalId(null)} />
    </div>
  );
};

export default AdminEvaluationsPage;

