import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../../utils/backendUrl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie, Sector,
  ComposedChart,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  UsersIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CalculatorIcon, 
  UserPlusIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  ChartPieIcon,
  StarIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

// Question type mapping for better display names
const questionTypeMap = {
  'igcse_summary': 'Summary',
  'igcse_narrative': 'Narrative', 
  'igcse_descriptive': 'Descriptive',
  'igcse_writers_effect': "Writer's Effect",
  'igcse_directed': 'Directed Writing',
  'igcse_extended_q3': 'Extended Writing Q3',
  'alevel_comparative': 'Comparative Analysis',
  'alevel_directed': 'Directed Writing 1(a)',
  'alevel_text_analysis': 'Text Analysis Q2',
  'alevel_reflective_commentary': 'Reflective Commentary',
  'alevel_language_change': 'Language Change Analysis',
  'gp_essay': 'Essay (Paper 1)',
  'gp_comprehension': 'Comprehension (Paper 2)'
};

// Get category color for question types
const getQuestionTypeColor = (questionType) => {
  if (questionType.startsWith('igcse_')) return '#3B82F6'; // Blue for IGCSE
  if (questionType.startsWith('alevel_')) return '#10B981'; // Green for A-Level
  if (questionType.startsWith('gp_')) return '#8B5CF6'; // Purple for General Paper
  return '#6B7280'; // Gray for unknown
};

