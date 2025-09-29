import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Footer from '../ui/Footer';

// Enhanced Locked Analytics Page
const LockedAnalyticsPage = ({ onBack, upgradeType, page = 'analytics' }) => {
  const isAnalytics = page === 'analytics';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 flex items-center font-fredoka"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-fredoka font-bold text-gray-900">
              {isAnalytics ? 'Analytics Dashboard' : 'Marking History'}
            </h1>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-fredoka font-medium">
              🔒 Locked
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Lock Icon Animation */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="10" width="12" height="8" rx="3" strokeWidth="2" />
                <path d="M9 10V7a3 3 0 116 0v3" strokeWidth="2" />
                <circle cx="12" cy="14" r="1.5" fill="currentColor" />
              </svg>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          </div>

          <h1 className="text-4xl font-fredoka font-bold text-gray-900 mb-4">
            {isAnalytics ? '📊 Analytics Dashboard' : '📚 Marking History'}
          </h1>
          <p className="text-xl font-fredoka text-gray-600 max-w-2xl mx-auto mb-8">
            {isAnalytics 
              ? 'Unlock detailed insights into your writing progress, skill development, and personalized recommendations.'
              : 'Access your complete marking history and track your progress over time.'
            }
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isAnalytics ? (
            <>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="font-fredoka font-bold text-gray-900 mb-2">Performance Tracking</h3>
                  <p className="font-fredoka text-gray-600 text-sm">Monitor your improvement across different question types</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-fredoka font-bold text-gray-900 mb-2">Skill Analysis</h3>
                  <p className="font-fredoka text-gray-600 text-sm">Identify strengths and areas for improvement</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="font-fredoka font-bold text-gray-900 mb-2">Achievement System</h3>
                  <p className="font-fredoka text-gray-600 text-sm">Earn badges and track your writing milestones</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="font-fredoka font-bold text-gray-900 mb-2">Complete History</h3>
                  <p className="font-fredoka text-gray-600 text-sm">Access all your past essay evaluations</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">🔍</div>
                  <h3 className="font-fredoka font-bold text-gray-900 mb-2">Detailed Reviews</h3>
                  <p className="font-fredoka text-gray-600 text-sm">Re-read AI feedback and track improvements</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-fredoka font-bold text-gray-900 mb-2">Progress Timeline</h3>
                  <p className="font-fredoka text-gray-600 text-sm">See how your writing has evolved over time</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upgrade Options */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-fredoka font-bold text-gray-900 mb-6 text-center">
            🚀 Upgrade to Unlock {isAnalytics ? 'Analytics' : 'History'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-sm">∞</span>
              </div>
              <div className="flex-1">
                <h3 className="font-fredoka font-bold text-white">Unlimited Plans</h3>
                <p className="font-fredoka text-white/90 text-sm">
                  Unlimited questions + {isAnalytics ? 'Analytics Dashboard' : 'Complete History'} + Everything
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-fredoka font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard
const AnalyticsDashboard = ({ onBack, userStats, user, evaluations, onUpgrade }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user has unlimited access
  const hasUnlimitedAccess = useMemo(() => {
    const plan = userStats?.current_plan?.toLowerCase();
    const credits = userStats?.credits;
    return plan === 'unlimited' || credits >= 99999;
  }, [userStats?.current_plan, userStats?.credits]);

  // If user doesn't have unlimited access, show locked page
  if (!hasUnlimitedAccess) {
    return <LockedAnalyticsPage onBack={onBack} page="analytics" />;
  }

  // Handle loading and empty states
  const hasEvaluations = evaluations && evaluations.length > 0;
  const isLoadingEvaluations = evaluations === undefined || evaluations === null;

  // Show loading state
  if (isLoadingEvaluations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              <div className="w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Analytics...</h2>
            <p className="text-gray-600">Fetching your performance data from the server.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no evaluations
  if (!hasEvaluations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              <div className="w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data Yet</h2>
            <p className="text-gray-600 mb-6">Complete some essay evaluations to see your analytics here.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write Your First Essay
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const parsedEvaluations = (evaluations || []).map((e) => {
    const scoreMatch = (e.grade || '').match(/(\d+)\s*\/\s*(\d+)/);
    const score = scoreMatch ? Number(scoreMatch[1]) : 0;
    const max = scoreMatch ? Number(scoreMatch[2]) : 0;
    const date = new Date(e.timestamp);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const type = (e.question_type || 'unknown').toLowerCase();
    const ao1 = typeof e.ao1_marks === 'string' ? Number((e.ao1_marks.match(/\d+/) || [0])[0]) : 0;
    const ao2 = typeof e.ao2_marks === 'string' ? Number((e.ao2_marks.match(/\d+/) || [0])[0]) : 0;
    const reading = typeof e.reading_marks === 'string' ? Number((e.reading_marks.match(/\d+/) || [0])[0]) : 0;
    const writing = typeof e.writing_marks === 'string' ? Number((e.writing_marks.match(/\d+/) || [0])[0]) : 0;
    const percent = max > 0 ? (score / max) * 100 : 0;
    return { ...e, score, max, percent, dateKey, type, ao1, ao2, reading, writing };
  });

  // Aggregate metrics
  const byDate = Object.values(
    parsedEvaluations.reduce((acc, e) => {
      if (!acc[e.dateKey]) acc[e.dateKey] = { date: e.dateKey, total: 0, count: 0 };
      acc[e.dateKey].total += e.score; acc[e.dateKey].count += 1; return acc;
    }, {})
  ).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({ date: d.date, average: Number((d.total/d.count).toFixed(2)) }));

  const byTypeMap = parsedEvaluations.reduce((acc, e) => {
    const label = e.type.replace('_', ' ');
    if (!acc[label]) acc[label] = { type: label, total: 0, count: 0 };
    acc[label].total += e.score; acc[label].count += 1; return acc;
  }, {});
  const byType = Object.values(byTypeMap).map(x => ({ type: x.type, average: Number((x.total/x.count).toFixed(2)), count: x.count }));

  const aoSeries = parsedEvaluations.map(e => ({ date: e.dateKey, AO1: e.ao1, AO2: e.ao2, Reading: e.reading, Writing: e.writing }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  // Range filter + nicer view data
  const daysForRange = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : selectedTimeRange === 'quarter' ? 90 : null;
  const cutoff = daysForRange ? new Date(Date.now() - daysForRange * 24 * 60 * 60 * 1000) : null;
  const viewEvaluations = cutoff ? parsedEvaluations.filter(e => {
    const d = new Date(e.dateKey);
    return d >= cutoff;
  }) : parsedEvaluations;

  const viewByDate = Object.values(viewEvaluations.reduce((acc, e) => {
    if (!acc[e.dateKey]) acc[e.dateKey] = { date: e.dateKey, total: 0, count: 0 };
    acc[e.dateKey].total += (e.max > 0 ? (e.score / e.max) * 100 : 0);
    acc[e.dateKey].count += 1;
    return acc;
  }, {})).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({ date: d.date, average: Number((d.total/d.count).toFixed(2)) }));

  const viewByTypeMap = viewEvaluations.reduce((acc, e) => {
    const label = e.type.replace('_', ' ');
    if (!acc[label]) acc[label] = { type: label, total: 0, count: 0 };
    acc[label].total += (e.max > 0 ? (e.score / e.max) * 100 : 0); acc[label].count += 1; return acc;
  }, {});
  const viewByType = Object.values(viewByTypeMap).map(x=>({ type: x.type, average: Number((x.total/x.count).toFixed(2)), count: x.count }));

  const viewAoSeries = viewEvaluations.map(e => ({ date: e.dateKey, AO1: e.ao1, AO2: e.ao2, Reading: e.reading, Writing: e.writing }));

  // Type distribution (donut)
  const typeDistribution = viewByType.map(t => ({ name: t.type, value: t.count }));
  const totalTypeCount = typeDistribution.reduce((s, x) => s + x.value, 0) || 1;
  const totalResponses = viewEvaluations.length;

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white rounded-xl shadow p-3 border border-gray-100">
        {label && <div className="text-xs font-semibold mb-1 text-gray-700">{label}</div>}
        {payload.map((p, i) => (
          <div key={i} className="text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-semibold text-gray-900">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 flex items-center font-fredoka"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900 font-fredoka">📊 Analytics Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-fredoka">Your Writing Analytics</h2>
          <p className="text-gray-600 font-fredoka">Track your progress, identify patterns, and optimize your performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200">
            {[
              { id: 'overview', label: '📈 Overview', icon: '📊' },
              { id: 'performance', label: '🎯 Performance', icon: '🏆' },
              { id: 'progress', label: '📈 Progress', icon: '📈' },
              { id: 'insights', label: '💡 Insights', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 font-fredoka ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 font-fredoka">Time Range:</span>
            {['week','month','quarter','all'].map(r => (
              <button 
                key={r} 
                onClick={()=>setSelectedTimeRange(r)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTimeRange===r 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                {r==='week'?'7 Days':r==='month'?'30 Days':r==='quarter'?'90 Days':'All Time'}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 font-fredoka">
            📊 Showing <span className="font-semibold text-gray-900">{totalResponses}</span> responses
          </div>
        </div>
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {viewByDate.length > 0 ? '↗️' : '→'} {viewByDate.length > 0 ? Math.round((viewByDate[viewByDate.length - 1]?.average || 0) - (viewByDate[0]?.average || 0)) : 0}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 font-fredoka">
              {Math.round((viewByDate.reduce((s,d)=>s+d.average,0)/(viewByDate.length||1))||0)}%
            </div>
            <div className="text-sm text-gray-600 font-fredoka">Average Score</div>
            <div className="text-xs text-gray-500 mt-2">Across selected range</div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📅</span>
              </div>
              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {new Set(viewByDate?.map(d=>d.date)).size || 0} days
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 font-fredoka">
              {new Set(viewByDate?.map(d=>d.date)).size || 0}
            </div>
            <div className="text-sm text-gray-600 font-fredoka">Active Days</div>
            <div className="text-xs text-gray-500 mt-2">Days with submissions</div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {viewByType.length} types
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 font-fredoka">
              {viewByType.length}
            </div>
            <div className="text-sm text-gray-600 font-fredoka">Question Types</div>
            <div className="text-xs text-gray-500 mt-2">Unique types attempted</div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                Best
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 font-fredoka">
              {Math.round(Math.max(...parsedEvaluations.map(e => (e.max>0?(e.score/e.max)*100:0)), 0))}%
            </div>
            <div className="text-sm text-gray-600 font-fredoka">Best Score</div>
            <div className="text-xs text-gray-500 mt-2">Highest single percentage</div>
          </motion.div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Performance Overview Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-fredoka">📈 Performance Trend</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Last {selectedTimeRange === 'week' ? '7' : selectedTimeRange === 'month' ? '30' : selectedTimeRange === 'quarter' ? '90' : 'All'} days</span>
              </div>
              
              {/* Simple Line Chart */}
              <div className="h-64 flex items-end justify-between gap-2">
                {viewByDate.length > 0 ? (
                  viewByDate.map((data, index) => (
                    <div key={data.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-600"
                        style={{ height: `${Math.max((data.average / 100) * 200, 10)}px` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 font-fredoka">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs font-bold text-gray-900 font-fredoka">
                        {data.average}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-gray-500 font-fredoka">
                    No data available for selected time range
                  </div>
                )}
              </div>
            </div>

            {/* Question Type Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-fredoka">🎯 Type Performance</h3>
                <div className="space-y-4">
                  {viewByType.sort((a,b)=>b.average-a.average).slice(0,5).map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 font-fredoka capitalize">{type.type}</div>
                          <div className="text-sm text-gray-600">{type.count} attempts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 font-fredoka">{type.average}%</div>
                        <div className="text-xs text-gray-500">Average</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-fredoka">📊 Component Analysis</h3>
                <div className="space-y-4">
                  {['AO1','AO2','Reading','Writing'].map(key => {
                    const vals = viewAoSeries.map(v => v[key] || 0);
                    const avg = Math.round(vals.reduce((s,n)=>s+n,0) / (vals.length||1));
                    const max = Math.max(...vals, 0);
                    return (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900 font-fredoka">{key}</div>
                          <div className="text-sm text-gray-600">Best: {max}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((avg / Math.max(max, 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Average: {avg}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Detailed Performance Metrics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-fredoka">🏆 Performance Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {viewByType.map((type, index) => (
                  <div key={type.type} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-gray-900 font-fredoka capitalize">{type.type}</div>
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">#{index + 1}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-semibold text-gray-900">{type.average}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Attempts:</span>
                        <span className="font-semibold text-gray-900">{type.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{ width: `${Math.min(type.average, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Progress Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-fredoka">📈 Progress Timeline</h3>
              <div className="space-y-4">
                {viewByDate.map((data, index) => (
                  <div key={data.date} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 font-fredoka">
                        {new Date(data.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">Performance: {data.average}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 font-fredoka">{data.average}%</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            {/* AI Recommendations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-fredoka">💡 Smart Recommendations</h3>
                <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">AI Powered</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewByType.sort((a,b)=>a.average-b.average).slice(0,3).map(t => (
                  <div key={t.type} className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <div className="font-bold text-gray-900 mb-2 font-fredoka capitalize">Focus on: {t.type}</div>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      <li>Review model answers and mark schemes</li>
                      <li>Practice structure and clarity</li>
                      <li>Set a word goal of +10%</li>
                      <li>Attempt 2 new prompts this week</li>
                    </ul>
                  </div>
                ))}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="font-bold text-gray-900 mb-2 font-fredoka">General Tips</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Keep a personal glossary of advanced vocabulary</li>
                    <li>Summarize feedback into 3 bullet points</li>
                    <li>Re-attempt lowest-scoring types after 48 hours</li>
                    <li>Track your progress weekly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;
