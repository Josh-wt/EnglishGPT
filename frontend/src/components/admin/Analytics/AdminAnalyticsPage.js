import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../../utils/backendUrl';

const Stat = ({ label, value }) => (
  <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
    <div className="text-xs uppercase text-gray-500 mb-1">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const Row = ({ left, right }) => (
  <div className="flex justify-between text-sm"><span>{left}</span><span className="font-mono">{right}</span></div>
);

const Card = ({ title, children }) => (
  <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
    <div className="text-sm font-semibold mb-2">{title}</div>
    {children}
  </div>
);

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const sessionToken = localStorage.getItem('admin_session_token');
      const res = await fetch(`${getApiUrl()}/admin/analytics?days=${days}`, { headers: { 'X-Admin-Session': sessionToken } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(String(e));
    }
  };

  useEffect(() => { fetchAnalytics(); }, [days]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-2" value={days} onChange={(e)=>setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={fetchAnalytics}>Refresh</button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Stat label="Total Users" value={data?.totals?.total_users ?? '—'} />
        <Stat label="Total Evaluations" value={data?.totals?.total_evaluations ?? '—'} />
        <Stat label="Unique Users with Evaluations" value={data?.totals?.unique_users_with_evaluations ?? '—'} />
        <Stat label={`New Users (${days}d)`} value={data?.totals?.new_users_last_n_days ?? '—'} />
        <Stat label={`Evaluations (${days}d)`} value={data?.totals?.evaluations_last_n_days ?? '—'} />
        <Stat label="Avg Evaluations/User" value={data?.totals?.avg_evaluations_per_user ?? '—'} />
        <Stat label="Active (1d)" value={data?.totals?.active_users_1d ?? '—'} />
        <Stat label="Active (7d)" value={data?.totals?.active_users_7d ?? '—'} />
        <Stat label="Active (30d)" value={data?.totals?.active_users_30d ?? '—'} />
        <Stat label="Conversion Overall" value={`${data?.totals?.conversion_overall_pct ?? '—'}%`} />
        <Stat label={`Conversion (${days}d)`} value={`${data?.totals?.conversion_last_n_days_pct ?? '—'}%`} />
      </div>

      <Card title={`Daily (last ${days} days)`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">Evaluations/day</div>
            <div className="space-y-1 max-h-80 overflow-auto">
              {(data?.daily || []).slice(-days).map(d => (
                <Row key={d.date} left={new Date(d.date).toLocaleDateString()} right={d.evaluations} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">New users/day</div>
            <div className="space-y-1 max-h-80 overflow-auto">
              {(data?.daily || []).slice(-days).map(d => (
                <Row key={d.date} left={new Date(d.date).toLocaleDateString()} right={d.new_users} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="By Question Type">
          <div className="space-y-1 max-h-80 overflow-auto">
            {(data?.by_question_type || []).sort((a,b)=>b.count-a.count).map(row => (
              <Row key={row.question_type} left={`${row.question_type} · ${row.count}`} right={`${row.avg_grade}`} />
            ))}
          </div>
        </Card>
        <Card title="By Plan">
          <div className="space-y-1 max-h-80 overflow-auto">
            {(data?.by_plan || []).sort((a,b)=>b.count-a.count).map(row => (
              <Row key={row.plan} left={row.plan} right={row.count} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evaluations/User Distribution">
          <div className="space-y-1">
            {(data?.evaluations_per_user_distribution || []).map(r => (
              <Row key={r.bucket} left={r.bucket} right={r.users} />
            ))}
          </div>
        </Card>
        <Card title="Grade Stats">
          <div className="space-y-1">
            <Row left="Average" right={data?.grade_stats?.avg ?? '—'} />
            <Row left="P50" right={data?.grade_stats?.p50 ?? '—'} />
            <Row left="P75" right={data?.grade_stats?.p75 ?? '—'} />
            <Row left="P90" right={data?.grade_stats?.p90 ?? '—'} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Time to First Evaluation (days)">
          <div className="space-y-1">
            <Row left="Average" right={data?.time_to_first_evaluation?.avg_days ?? '—'} />
            <Row left="Median" right={data?.time_to_first_evaluation?.median_days ?? '—'} />
            <Row left="Count" right={data?.time_to_first_evaluation?.count ?? '—'} />
          </div>
        </Card>
        <Card title={`Top Users (last ${days} days)`}>
          <div className="space-y-1 max-h-80 overflow-auto">
            {(data?.top_users_last_n_days || []).map(u => (
              <Row key={u.user_id} left={`${u.display_name || u.user_id} · ${u.email || ''}`} right={u.count} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Top Question Types by Volume (last ${days} days)`}>
          <div className="space-y-1 max-h-80 overflow-auto">
            {(data?.top_question_types_recent || []).map(q => (
              <Row key={q.question_type} left={q.question_type} right={q.count} />
            ))}
          </div>
        </Card>
        <Card title="Top Question Types by Avg Grade">
          <div className="space-y-1 max-h-80 overflow-auto">
            {(data?.top_question_types_by_avg || []).map(q => (
              <Row key={q.question_type} left={q.question_type} right={q.avg_grade} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

