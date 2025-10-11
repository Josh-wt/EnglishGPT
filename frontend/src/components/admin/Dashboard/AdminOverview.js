import React from 'react';
import { RefreshCw, Users, FileText, TrendingUp, CreditCard, Activity, Target, User, Calendar, Award, Clock } from 'lucide-react';
import { useAdminDashboard } from '../../../hooks/admin/useAdminDashboard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

const Stat = ({ label, value, icon: Icon, color = "blue", change = null }) => (
  <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          {Icon && (
            <div className={`p-2 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 border border-${color}-200 dark:border-${color}-800`}>
              <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
            </div>
          )}
          <div className="text-xs uppercase tracking-wide font-medium text-gray-500 dark:text-gray-400">{label}</div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        {change !== null && (
          <div className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium flex items-center space-x-1`}>
            <span>{change >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(change)}% from last period</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const MiniChartCard = ({ title, data, type = 'line', className = '' }) => {
  const chartHeight = 120;
  
  return (
    <div className={`rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2">
        <span>{title}</span>
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      </h3>
      <div className="h-[140px] relative">
        {data?.length > 0 ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            {type === 'line' && (
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" vertical={false} />
                <XAxis hide dataKey="date" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </LineChart>
            )}
            {type === 'bar' && (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" vertical={false} />
                <XAxis hide dataKey="name" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {type === 'radial' && (
              <RadialBarChart 
                width={150} 
                height={140} 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="80%" 
                barSize={20}
                data={data}
              >
                <RadialBar 
                  minAngle={15} 
                  background 
                  clockWise 
                  dataKey="value" 
                  fill="#8b5cf6" 
                />
                <Tooltip />
              </RadialBarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No data</span>
          </div>
        )}
      </div>
    </div>
  );
};

const RecentActivityItem = ({ activity }) => (
  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className={`p-2 rounded-lg ${activity.type === 'evaluation' ? 'bg-green-100 dark:bg-green-900/30' : activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
      {activity.type === 'evaluation' && <Award className="w-4 h-4 text-green-600 dark:text-green-400" />}
      {activity.type === 'user' && <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
      {activity.type === 'subscription' && <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.description}</div>
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    </div>
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
      activity.type === 'evaluation' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
      activity.type === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    }`}>
      {activity.type}
    </div>
  </div>
);

export default function AdminOverview() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error) {
    return (
      <div className="space-y-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="text-red-600 dark:text-red-400 font-medium">Error loading dashboard data: {String(error.message || error)}</div>
        <button 
          onClick={() => refetch()} 
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Prepare chart data
  const evaluationsTrendData = data?.evaluationsTrend?.slice(-7).map((item, index) => ({
    date: new Date(item.date).toLocaleDateString().slice(-2), // Day only
    value: item.count,
    fullDate: item.date
  })) || [];

  const gradeDistributionData = data?.gradeDistribution?.map(grade => ({
    name: grade.grade_range,
    value: grade.count,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  })) || [];

  const recentData = data?.recentActivity?.slice(0, 5) || [];

  return (
    <div className="space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time insights into your platform performance</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Updating...' : 'Refresh Data'}</span>
        </button>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
        <Stat 
          label="Total Users" 
          value={data?.total_users?.toLocaleString() || "—"} 
          icon={Users}
          color="blue"
          change={5.2}
        />
        <Stat 
          label="Total Evaluations" 
          value={data?.total_evaluations?.toLocaleString() || "—"} 
          icon={FileText}
          color="green"
          change={12.8}
        />
        <Stat 
          label="Average Grade" 
          value={data?.average_grade ? `${data.average_grade.toFixed(1)}%` : "—"} 
          icon={TrendingUp}
          color="purple"
          change={2.1}
        />
        <Stat 
          label="Credits Used" 
          value={data?.total_credits_used?.toLocaleString() || "—"} 
          icon={CreditCard}
          color="orange"
          change={-1.3}
        />
        <Stat 
          label="Active Today" 
          value={data?.active_users_today?.toLocaleString() || "—"} 
          icon={Activity}
          color="red"
          change={8.7}
        />
        <Stat 
          label="Completion Rate" 
          value={data?.completion_rate ? `${data.completion_rate.toFixed(1)}%` : "—"} 
          icon={Target}
          color="indigo"
          change={3.4}
        />
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <MiniChartCard 
          title="Evaluations Trend" 
          data={evaluationsTrendData}
          type="line"
        />
        
        <MiniChartCard 
          title="Grade Distribution" 
          data={gradeDistributionData}
          type="bar"
        />
        
        <MiniChartCard 
          title="Question Types" 
          data={data?.questionTypeStats?.slice(0, 5).map(stat => ({
            name: stat.question_type.slice(0, 8) + '...',
            value: stat.count
          })) || []}
          type="bar"
        />
        
        <MiniChartCard 
          title="Subscription Breakdown" 
          data={data?.subscriptionStats?.map(stat => ({
            name: stat.plan,
            value: stat.count
          })) || []}
          type="radial"
        />
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Recent Activity</span>
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last 24 hours • {recentData.length} events
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentData.length > 0 ? (
                recentData.map((activity, index) => (
                  <RecentActivityItem key={index} activity={activity} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <div className="text-gray-500 dark:text-gray-400">No recent activity to show</div>
                  <div className="text-sm text-gray-400 mt-1">Check back later for updates</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};