import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import { useUsers } from '../../../hooks/admin/useUsers';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';
import { useFeedback } from '../../../hooks/admin/useFeedback';

const TABS = [
  { id: 'users', label: 'assessment_users' },
  { id: 'evaluations', label: 'assessment_evaluations' },
  { id: 'feedback', label: 'assessment_feedback' },
];

const AdminDatabaseBrowser = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const usersQ = useUsers({ page, pageSize, search });
  const evalsQ = useEvaluations({ page, pageSize, search });
  const feedbackQ = useFeedback({ page, pageSize, search });

  const { rows, count, loading, columns } = useMemo(() => {
    if (activeTab === 'users') {
      return {
        rows: usersQ.data?.data,
        count: usersQ.data?.count,
        loading: usersQ.isLoading,
        columns: [
          { header: 'uid', accessor: 'uid' },
          { header: 'display_name', accessor: 'display_name' },
          { header: 'email', accessor: 'email' },
          { header: 'phone', accessor: 'phone' },
          { header: 'academic_level', accessor: 'academic_level' },
          { header: 'question_marked', accessor: 'question_marked' },
          { header: 'credits', accessor: 'credits' },
          { header: 'subscription_status', accessor: 'subscription_status' },
          { header: 'created_at', accessor: 'created_at' },
        ],
      };
    }
    if (activeTab === 'evaluations') {
      return {
        rows: evalsQ.data?.data,
        count: evalsQ.data?.count,
        loading: evalsQ.isLoading,
        columns: [
          { header: 'id', accessor: 'id' },
          { header: 'short_id', accessor: 'short_id' },
          { header: 'user_id', accessor: 'user_id' },
          { header: 'question_type', accessor: 'question_type' },
          { header: 'grade', accessor: 'grade' },
          { header: 'reading_marks', accessor: 'reading_marks' },
          { header: 'writing_marks', accessor: 'writing_marks' },
          { header: 'sol_marks', accessor: 'sol_marks' },
          { header: 'so2_marks', accessor: 'so2_marks' },
          { header: 'created_at', accessor: 'created_at' },
        ],
      };
    }
    return {
      rows: feedbackQ.data?.data,
      count: feedbackQ.data?.count,
      loading: feedbackQ.isLoading,
      columns: [
        { header: 'id', accessor: 'id' },
        { header: 'evaluation_id', accessor: 'evaluation_id' },
        { header: 'user_id', accessor: 'user_id' },
        { header: 'category', accessor: 'category' },
        { header: 'accurate', accessor: 'accurate', cell: (r) => (r.accurate ? 'true' : 'false') },
        { header: 'comments', accessor: 'comments' },
        { header: 'created_at', accessor: 'created_at' },
      ],
    };
  }, [activeTab, usersQ, evalsQ, feedbackQ]);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setPage(1); }} className={`px-3 py-2 rounded border ${activeTab === t.id ? 'bg-indigo-600 text-white' : ''}`}>{t.label}</button>
        ))}
      </div>
      <input className="border rounded px-3 py-2 w-64" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="text-sm text-gray-500">Total: {count ?? '—'}</div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Prev</button>
      <div className="text-sm">Page {page}</div>
      <button disabled={(count || 0) <= page * pageSize} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Database Browser</h1>
      </div>
      <DataTable columns={columns} data={rows} loading={loading} toolbar={toolbar} footer={footer} emptyMessage={`No ${activeTab} rows found`} />
    </div>
  );
};

export default AdminDatabaseBrowser;

