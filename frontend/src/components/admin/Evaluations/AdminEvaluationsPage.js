import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import EvaluationDetailModal from './EvaluationDetailModal';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';

const AdminEvaluationsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isLoading } = useEvaluations({ page, pageSize, search });
  const [selectedEvalId, setSelectedEvalId] = useState(null);

  const columns = useMemo(() => ([
    { header: 'Short ID', accessor: 'short_id' },
    { header: 'User', accessor: 'user.display_name', cell: (row) => row.user?.display_name || row.user_id },
    { header: 'Question Type', accessor: 'question_type' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Reading', accessor: 'reading_marks' },
    { header: 'Writing', accessor: 'writing_marks' },
    { header: 'SOL', accessor: 'sol_marks' },
    { header: 'SO2', accessor: 'so2_marks' },
    { header: 'Date', accessor: 'created_at' },
  ]), []);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <input className="border rounded px-3 py-2 w-64" placeholder="Search evaluations" value={search} onChange={(e) => setSearch(e.target.value)} />
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
      <div onClick={(e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const index = [...tr.parentElement.children].indexOf(tr);
        const row = (data?.data || [])[index];
        if (row?.id) setSelectedEvalId(row.id);
      }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} toolbar={toolbar} footer={footer} emptyMessage="No evaluations found" />
      </div>
      <EvaluationDetailModal evaluationId={selectedEvalId} open={!!selectedEvalId} onClose={() => setSelectedEvalId(null)} />
    </div>
  );
};

export default AdminEvaluationsPage;

