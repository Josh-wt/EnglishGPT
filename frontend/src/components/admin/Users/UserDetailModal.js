import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Mail, Phone, GraduationCap, CreditCard, Zap, Award, Calendar, Clock, TrendingUp, BarChart3, 
  Activity, FileText, Shield, X 
} from 'lucide-react';
import { useUserDetail } from '../../../hooks/admin/useUsers';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <span>User Profile</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium transition-all duration-200 ${
      active
        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    {Icon && <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />}
    <span>{children}</span>
  </button>
);

const ProfileTab = ({ user }) => (
  <div className="p-6 space-y-6">
    {/* User Avatar/Header */}
    <div className="flex items-start space-x-6">
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.display_name || user.email}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center space-x-1">
            <GraduationCap className="w-4 h-4" />
            <span>{user.academic_level || 'Not specified'}</span>
          </span>
          {user.created_at && (
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Basic Info Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Mail className="w-4 h-4" />
          <span>Email</span>
        </div>
        <div className="text-lg font-semibold break-all">{user.email}</div>
      </div>

      <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Phone className="w-4 h-4" />
          <span>Phone</span>
        </div>
        <div className="text-lg font-semibold">{user.phone || 'Not provided'}</div>
      </div>

      <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <GraduationCap className="w-4 h-4" />
          <span>Academic Level</span>
        </div>
        <div className={`text-lg font-semibold px-3 py-1 rounded-full ${
          user.academic_level === 'igcse' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' :
          user.academic_level === 'alevel' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' :
          user.academic_level === 'gp' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800'
        }`}>
          {user.academic_level || 'Not specified'}
        </div>
      </div>

      <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:col-span-2 lg:col-span-1">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <CreditCard className="w-4 h-4" />
          <span>Current Credits</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-green-600">{user.credits || 0}</div>
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: Math.min((user.credits || 0) / 100 * 100, 100) + '%' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:col-span-2 lg:col-span-1">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Zap className="w-4 h-4" />
          <span>Subscription</span>
        </div>
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
          user.current_plan === 'pro' || user.current_plan === 'enterprise' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          user.current_plan === 'starter' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {user.current_plan === 'pro' && <Zap className="w-4 h-4 mr-2" />}
          {user.current_plan === 'enterprise' && <Shield className="w-4 h-4 mr-2" />}
          {user.current_plan ? user.current_plan.charAt(0).toUpperCase() + user.current_plan.slice(1) : 'Free'}
        </div>
      </div>
    </div>

    {/* Usage Stats */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Evaluations</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{user.evaluations?.length || 0}</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {user.evaluations_count || 0} sessions completed • {user.questions_marked || 0} questions marked
        </div>
      </div>

      <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Average Grade</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.avg_grade ? `${user.avg_grade.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Best: {user.best_grade || '—'}% • Worst: {user.worst_grade || '—'}%
        </div>
      </div>

      <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Account Status</div>
            <div className={`text-3xl font-bold ${
              user.account_status === 'active' ? 'text-green-600 dark:text-green-400' :
              user.account_status === 'inactive' ? 'text-gray-500 dark:text-gray-400' :
              'text-orange-600 dark:text-orange-400'
            }`}>
              {user.account_status || 'Active'}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'} •
          Account age: {user.account_age_days || 0} days
        </div>
      </div>
    </div>
  </div>
);

const ActivityTimelineTab = ({ user }) => (
  <div className="p-6 space-y-6">
    <h3 className="text-xl font-semibold flex items-center space-x-2 text-gray-900 dark:text-white">
      <Activity className="w-5 h-5 text-blue-600" />
      <span>Activity Timeline</span>
      <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
    </h3>

    {user.activity_timeline && user.activity_timeline.length > 0 ? (
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-6">
          {user.activity_timeline.slice(0, 10).map((event, index) => (
            <div key={index} className="relative flex space-x-4">
              <div className="flex h-10 items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'evaluation' ? 'bg-green-500' :
                  event.type === 'purchase' ? 'bg-blue-500' :
                  event.type === 'login' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{event.action}</span>
                  {event.details && <span> • {event.details}</span>}
                </div>
                <div className="mt-1 flex items-center text-sm font-medium text-gray-900 dark:text-white space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No activity yet</div>
        <div className="text-sm text-gray-400">This user hasn't performed any actions</div>
      </div>
    )}
  </div>
);

const EvaluationsChartTab = ({ user }) => {
  const evaluationsData = useMemo(() => {
    if (!user.evaluations || user.evaluations.length === 0) return [];
    
    return user.evaluations
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((ev, index) => ({
        date: new Date(ev.timestamp).toLocaleDateString(),
        grade: ev.grade || 0,
        questionType: ev.question_type,
        index
      }));
  }, [user.evaluations]);

  const avgGradeByType = useMemo(() => {
    if (!user.evaluations) return [];
    
    const typeMap = {};
    user.evaluations.forEach((ev, index) => {
      if (!typeMap[ev.question_type]) {
        typeMap[ev.question_type] = { total: 0, count: 0 };
      }
      typeMap[ev.question_type].total += ev.grade || 0;
      typeMap[ev.question_type].count += 1;
    });
    
    return Object.entries(typeMap).map(([type, stats], index) => ({
      name: type,
      value: (stats.total / stats.count).toFixed(1),
      count: stats.count,
      fill: COLORS[index % COLORS.length]
    }));
  }, [user.evaluations]);

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Trend Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-gray-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Grade Progress</span>
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-80">
            {evaluationsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evaluationsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value, name) => [value + '%', 'Grade']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="grade" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-12 h-12 mr-3" />
                <span>No evaluations yet</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Each point represents an evaluation • Green line shows grade percentage over time
          </div>
        </div>

        {/* Evaluations by Type Bar Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-gray-900 dark:text-white">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Evaluations by Type</span>
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-80">
            {avgGradeByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgGradeByType} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" stroke="#9ca3af" tick={{ fontSize: 11 }} height={70} />
                  <YAxis stroke="#9ca3af" tick={false} />
                  <Tooltip 
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value, name, props) => [value + '%', `${props.payload.name} Avg Grade`]}
                  />
                  <Bar dataKey="value" name="Average Grade">
                    {avgGradeByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mr-3" />
                <span>No evaluation data</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
              Total Evaluations: {user.evaluations?.length || 0}
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
              Avg Grade: {user.avg_grade ? user.avg_grade.toFixed(1) + '%' : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      {user.evaluations && user.evaluations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2 text-gray-900 dark:text-white">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Recent Evaluations ({user.evaluations.length})</span>
            </h3>
            {user.total_evaluations > user.evaluations.length && (
              <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                Showing {user.evaluations.length} of {user.total_evaluations} total evaluations
              </div>
            )}
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {user.evaluations.slice(0, 10).map((ev, index) => (
                  <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {ev.short_id || ev.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ev.question_type === 'essay' ? 'bg-blue-100 text-blue-800' :
                        ev.question_type === 'mcq' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {ev.question_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" 
                            style={{ width: `${ev.grade || 0}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{(ev.grade || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ev.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={ev.feedback || 'No feedback'}>
                        {ev.feedback || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {user.evaluations.length > 10 && (
            <div className="text-center pt-4">
              <span className="text-gray-500 dark:text-gray-400">
                Showing 10 of {user.evaluations.length} evaluations. 
                <br />
                <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium cursor-pointer">
                  Full evaluation history available in the Evaluations tab
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{user.total_evaluations || 0}</div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Total Evaluations</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {(user.avg_grade || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-green-800 dark:text-green-300">Average Grade</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{user.subscription_history?.length || 0}</div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Plan Changes</div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionHistoryTab = ({ user }) => (
  <div className="p-6 space-y-6">
    <h3 className="text-xl font-semibold flex items-center space-x-2 text-gray-900 dark:text-white">
      <CreditCard className="w-5 h-5 text-purple-600" />
      <span>Subscription History</span>
    </h3>

    {user.subscription_history && user.subscription_history.length > 0 ? (
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {user.subscription_history.slice(0, 10).map((sub, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    sub.plan === 'pro' ? 'bg-green-100 text-green-800' :
                    sub.plan === 'starter' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.plan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(sub.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Ongoing'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  ${sub.price || 0}/mo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {sub.duration_months || 1} months
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No subscription history</div>
        <div className="text-sm text-gray-400">This user has not upgraded their plan</div>
      </div>
    )}
  </div>
);

const UserDetailModal = ({ userId, open, onClose }) => {
  const { data, isLoading, isError, error, refetch } = useUserDetail(userId);
  const user = data?.user || null;
  const [activeTab, setActiveTab] = useState('profile');

  if (!open) return null;

  if (isLoading) {
    return (
      <Modal open={open} onClose={onClose}>
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Loading user details...</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            This may take a moment for users with many evaluations
          </div>
        </div>
      </Modal>
    );
  }

  if (isError) {
    return (
      <Modal open={open} onClose={onClose}>
        <div className="p-12 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4 text-lg">Failed to load user details</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || 'An error occurred while loading user data'}
          </div>
          <div className="space-x-3">
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex h-full">
        {/* Tab Navigation */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">{user.display_name || 'User'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <nav className="flex-1 py-2">
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User}>
              Profile
            </TabButton>
            <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={Activity}>
              Activity ({user.activity_timeline?.length || 0})
            </TabButton>
            <TabButton active={activeTab === 'evaluations'} onClick={() => setActiveTab('evaluations')} icon={FileText}>
              Evaluations ({user.evaluations?.length || 0})
            </TabButton>
            <TabButton active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} icon={CreditCard}>
              Subscriptions ({user.subscription_history?.length || 0})
            </TabButton>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'activity' && <ActivityTimelineTab user={user} />}
          {activeTab === 'evaluations' && <EvaluationsChartTab user={user} />}
          {activeTab === 'subscriptions' && <SubscriptionHistoryTab user={user} />}
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;

