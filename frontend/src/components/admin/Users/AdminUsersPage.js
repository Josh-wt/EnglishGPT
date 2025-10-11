import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import UserDetailModal from './UserDetailModal';
import { useUsers } from '../../../hooks/admin/useUsers';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [subscription, setSubscription] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [minCredits, setMinCredits] = useState('');
  const [maxCredits, setMaxCredits] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const pageSize = 25;
  const { data, isLoading } = useUsers({ page, pageSize, search, sortBy, sortDir, subscription, academic_level: academicLevel, min_credits: minCredits ? Number(minCredits) : undefined, max_credits: maxCredits ? Number(maxCredits) : undefined, created_from: createdFrom, created_to: createdTo });
  const [selectedUserId, setSelectedUserId] = useState(null);

  const columns = useMemo(() => ([
    { header: 'UID', accessor: 'uid', cell: (row) => (
      <button className="text-blue-600 hover:underline font-mono" onClick={() => setSelectedUserId(row.uid)}>{row.uid}</button>
    ) },
    { header: 'Name', accessor: 'display_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Academic Level', accessor: 'academic_level' },
    { header: 'Questions Marked', accessor: 'questions_marked' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Plan', accessor: 'current_plan' },
    { header: 'Created', accessor: 'created_at' },
  ]), []);

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <input className="border rounded px-3 py-2 w-64" placeholder="Search name, email, phone" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <select className="border rounded px-2 py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Created</option>
            <option value="updated_at">Updated</option>
            <option value="display_name">Name</option>
            <option value="email">Email</option>
            <option value="credits">Credits</option>
            <option value="questions_marked">Questions Marked</option>
            <option value="current_plan">Plan</option>
          </select>
          <select className="border rounded px-2 py-2" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select className="border rounded px-2 py-2" value={subscription} onChange={(e) => { setPage(1); setSubscription(e.target.value); }}>
            <option value="">Any Plan</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select className="border rounded px-2 py-2" value={academicLevel} onChange={(e) => { setPage(1); setAcademicLevel(e.target.value); }}>
            <option value="">Any Level</option>
            <option value="igcse">IGCSE</option>
            <option value="alevel">A-Level</option>
            <option value="gp">GP</option>
          </select>
          <input className="border rounded px-2 py-2 w-24" placeholder="Min credits" value={minCredits} onChange={(e)=>setMinCredits(e.target.value)} />
          <input className="border rounded px-2 py-2 w-24" placeholder="Max credits" value={maxCredits} onChange={(e)=>setMaxCredits(e.target.value)} />
          <input type="date" className="border rounded px-2 py-2" value={createdFrom} onChange={(e)=>setCreatedFrom(e.target.value)} />
          <input type="date" className="border rounded px-2 py-2" value={createdTo} onChange={(e)=>setCreatedTo(e.target.value)} />
          <button className="border rounded px-2 py-2" onClick={()=>{ setSubscription(''); setAcademicLevel(''); setMinCredits(''); setMaxCredits(''); setCreatedFrom(''); setCreatedTo(''); setSearch(''); setPage(1); }}>Clear</button>
        </div>
        <div className="text-sm text-gray-500">Total: {data?.count ?? '—'}</div>
      </div>
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
      <DataTable columns={columns} data={data?.data} loading={isLoading} toolbar={toolbar} footer={footer} emptyMessage="No users found" onSortChange={(c,d)=>{setSortBy(c);setSortDir(d);setPage(1);}} sortBy={sortBy} sortDir={sortDir} />
      <UserDetailModal userId={selectedUserId} open={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};

export default AdminUsersPage;

