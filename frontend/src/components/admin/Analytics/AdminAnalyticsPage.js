import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../../utils/backendUrl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie, Sector,
  ComposedChart
} from 'recharts';
import { 
  UsersIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CalculatorIcon, 
  UserPlusIcon 
} from '@heroicons/react/24/outline';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Stat = ({ label, value, color = 'blue', icon: Icon }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-{color}-50 to-{color}-100 opacity-20"></div>
    <div className="relative">
      {Icon && <Icon className="w-8 h-8 text-{color}-600 mb-2" />}
      <div className="text-xs uppercase text-gray-500 mb-1 tracking-wide">{label}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const ChartCard = ({ title, children, className = '' }) => (
  <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-shadow">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
    <div className={className}>
      {children}
    </div>
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

  const dailyData = (data?.daily || []).slice(-days).map(d => ({
    date: new Date(d.date).toLocaleDateString(),
    evaluations: d.evaluations,
    new_users: d.new_users
  }));

  const questionTypeData = (data?.by_question_type || []).map((row, index) => ({
    question_type: row.question_type,
    count: row.count,
    avg_grade: row.avg_grade,
    fill: COLORS[index % COLORS.length]
  }));

  const planData = (data?.by_plan || []).map((row, index) => ({
    plan: row.plan,
    count: row.count,
    fill: COLORS[index % COLORS.length]
  }));

  const topUsersData = (data?.top_users_last_n_days || []).slice(0, 10).map((u, index) => ({
    name: u.display_name || u.user_id,
    count: u.count,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" 
            value={days} 
            onChange={(e)=>setDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <button 
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors" 
            onClick={fetchAnalytics}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">{error}</div>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Stat label="Total Users" value={data?.totals?.total_users ?? '—'} color="blue" icon={UsersIcon} />
        <Stat label="Total Evaluations" value={data?.totals?.total_evaluations ?? '—'} color="green" icon={ChartBarIcon} />
        <Stat label="Active Users (30d)" value={data?.totals?.active_users_30d ?? '—'} color="purple" icon={UsersIcon} />
        <Stat label="Conversion Rate" value={`${(data?.totals?.conversion_overall_pct ?? 0).toFixed(1)}%`} color="orange" icon={ArrowTrendingUpIcon} />
        <Stat label="Avg Evaluations/User" value={(data?.totals?.avg_evaluations_per_user ?? 0).toFixed(1)} color="indigo" icon={CalculatorIcon} />
        <Stat label={`New Users (${days}d)`} value={data?.totals?.new_users_last_n_days ?? '—'} color="teal" icon={UserPlusIcon} />
      </div>

      {/* Daily Trends Charts */}
      <ChartCard title={`Daily Trends (Last ${days} Days)`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value, name) => [value, name === 'evaluations' ? 'Evaluations' : 'New Users']} />
                <Legend />
                <Line type="monotone" dataKey="evaluations" stroke="#0088FE" strokeWidth={2} name="Evaluations" />
                <Line type="monotone" dataKey="new_users" stroke="#00C49F" strokeWidth={2} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="evaluations" fill="#0088FE" name="Evaluations" />
                <Bar dataKey="new_users" fill="#00C49F" name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartCard>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Evaluations by Question Type">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question_type" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value, name, props) => [value, props.payload.question_type]} />
                <Bar dataKey="count" name="Count">
                  {questionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Users by Plan">
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Evaluations/User Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.evaluations_per_user_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Grade Percentiles">
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Grade</span>
              <span className="text-xl font-bold text-blue-600">{data?.grade_stats?.avg ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">P50 (Median)</span>
              <span className="text-xl font-bold text-green-600">{data?.grade_stats?.p50 ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">P75</span>
              <span className="text-xl font-bold text-orange-600">{data?.grade_stats?.p75 ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">P90</span>
              <span className="text-xl font-bold text-red-600">{data?.grade_stats?.p90 ?? '—'}</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title={`Top Users by Evaluations (Last ${days} Days)`}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topUsersData} margin={{ right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" width={150} />
                <Tooltip />
                <Bar dataKey="count">
                  {topUsersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Time to First Evaluation">
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Days</span>
              <span className="text-xl font-bold text-purple-600">{data?.time_to_first_evaluation?.avg_days ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Median Days</span>
              <span className="text-xl font-bold text-indigo-600">{data?.time_to_first_evaluation?.median_days ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Users Analyzed</span>
              <span className="text-xl font-bold text-gray-600">{data?.time_to_first_evaluation?.count ?? '—'}</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Additional Top Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title={`Top Question Types by Volume (Last ${days} Days)`}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.top_question_types_recent || []).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question_type" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Question Types by Average Grade">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.top_question_types_by_avg || []).slice(0, 10).sort((a, b) => b.avg_grade - a.avg_grade)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question_type" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="avg_grade" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

