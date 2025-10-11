import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import { useUsers } from '../../../hooks/admin/useUsers';
import { useEvaluations } from '../../../hooks/admin/useEvaluations';
import { useFeedback } from '../../../hooks/admin/useFeedback';
import { getApiUrl } from '../../../utils/backendUrl';

const TABS = [
  { id: 'users', label: 'assessment_users' },
  { id: 'evaluations', label: 'assessment_evaluations' },
  { id: 'feedback', label: 'assessment_feedback' },
];

const downloadCsv = (rows, columns, filename) => {
  const header = columns.map(c => c.header).join(',');
  const body = (rows || []).map(r => columns.map(c => JSON.stringify(r[c.accessor] ?? '')).join(',')).join('\n');
  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const AdminDatabaseBrowser = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedColumns, setSelectedColumns] = useState({ users: new Set(), evaluations: new Set(), feedback: new Set() });

  // Users filters
  const [plan, setPlan] = useState('');
  const [level, setLevel] = useState('');
  const [minCredits, setMinCredits] = useState('');
  const [maxCredits, setMaxCredits] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  // Evaluations filters
  const [types, setTypes] = useState('');
  const [userId, setUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [globalQ, setGlobalQ] = useState('');
  const [globalResults, setGlobalResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const runGlobalSearch = async (value) => {
    setGlobalQ(value);
    if (!value) { setGlobalResults(null); return; }
    try {
      setIsSearching(true);
      const sessionToken = localStorage.getItem('admin_session_token');
      const res = await fetch(`${getApiUrl()}/admin/search?q=${encodeURIComponent(value)}`, { headers: { 'X-Admin-Session': sessionToken } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setGlobalResults(json);
    } catch (e) {
      console.error('Global search error', e);
      setGlobalResults({ error: String(e) });
    } finally {
      setIsSearching(false);
    }
  };

  const pageSize = 25;

  const usersQ = useUsers({ page, pageSize, search, sortBy, sortDir, subscription: plan, academic_level: level, min_credits: minCredits ? Number(minCredits) : undefined, max_credits: maxCredits ? Number(maxCredits) : undefined, created_from: createdFrom, created_to: createdTo });
  const evalsQ = useEvaluations({ page, pageSize, search, sortBy: activeTab==='evaluations'?sortBy:'timestamp', sortDir, question_types: types, user_id: userId, date_from: dateFrom, date_to: dateTo });
  const feedbackQ = useFeedback({ page, pageSize, search, sortBy, sortDir });

  const config = useMemo(() => {
    if (activeTab === 'users') {
      const allCols = [
        { header: 'uid', accessor: 'uid' },
        { header: 'display_name', accessor: 'display_name' },
        { header: 'email', accessor: 'email' },
        { header: 'phone', accessor: 'phone' },
        { header: 'academic_level', accessor: 'academic_level' },
        { header: 'questions_marked', accessor: 'questions_marked' },
        { header: 'credits', accessor: 'credits' },
        { header: 'current_plan', accessor: 'current_plan' },
        { header: 'created_at', accessor: 'created_at' },
      ];
      const cols = allCols.filter(c => !(selectedColumns.users.size) || selectedColumns.users.has(c.accessor));
      return { rows: usersQ.data?.data, count: usersQ.data?.count, loading: usersQ.isLoading, columns: cols, allCols };
    }
    if (activeTab === 'evaluations') {
      const allCols = [
        { header: 'id', accessor: 'id' },
        { header: 'short_id', accessor: 'short_id' },
        { header: 'user_id', accessor: 'user_id' },
        { header: 'question_type', accessor: 'question_type' },
        { header: 'grade', accessor: 'grade' },
        { header: 'reading_marks', accessor: 'reading_marks' },
        { header: 'writing_marks', accessor: 'writing_marks' },
        { header: 'ao1_marks', accessor: 'ao1_marks' },
        { header: 'ao2_marks', accessor: 'ao2_marks' },
        { header: 'timestamp', accessor: 'timestamp' },
      ];
      const cols = allCols.filter(c => !(selectedColumns.evaluations.size) || selectedColumns.evaluations.has(c.accessor));
      return { rows: evalsQ.data?.data, count: evalsQ.data?.count, loading: evalsQ.isLoading, columns: cols, allCols };
    }
    const allCols = [
      { header: 'id', accessor: 'id' },
      { header: 'evaluation_id', accessor: 'evaluation_id' },
      { header: 'user_id', accessor: 'user_id' },
      { header: 'category', accessor: 'category' },
      { header: 'accurate', accessor: 'accurate' },
      { header: 'comments', accessor: 'comments' },
      { header: 'created_at', accessor: 'created_at' },
    ];
    const cols = allCols.filter(c => !(selectedColumns.feedback.size) || selectedColumns.feedback.has(c.accessor));
    return { rows: feedbackQ.data?.data, count: feedbackQ.data?.count, loading: feedbackQ.isLoading, columns: cols, allCols };
  }, [activeTab, usersQ, evalsQ, feedbackQ, selectedColumns, sortBy, sortDir]);

  const ColumnPicker = ({ all }) => (
    <div className="flex flex-wrap gap-2">
      {all.map(c => (
        <label key={c.accessor} className="text-xs flex items-center gap-1 border rounded px-2 py-1">
          <input
            type="checkbox"
            checked={(selectedColumns[activeTab] || new Set()).has(c.accessor)}
            onChange={(e) => {
              const copy = new Set(selectedColumns[activeTab] || []);
              if (e.target.checked) copy.add(c.accessor); else copy.delete(c.accessor);
              setSelectedColumns(prev => ({ ...prev, [activeTab]: copy }));
            }}
          />
          {c.header}
        </label>
      ))}
    </div>
  );

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setPage(1); }} className={`px-3 py-2 rounded border ${activeTab === t.id ? 'bg-indigo-600 text-white' : ''}`}>{t.label}</button>
          ))}
          <input className="border rounded px-3 py-2 w-64" placeholder="Global search" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <select className="border rounded px-2 py-2" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
            <option value="created_at">Created</option>
            <option value="updated_at">Updated</option>
            <option value="display_name">Name</option>
            <option value="email">Email</option>
            <option value="credits">Credits</option>
            <option value="questions_marked">Questions Marked</option>
            <option value="current_plan">Plan</option>
            <option value="timestamp">Timestamp</option>
          </select>
          <select className="border rounded px-2 py-2" value={sortDir} onChange={(e)=>setSortDir(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button className="border rounded px-2 py-2" onClick={()=>downloadCsv(config.rows || [], config.allCols, `${activeTab}.csv`)}>Export CSV</button>
        </div>
        <div className="text-sm text-gray-500">Total: {config.count ?? '—'}</div>
      </div>

      {activeTab === 'users' && (
        <div className="flex items-center gap-2 flex-wrap">
          <select className="border rounded px-2 py-2" value={plan} onChange={(e)=>{ setPlan(e.target.value); setPage(1); }}>
            <option value="">Any Plan</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select className="border rounded px-2 py-2" value={level} onChange={(e)=>{ setLevel(e.target.value); setPage(1); }}>
            <option value="">Any Level</option>
            <option value="igcse">IGCSE</option>
            <option value="alevel">A-Level</option>
            <option value="gp">GP</option>
          </select>
          <input className="border rounded px-2 py-2 w-24" placeholder="Min credits" value={minCredits} onChange={(e)=>setMinCredits(e.target.value)} />
          <input className="border rounded px-2 py-2 w-24" placeholder="Max credits" value={maxCredits} onChange={(e)=>setMaxCredits(e.target.value)} />
          <input type="date" className="border rounded px-2 py-2" value={createdFrom} onChange={(e)=>setCreatedFrom(e.target.value)} />
          <input type="date" className="border rounded px-2 py-2" value={createdTo} onChange={(e)=>setCreatedTo(e.target.value)} />
          <button className="border rounded px-2 py-2" onClick={()=>{ setPlan(''); setLevel(''); setMinCredits(''); setMaxCredits(''); setCreatedFrom(''); setCreatedTo(''); setSearch(''); setPage(1); }}>Clear</button>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="flex items-center gap-2 flex-wrap">
          <input className="border rounded px-2 py-2 w-64" placeholder="Question types (comma)" value={types} onChange={(e)=>setTypes(e.target.value)} />
          <input className="border rounded px-2 py-2 w-56" placeholder="User UID" value={userId} onChange={(e)=>setUserId(e.target.value)} />
          <input type="date" className="border rounded px-2 py-2" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
          <input type="date" className="border rounded px-2 py-2" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
          <button className="border rounded px-2 py-2" onClick={()=>{ setTypes(''); setUserId(''); setDateFrom(''); setDateTo(''); setSearch(''); setPage(1); }}>Clear</button>
        </div>
      )}

      <div>
        <div className="text-xs text-gray-500 mb-1">Columns</div>
        <ColumnPicker all={config.allCols} />
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Prev</button>
      <div className="text-sm">Page {page}</div>
      <button disabled={(config.count || 0) <= page * pageSize} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Database Browser</h1>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input className="border rounded px-3 py-2 w-full" placeholder="Search anything (uid, email, short id, type, grade, feedback...)" value={globalQ} onChange={(e)=>runGlobalSearch(e.target.value)} />
          {isSearching && <div className="text-sm">Searching…</div>}
        </div>
        {globalResults && !globalResults.error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-semibold mb-2">Users</div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {(globalResults.users || []).map(u => (
                  <div key={u.uid} className="p-2 rounded border">
                    <div className="font-mono text-sm">{u.uid}</div>
                    <div className="text-sm">{u.display_name} · {u.email}</div>
                    <div className="text-xs text-gray-500">{u.current_plan} · credits {u.credits}</div>
                    <div className="mt-2 text-xs text-gray-500">Recent:</div>
                    <ul className="text-xs list-disc pl-4">
                      {(u.recent_evaluations || []).map(ev => (
                        <li key={ev.id}>{ev.short_id} · {ev.question_type} · {ev.grade}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2">Evaluations</div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {(globalResults.evaluations || []).map(ev => (
                  <div key={ev.id} className="p-2 rounded border">
                    <div className="font-mono">{ev.short_id}</div>
                    <div className="text-sm">{ev.question_type} · {ev.grade}</div>
                    <div className="text-xs text-gray-500">User: {ev.user?.display_name || ev.user_id}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2">Feedback</div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {(globalResults.feedback || []).map(fb => (
                  <div key={fb.id} className="p-2 rounded border">
                    <div className="text-sm">{fb.category} · {fb.accurate ? 'accurate' : 'inaccurate'}</div>
                    <div className="text-xs text-gray-600">{fb.comments}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {globalResults?.error && (
          <div className="text-red-600 text-sm">Search error: {globalResults.error}</div>
        )}
      </div>

      <DataTable columns={config.columns} data={config.rows} loading={config.loading} toolbar={toolbar} footer={footer} emptyMessage={`No ${activeTab} rows found`} sortBy={sortBy} sortDir={sortDir} onSortChange={(c,d)=>{ setSortBy(c); setSortDir(d); setPage(1); }} />
    </div>
  );
};

export default AdminDatabaseBrowser;

