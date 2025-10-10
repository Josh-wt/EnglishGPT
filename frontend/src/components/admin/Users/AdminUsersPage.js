import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import UserDetailModal from './UserDetailModal';
import { useUsers } from '../../../hooks/admin/useUsers';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isLoading } = useUsers({ page, pageSize, search });
  const [selectedUserId, setSelectedUserId] = useState(null);

  const columns = useMemo(() => ([
    { header: 'Name', accessor: 'display_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Academic Level', accessor: 'academic_level' },
    { header: 'Questions Marked', accessor: 'question_marked' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Subscription', accessor: 'subscription_status' },
    { header: 'Created', accessor: 'created_at' },
  ]), []);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <input className="border rounded px-3 py-2 w-64" placeholder="Search name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <div onClick={(e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const index = [...tr.parentElement.children].indexOf(tr);
        const row = (data?.data || [])[index];
        if (row?.uid) setSelectedUserId(row.uid);
      }}>
        <DataTable columns={columns} data={data?.data} loading={isLoading} toolbar={toolbar} footer={footer} emptyMessage="No users found" />
      </div>
      <UserDetailModal userId={selectedUserId} open={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};

export default AdminUsersPage;

