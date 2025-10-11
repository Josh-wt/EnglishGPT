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
  const [questionTypes, setQuestionTypes] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [gradeContains, setGradeContains] = useState('');
  const pageSize = 25;
  const { data, isLoading } = useEvaluations({ page, pageSize, search, sortBy, sortDir, include: showDetails ? 'details' : 'basic', question_types: questionTypes, user_id: userFilter, date_from: dateFrom, date_to: dateTo, grade_contains: gradeContains });
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
      { header: 'Essay', accessor: 'student_response', longText: true, cell: (row) => row.student_response },
      { header: 'Improvements', accessor: 'improvement_suggestions', longText: true, cell: (row) => Array.isArray(row.improvement_suggestions) ? row.improvement_suggestions.join(' | ') : row.improvement_suggestions },
      { header: 'Strengths', accessor: 'strengths', longText: true, cell: (row) => Array.isArray(row.strengths) ? row.strengths.join(' | ') : row.strengths },
      { header: 'Feedback', accessor: 'feedback', longText: true, cell: (row) => row.feedback },
    ] : []),
    { header: 'Date', accessor: 'timestamp', sortable: true, sortKey: 'timestamp' },
  ]), [showDetails]);

  const onSortChange = (col, dir) => {
    setSortBy(col); setSortDir(dir); setPage(1);
  };

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 flex-wrap">
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
        <input className="border rounded px-2 py-2 w-64" placeholder="Question types (comma)" value={questionTypes} onChange={(e)=>setQuestionTypes(e.target.value)} />
        <input className="border rounded px-2 py-2 w-56" placeholder="User UID" value={userFilter} onChange={(e)=>setUserFilter(e.target.value)} />
        <input type="date" className="border rounded px-2 py-2" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        <input type="date" className="border rounded px-2 py-2" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        <input className="border rounded px-2 py-2 w-40" placeholder="Grade contains" value={gradeContains} onChange={(e)=>setGradeContains(e.target.value)} />
        <button className="border rounded px-2 py-2" onClick={()=>{ setQuestionTypes(''); setUserFilter(''); setDateFrom(''); setDateTo(''); setGradeContains(''); setSearch(''); setPage(1); }}>Clear</button>
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
      <DataTable columns={columns} data={data?.data} loading={isLoading} toolbar={toolbar} footer={footer} emptyMessage="No evaluations found" onSortChange={onSortChange} sortBy={sortBy} sortDir={sortDir} />
      <EvaluationDetailModal evaluationId={selectedEvalId} open={!!selectedEvalId} onClose={() => setSelectedEvalId(null)} />
    </div>
  );
};

export default AdminEvaluationsPage;

