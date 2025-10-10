import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import { useFeedback } from '../../../hooks/admin/useFeedback';

const AdminFeedbackPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isLoading } = useFeedback({ page, pageSize, search });

  const columns = useMemo(() => ([
    { header: 'Evaluation', accessor: 'evaluation.short_id', cell: (row) => row.evaluation?.short_id || row.evaluation_id },
    { header: 'User', accessor: 'user.display_name', cell: (row) => row.user?.display_name || row.user_id },
    { header: 'Category', accessor: 'category' },
    { header: 'Accurate', accessor: 'accurate', cell: (row) => row.accurate ? 'Yes' : 'No' },
    { header: 'Comments', accessor: 'comments' },
    { header: 'Date', accessor: 'created_at' },
  ]), []);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <input className="border rounded px-3 py-2 w-64" placeholder="Search comments" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <h1 className="text-2xl font-bold">Feedback</h1>
      </div>
      <DataTable columns={columns} data={data?.data} loading={isLoading} toolbar={toolbar} footer={footer} emptyMessage="No feedback found" />
    </div>
  );
};

export default AdminFeedbackPage;

