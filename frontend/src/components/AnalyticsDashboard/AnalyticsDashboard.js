import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

import { getBackendUrl } from '../../utils/backendUrl';
import api from '../../services/api';

// Enhanced Locked Analytics Page
const LockedAnalyticsPage = ({ onBack, upgradeType, page = 'analytics' }) => {
  const isAnalytics = page === 'analytics';
  const isHistory = page === 'history';
  
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
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [selectedPaperType, setSelectedPaperType] = useState('all');
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userStats.currentPlan?.toLowerCase();
    return plan === 'unlimited';
  };

  if (!hasUnlimitedAccess()) {
    return <LockedAnalyticsPage onBack={onBack} upgradeType="unlimited" page="analytics" />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
            <div />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {['week','month','quarter','all'].map(r => (
              <button key={r} onClick={()=>setSelectedTimeRange(r)} className={`px-3 py-1.5 rounded-full text-sm border ${selectedTimeRange===r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                {r==='week'?'7d':r==='month'?'30d':r==='quarter'?'90d':'All'}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{totalResponses}</span> responses</div>
        </div>
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Average</div>
            <div className="text-3xl font-bold text-blue-600">{Math.round((viewByDate.reduce((s,d)=>s+d.average,0)/(viewByDate.length||1))||0)}%</div>
            <div className="text-xs text-gray-500 mt-2">Across selected range (percent)</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Active Days</div>
            <div className="text-3xl font-bold text-emerald-600">{new Set(viewByDate?.map(d=>d.date)).size || 0}</div>
            <div className="text-xs text-gray-500 mt-2">Days with submissions</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Types Attempted</div>
            <div className="text-3xl font-bold text-purple-600">{viewByType.length}</div>
            <div className="text-xs text-gray-500 mt-2">Unique question types</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Best</div>
            <div className="text-3xl font-bold text-orange-600">{Math.round(Math.max(...parsedEvaluations.map(e => (e.max>0?(e.score/e.max)*100:0)), 0))}%</div>
            <div className="text-xs text-gray-500 mt-2">Highest single percentage</div>
          </div>
        </div>

        {/* Type Insights */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Type Insights</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Top performers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {viewByType.sort((a,b)=>b.average-a.average).slice(0,6).map((t,i)=> (
              <div key={t.type} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium capitalize text-gray-900 truncate">{t.type}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200">#{i+1}</span>
                </div>
                <div className="text-sm text-gray-600">Average <span className="font-semibold text-gray-900">{t.average}</span> • Attempts <span className="font-semibold text-gray-900">{t.count}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Recommendations</h3>
            <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">Next steps</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewByType.sort((a,b)=>a.average-b.average).slice(0,3).map(t => (
              <div key={t.type} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <div className="font-semibold capitalize text-gray-900 mb-1">Practice more: {t.type}</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Review model answers and mark schemes for this type</li>
                  <li>Focus on structure and clarity; set a word goal of +10%</li>
                  <li>Attempt 2 new prompts this week in this category</li>
                </ul>
              </div>
            ))}
            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
              <div className="font-semibold text-gray-900 mb-1">General Tips</div>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Keep a personal glossary of advanced vocabulary</li>
                <li>Summarize feedback into 3 bullet points after each attempt</li>
                <li>Re-attempt your lowest-scoring type after 48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Component Strengths */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Component Strengths</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">AO & Submarks</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['AO1','AO2','Reading','Writing'].map(key => {
              const vals = viewAoSeries.map(v => v[key] || 0);
              const avg = Math.round(vals.reduce((s,n)=>s+n,0) / (vals.length||1));
              const max = Math.max(...vals, 0);
              return (
                <div key={key} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">{key}</div>
                  <div className="text-2xl font-bold text-gray-900">{avg}</div>
                  <div className="text-xs text-gray-500 mt-1">Best: {max}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalResponses}</div>
            <div className="text-gray-600">Total Responses</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">{Object.keys(byDate).length}</div>
            <div className="text-gray-600">Active Days</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">{byType.length}</div>
            <div className="text-gray-600">Types Attempted</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-orange-600 mb-2">{Math.max(...parsedEvaluations.map(e => e.score), 0)}</div>
            <div className="text-gray-600">Best Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