const Stat = ({ label, value, color = 'blue', icon: Icon, trend, trendValue }) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className={`absolute inset-0 bg-gradient-to-r from-${color}-50 to-${color}-100 opacity-20 group-hover:opacity-30 transition-opacity`}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        {Icon && <Icon className={`w-8 h-8 text-${color}-600`} />}
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : trend === 'down' ? <ArrowDownIcon className="w-4 h-4 mr-1" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-xs uppercase text-gray-500 mb-1 tracking-wide font-medium">{label}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const ChartCard = ({ title, children, className = '', description }) => (
  <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-shadow">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </div>
    <div className={className}>
      {children}
    </div>
  </div>
);

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);
  
  console.log('=== ANALYTICS PAGE DEBUG START ===');
  console.log('Analytics page state:', { data, error, days, customDays, loading });

  const fetchAnalytics = async () => {
    console.log('=== ANALYTICS FETCH DEBUG ===');
    console.log('fetchAnalytics called with days:', days);
    
    try {
      setLoading(true);
      setError(null);
      const sessionToken = localStorage.getItem('admin_session_token');
      const url = `${getApiUrl()}/admin/analytics?days=${days}`;
      
      console.log('Analytics API URL:', url);
      console.log('Analytics headers:', { 'X-Admin-Session': sessionToken });
      
      const res = await fetch(url, { 
        headers: { 'X-Admin-Session': sessionToken } 
      });
      
      console.log('Analytics response status:', res.status);
      console.log('Analytics response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Analytics API error response:', errorText);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const json = await res.json();
      console.log('Analytics API result:', json);
      setData(json);
    } catch (e) {
      console.error('Error fetching analytics:', e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [days]);

  const handleCustomDays = () => {
    const customValue = parseInt(customDays);
    if (customValue && customValue > 0 && customValue <= 365) {
      setDays(customValue);
      setCustomDays('');
    }
  };

  // Enhanced data processing
  const dailyData = (data?.daily || []).slice(-days).map(d => ({
    date: new Date(d.date).toLocaleDateString(),
    evaluations: d.evaluations,
    new_users: d.new_users,
    active_users: d.active_users || 0,
    avg_grade: d.avg_grade || 0,
    cumulative_users: d.cumulative_users || 0,
    cumulative_evaluations: d.cumulative_evaluations || 0,
    retention_rate: d.retention_rate || 0
  }));

  const questionTypeData = (data?.by_question_type || []).map((row, index) => ({
    question_type: questionTypeMap[row.question_type] || row.question_type,
    count: row.count,
    avg_grade: row.avg_grade,
    fill: getQuestionTypeColor(row.question_type),
    completion_rate: row.completion_rate || 0,
    avg_time_spent: row.avg_time_spent || 0
  }));

  const planData = (data?.by_plan || []).map((row, index) => ({
    plan: row.plan === 'free' ? 'Free' : row.plan === 'unlimited' ? 'Unlimited' : row.plan,
    count: row.count,
    fill: row.plan === 'free' ? '#6B7280' : '#3B82F6', // Gray for free, blue for unlimited
    revenue: row.revenue || 0,
    churn_rate: row.churn_rate || 0
  }));

  const topUsersData = (data?.top_users_last_n_days || []).slice(0, 15).map((u, index) => ({
    name: u.display_name || u.user_id?.slice(-8) || 'Unknown',
    count: u.count,
    avg_grade: u.avg_grade || 0,
    fill: COLORS[index % COLORS.length],
    streak: u.streak || 0,
    total_time: u.total_time || 0
  }));

  const hourlyData = (data?.hourly_distribution || []).map(h => ({
    hour: `${h.hour}:00`,
    evaluations: h.count,
    avg_grade: h.avg_grade || 0
  }));

  const weeklyData = (data?.weekly_distribution || []).map(w => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w.day_of_week] || w.day_of_week,
    evaluations: w.count,
    avg_grade: w.avg_grade || 0
  }));

  const gradeDistributionData = (data?.grade_distribution || []).map((g, index) => ({
    range: g.range,
    count: g.count,
    percentage: g.percentage || 0,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8 p-4 max-w-[1600px] mx-auto">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive insights into user behavior and platform performance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-w-[120px]" 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Custom days"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-32"
                min="1"
                max="365"
              />
              <button 
                onClick={handleCustomDays}
                disabled={!customDays || loading}
                className="px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                Set
              </button>
            </div>
          </div>
          
          <button 
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50" 
            onClick={fetchAnalytics}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <ArrowTrendingUpIcon className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-300 text-xs font-bold">!</span>
            </div>
            {error}
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <Stat 
          label="Total Users" 
          value={data?.totals?.total_users?.toLocaleString() ?? '—'} 
          color="blue" 
          icon={UsersIcon}
          trend={data?.totals?.user_growth_trend}
          trendValue={data?.totals?.user_growth_rate}
        />
        <Stat 
          label="Total Evaluations" 
          value={data?.totals?.total_evaluations?.toLocaleString() ?? '—'} 
          color="green" 
          icon={ChartBarIcon}
          trend={data?.totals?.evaluation_growth_trend}
          trendValue={data?.totals?.evaluation_growth_rate}
        />
        <Stat 
          label="Active Users (30d)" 
          value={data?.totals?.active_users_30d?.toLocaleString() ?? '—'} 
          color="purple" 
          icon={FireIcon}
        />
        <Stat 
          label="Conversion Rate" 
          value={`${(data?.totals?.conversion_overall_pct ?? 0).toFixed(1)}%`} 
          color="orange" 
          icon={TrophyIcon}
        />
        <Stat 
          label="Avg Evaluations/User" 
          value={(data?.totals?.avg_evaluations_per_user ?? 0).toFixed(1)} 
          color="indigo" 
          icon={CalculatorIcon}
        />
        <Stat 
          label={`New Users (${days}d)`} 
          value={data?.totals?.new_users_last_n_days?.toLocaleString() ?? '—'} 
          color="teal" 
          icon={UserPlusIcon}
        />
        <Stat 
          label="Avg Grade" 
          value={`${(data?.grade_stats?.avg ?? 0).toFixed(1)}%`} 
          color="yellow" 
          icon={StarIcon}
        />
        <Stat 
          label="Retention Rate" 
          value={`${(data?.totals?.retention_rate ?? 0).toFixed(1)}%`} 
          color="pink" 
          icon={AcademicCapIcon}
        />
        <Stat 
          label="Daily Active Users" 
          value={data?.totals?.active_users_1d?.toLocaleString() ?? '—'} 
          color="cyan" 
          icon={ClockIcon}
        />
        <Stat 
          label="Revenue (Est.)" 
          value={`$${(data?.totals?.estimated_revenue ?? 0).toLocaleString()}`} 
          color="emerald" 
          icon={BanknotesIcon}
        />
      </div>

      {/* Enhanced Daily Trends */}
      <ChartCard 
        title={`Daily Activity Trends (Last ${days} Days)`}
        description="Blue: New Users • Green: Evaluations • Purple: Average Grade"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="h-80">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Trends</h4>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="evaluations" fill="#0088FE" name="Evaluations" />
                <Bar yAxisId="left" dataKey="new_users" fill="#00C49F" name="New Users" />
                <Line yAxisId="right" type="monotone" dataKey="avg_grade" stroke="#FF8042" strokeWidth={2} name="Avg Grade %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-80">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cumulative Growth</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="cumulative_users" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Users" />
                <Area type="monotone" dataKey="cumulative_evaluations" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Total Evaluations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartCard>

      {/* Time-based Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title="Hourly Activity Distribution" 
          description="Peak hours: 9AM-12PM, 2PM-5PM, 7PM-9PM"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="evaluations" fill="#0088FE" name="Evaluations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Weekly Activity Pattern" 
          description="Monday-Friday: High • Weekend: Lower activity"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="evaluations" fill="#00C49F" name="Evaluations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Question Type Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <ChartCard 
          title="Question Types by Volume" 
          description="IGCSE: Blue • A-Level: Green • General Paper: Purple"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question_type" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" name="Count">
                  {questionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Average Grades by Type" 
          description="Higher bars = Better performance"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionTypeData.sort((a, b) => b.avg_grade - a.avg_grade)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question_type" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="avg_grade" fill="#00C49F" name="Avg Grade %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Question Type Distribution" 
          description="Pie chart showing content balance"
        >
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={questionTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ question_type, percent }) => `${question_type} ${(percent * 100).toFixed(0)}%`}
                >
                  {questionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Grade Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title="Grade Distribution" 
          description="Red: 0-40% (Needs Improvement) • Yellow: 40-70% (Developing) • Green: 70-100% (Proficient)"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" name="Students">
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Grade Statistics" 
          description="P25: Bottom 25% • P50: Median (Middle) • P75: Top 25%"
        >
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{data?.grade_stats?.avg ?? '—'}</div>
                <div className="text-sm text-gray-500">Average Grade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{data?.grade_stats?.p50 ?? '—'}</div>
                <div className="text-sm text-gray-500">Median (P50)</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{data?.grade_stats?.p25 ?? '—'}</div>
                <div className="text-sm text-gray-500">P25</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{data?.grade_stats?.p75 ?? '—'}</div>
                <div className="text-sm text-gray-500">P75</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{data?.grade_stats?.p90 ?? '—'}</div>
                <div className="text-sm text-gray-500">P90</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">{data?.grade_stats?.std_dev ?? '—'}</div>
                <div className="text-sm text-gray-500">Std Deviation</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">{data?.grade_stats?.total_graded ?? '—'}</div>
                <div className="text-sm text-gray-500">Total Graded</div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* User Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title={`Top Performers (Last ${days} Days)`} 
          description="Horizontal bars show evaluation count"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topUsersData} margin={{ right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" width={120} />
                <Tooltip />
                <Bar dataKey="count" name="Evaluations">
                  {topUsersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="User Engagement Metrics" 
          description="Purple: Avg Days to First Eval • Blue: Median • Green: Retention Rate"
        >
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{data?.time_to_first_evaluation?.avg_days ?? '—'}</div>
                <div className="text-sm text-gray-500">Avg Days to First Eval</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{data?.time_to_first_evaluation?.median_days ?? '—'}</div>
                <div className="text-sm text-gray-500">Median Days</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data?.totals?.retention_7d ?? '—'}%</div>
                <div className="text-sm text-gray-500">7-Day Retention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data?.totals?.retention_30d ?? '—'}%</div>
                <div className="text-sm text-gray-500">30-Day Retention</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-600">{data?.time_to_first_evaluation?.count ?? '—'}</div>
              <div className="text-sm text-gray-500">Users Analyzed</div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Subscription Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title="Users by Subscription Plan" 
          description="Free: Gray • Unlimited: Blue"
        >
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
                  label={({ plan, percent }) => `${plan} ${(percent * 100).toFixed(0)}%`}
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Evaluations per User Distribution" 
          description="Shows how many evaluations each user has completed (0, 1, 2-5, 6-10, 11-20, 21+)"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.evaluations_per_user_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

