import React from 'react';
import { RefreshCw, Users, FileText, TrendingUp, CreditCard, Activity, Target } from 'lucide-react';
import { useAdminDashboard } from '../../../hooks/admin/useAdminDashboard';

const Stat = ({ label, value, icon: Icon, color = "blue" }) => (
  <div className="rounded-2xl backdrop-blur bg-white/70 dark:bg-gray-800/70 shadow-sm border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </div>
      {Icon && (
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

export default function AdminOverview() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600">Error loading dashboard data: {String(error.message || error)}</div>
        <button onClick={() => refetch()} className="px-3 py-2 rounded bg-gray-900 text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <button
          onClick={refetch}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Stat 
          label="Total Users" 
          value={data?.total_users?.toLocaleString() || "—"} 
          icon={Users}
          color="blue"
        />
        <Stat 
          label="Total Evaluations" 
          value={data?.total_evaluations?.toLocaleString() || "—"} 
          icon={FileText}
          color="green"
        />
        <Stat 
          label="Average Grade" 
          value={data?.average_grade ? `${data.average_grade}%` : "—"} 
          icon={TrendingUp}
          color="purple"
        />
        <Stat 
          label="Total Credits Used" 
          value={data?.total_credits_used?.toLocaleString() || "—"} 
          icon={CreditCard}
          color="orange"
        />
        <Stat 
          label="Active Users Today" 
          value={data?.active_users_today?.toLocaleString() || "—"} 
          icon={Activity}
          color="red"
        />
        <Stat 
          label="Completion Rate" 
          value={data?.completion_rate ? `${data.completion_rate}%` : "—"} 
          icon={Target}
          color="indigo"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Evaluations Over Time" className="h-80">
          <div className="h-full flex items-center justify-center">
            {data?.evaluationsTrend?.length > 0 ? (
              <div className="w-full">
                <div className="text-sm text-gray-500 mb-2">Last 30 days</div>
                <div className="space-y-1">
                  {data.evaluationsTrend.slice(-7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{new Date(trend.date).toLocaleDateString()}</span>
                      <span className="font-medium">{trend.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        </ChartCard>
        
        <ChartCard title="Grade Distribution" className="h-80">
          <div className="h-full flex items-center justify-center">
            {data?.gradeDistribution?.length > 0 ? (
              <div className="w-full">
                <div className="space-y-2">
                  {data.gradeDistribution.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{grade.grade_range}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(grade.count / Math.max(...data.gradeDistribution.map(g => g.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{grade.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        </ChartCard>
        
        <ChartCard title="Question Types" className="h-80">
          <div className="h-full flex items-center justify-center">
            {data?.questionTypeStats?.length > 0 ? (
              <div className="w-full">
                <div className="space-y-2">
                  {data.questionTypeStats.slice(0, 5).map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm truncate">{stat.question_type}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{stat.count}</span>
                        <span className="text-xs text-gray-500">({stat.average_grade}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        </ChartCard>
        
        <ChartCard title="Subscription Status" className="h-80">
          <div className="h-full flex items-center justify-center">
            {data?.subscriptionStats?.length > 0 ? (
              <div className="w-full">
                <div className="space-y-2">
                  {data.subscriptionStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{stat.plan}</span>
                      <span className="text-sm font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </div>
        </ChartCard>
      </div>
      
      <ChartCard title="Recent Activity">
        <div className="space-y-3">
          {data?.recentActivity?.length > 0 ? (
            data.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {activity.type}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">No recent activity</div>
          )}
        </div>
      </ChartCard>
    </div>
  );
};