import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import { supabase } from './supabaseClient';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import PaymentSuccess from './PaymentSuccess';
import subscriptionService from './services/subscriptionService';
import toast, { Toaster } from 'react-hot-toast';
import SubscriptionDashboard from './SubscriptionDashboard';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Supabase configuration is now in supabaseClient.js

// PayU modals removed - ready for DodoPayments integration

// Pricing Page Component
const PricingPage = ({ onBack, user }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-fredoka font-bold mb-3">Pricing Coming Soon</h1>
        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-fredoka">
          🎉 Launch Event: Enjoy unlimited access for free!
        </span>
      </div>

      {/* Coming Soon Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-fredoka font-bold mb-4">Pricing Plans Are Coming Soon!</h2>
              <p className="text-gray-600 mb-6 text-lg">
                We're working on bringing you the best pricing options. 
                In the meantime, all users get <span className="font-semibold text-green-600">unlimited access for free</span> as part of our launch event!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="font-fredoka font-semibold text-lg mb-3">Your Current Benefits:</h3>
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited essay marking</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced analytics and insights</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Detailed feedback and suggestions</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Progress tracking</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-fredoka font-semibold hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keyboard Shortcuts Help Component
const KeyboardShortcutsHelp = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-fredoka font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Dashboard</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 1</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Analytics</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 2</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">History</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 3</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Account</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Alt + 4</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Submit Form</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl + Enter</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-fredoka text-sm text-gray-700">Go Back/Close</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Escape</kbd>
          </div>
          <div className="border-t pt-3 mt-3">
            <p className="text-xs text-gray-500 font-fredoka">
              Press <kbd className="px-1 bg-gray-100 rounded">?</kbd> to show this help again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ENHANCED Locked Analytics/History Page
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

const LockedFeatureCard = ({ onUpgrade }) => (
  <div className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
    <div className="absolute inset-0 bg-gray-100 bg-opacity-70 flex items-center justify-center rounded-xl z-10">
      <div className="flex flex-col items-center">
        <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7m0 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-lg font-bold text-gray-900 mb-1">Unlimited Feature</h4>
        <p className="text-gray-600 mb-3 text-center">Upgrade to Unlimited to unlock AI-Recommended Microtasks</p>
        <button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
        >
          Upgrade to Unlimited
        </button>
      </div>
    </div>
    <div className="opacity-40 pointer-events-none w-full h-full">
      <h3 className="text-xl font-fredoka font-bold text-gray-900 mb-4">🤖 AI-Recommended Microtasks</h3>
      <p className="text-gray-700">Personalized microtasks will appear here for Unlimited users.</p>
    </div>
  </div>
);

// Analytics Dashboard
const AnalyticsDashboard = ({ onBack, userStats, user, evaluations, onUpgrade }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [selectedPaperType, setSelectedPaperType] = useState('all');
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userStats.currentPlan?.toLowerCase();
    return plan === 'unlimited';
  };
  
  // Fetch AI recommendations when component mounts or evaluations change
  // This hook must be called before any conditional returns (React rules of hooks)
  useEffect(() => {
    // Only fetch recommendations if user has unlimited access
    if (!hasUnlimitedAccess()) return;
    
    const fetchRecommendations = async () => {
      if (!user?.id || evaluations.length === 0) return;
      
      // Check if we should fetch recommendations (1st, 5th, 10th, etc.)
      const evalCount = evaluations.length;
      const shouldFetch = evalCount === 1 || evalCount === 5 || evalCount === 10 || 
                         (evalCount > 10 && evalCount % 5 === 0);
      
      if (!shouldFetch && !aiRecommendations) {
        // Try to get cached recommendations if not a milestone
        setIsLoadingRecommendations(true);
        try {
          // Get the current session for auth token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.error('No valid session found');
            setIsLoadingRecommendations(false);
            return;
          }
          
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/analytics/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.analytics?.recommendations) {
              setAiRecommendations(data.analytics.recommendations);
            }
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        } finally {
          setIsLoadingRecommendations(false);
        }
      }
    };
    
    fetchRecommendations();
  }, [user, evaluations.length]);

  // Check access after hooks (React rules of hooks requirement)
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
    const ao3 = typeof e.ao3_marks === 'string' ? Number((e.ao3_marks.match(/\d+/) || [0])[0]) : 0;
    const reading = typeof e.reading_marks === 'string' ? Number((e.reading_marks.match(/\d+/) || [0])[0]) : 0;
    const writing = typeof e.writing_marks === 'string' ? Number((e.writing_marks.match(/\d+/) || [0])[0]) : 0;
    const style = typeof e.style_marks === 'string' ? Number((e.style_marks.match(/\d+/) || [0])[0]) : 0;
    const accuracy = typeof e.accuracy_marks === 'string' ? Number((e.accuracy_marks.match(/\d+/) || [0])[0]) : 0;
    const percent = max > 0 ? (score / max) * 100 : 0;
    return { ...e, score, max, percent, dateKey, type, ao1, ao2, ao3, reading, writing, style, accuracy };
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

  const aoSeries = parsedEvaluations.map(e => ({ 
    date: e.dateKey, 
    AO1: e.ao1, 
    AO2: e.ao2, 
    AO3: e.ao3,
    Reading: e.reading, 
    Writing: e.writing,
    Style: e.style,
    Accuracy: e.accuracy
  }));

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

  const viewAoSeries = viewEvaluations.map(e => ({ 
    date: e.dateKey, 
    AO1: e.ao1, 
    AO2: e.ao2, 
    AO3: e.ao3,
    Reading: e.reading, 
    Writing: e.writing,
    Style: e.style,
    Accuracy: e.accuracy
  }));

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

        {/* Type Insights - Enhanced */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Type Performance Analysis</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Detailed breakdown</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Average Score by Type</h4>
              {viewByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={viewByType.sort((a,b) => b.average - a.average)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="type" 
                      tick={{ fontSize: 10 }} 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="average" fill="#10b981" radius={[8, 8, 0, 0]}>
                      {viewByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.average >= 70 ? '#10b981' : entry.average >= 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            
            {/* Type Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Performance Breakdown</h4>
              {viewByType.sort((a,b)=>b.average-a.average).slice(0,5).map((t,i)=> {
                const performanceLevel = t.average >= 70 ? 'Excellent' : t.average >= 50 ? 'Good' : 'Needs Work';
                const levelColor = t.average >= 70 ? 'text-green-600' : t.average >= 50 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <div key={t.type} className="rounded-xl border border-gray-100 p-3 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize text-gray-900">{t.type.replace(/_/g, ' ')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                            {i === 0 ? '👑 Best' : `#${i+1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Avg: <span className="font-bold">{t.average}%</span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Attempts: <span className="font-bold">{t.count}</span>
                          </span>
                          <span className={`text-xs font-medium ${levelColor}`}>
                            {performanceLevel}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            stroke={t.average >= 70 ? '#10b981' : t.average >= 50 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="4" 
                            fill="none"
                            strokeDasharray={`${(t.average / 100) * 176} 176`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700">{Math.round(t.average)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI-Powered Recommendations */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">AI Insights & Recommendations</h3>
            <div className="flex items-center gap-2">
              {isLoadingRecommendations && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              )}
              <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                {aiRecommendations ? 'Personalized' : 'Loading...'}
              </span>
            </div>
          </div>
          
          {aiRecommendations ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="whitespace-pre-wrap text-gray-700">
                  {aiRecommendations.split('\n').map((line, idx) => {
                    // Format bullet points nicely
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 mb-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="flex-1">{line.replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    // Format headers
                    if (line.trim() && !line.startsWith(' ') && line.endsWith(':')) {
                      return <div key={idx} className="font-semibold text-gray-900 mt-4 mb-2">{line}</div>;
                    }
                    // Regular text
                    return line.trim() ? <div key={idx} className="mb-2">{line}</div> : null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fallback recommendations based on data */}
              {viewByType.sort((a,b)=>a.average-b.average).slice(0,2).map(t => (
                <div key={t.type} className="rounded-xl border border-gray-100 p-4 bg-gradient-to-br from-gray-50 to-white">
                  <div className="font-semibold capitalize text-gray-900 mb-2">
                    <span className="text-orange-500">⚠️</span> Focus Area: {t.type}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Current Average: <span className="font-bold text-red-600">{t.average}%</span>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Review exemplar answers for this question type</li>
                    <li>Practice time management - aim for completion in allocated time</li>
                    <li>Focus on addressing all marking criteria</li>
                  </ul>
                </div>
              ))}
              
              {/* Strengths */}
              {viewByType.sort((a,b)=>b.average-a.average).slice(0,1).map(t => (
                <div key={`strength-${t.type}`} className="rounded-xl border border-gray-100 p-4 bg-gradient-to-br from-green-50 to-white">
                  <div className="font-semibold capitalize text-gray-900 mb-2">
                    <span className="text-green-500">✓</span> Strength: {t.type}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Current Average: <span className="font-bold text-green-600">{t.average}%</span>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>Maintain consistency in this area</li>
                    <li>Challenge yourself with harder prompts</li>
                    <li>Help peers by sharing your approach</li>
                  </ul>
                </div>
              ))}
              
              <div className="rounded-xl border border-gray-100 p-4 bg-gradient-to-br from-blue-50 to-white">
                <div className="font-semibold text-gray-900 mb-2">
                  <span className="text-blue-500">💡</span> General Tips
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Complete {evaluations.length < 5 ? 5 - evaluations.length : 'more'} assessments to unlock AI insights</li>
                  <li>Review feedback immediately after each submission</li>
                  <li>Track your progress weekly</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Component Strengths */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Component Strengths</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">Submarks Analysis</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              // Dynamically determine which components have data
              const componentKeys = [];
              const hasAO1 = viewAoSeries.some(v => v.AO1 > 0);
              const hasAO2 = viewAoSeries.some(v => v.AO2 > 0);
              const hasAO3 = viewAoSeries.some(v => v.AO3 > 0);
              const hasReading = viewAoSeries.some(v => v.Reading > 0);
              const hasWriting = viewAoSeries.some(v => v.Writing > 0);
              const hasStyle = viewAoSeries.some(v => v.Style > 0);
              const hasAccuracy = viewAoSeries.some(v => v.Accuracy > 0);
              
              if (hasAO1) componentKeys.push('AO1');
              if (hasAO2) componentKeys.push('AO2');
              if (hasAO3) componentKeys.push('AO3');
              if (hasReading) componentKeys.push('Reading');
              if (hasWriting) componentKeys.push('Writing');
              if (hasStyle) componentKeys.push('Style');
              if (hasAccuracy) componentKeys.push('Accuracy');
              
              // If no components found, show a message
              if (componentKeys.length === 0) {
                return (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No component data available yet. Complete more assessments to see detailed breakdown.
                  </div>
                );
              }
              
              return componentKeys.map(key => {
                const vals = viewAoSeries.map(v => v[key] || 0).filter(v => v > 0);
                const avg = vals.length > 0 ? Math.round(vals.reduce((s,n)=>s+n,0) / vals.length) : 0;
                const max = vals.length > 0 ? Math.max(...vals) : 0;
                const trend = vals.length > 1 ? (vals[vals.length-1] > vals[0] ? '↑' : vals[vals.length-1] < vals[0] ? '↓' : '→') : '';
                
                return (
                  <div key={key} className="rounded-xl border border-gray-100 p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-500">{key}</div>
                      {trend && <span className={`text-xs font-bold ${trend === '↑' ? 'text-green-500' : trend === '↓' ? 'text-red-500' : 'text-gray-400'}`}>{trend}</span>}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{avg}</div>
                    <div className="text-xs text-gray-500 mt-1">Best: {max}</div>
                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width: `${Math.min((avg/max)*100 || 0, 100)}%`}} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Key Stats - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-blue-600">{totalResponses}</div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">📝</span>
              </div>
            </div>
            <div className="text-gray-600">Total Responses</div>
            <div className="text-xs text-gray-400 mt-1">
              {viewEvaluations.length} in selected period
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-green-600">{Object.keys(byDate).length}</div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">📅</span>
              </div>
            </div>
            <div className="text-gray-600">Active Days</div>
            <div className="text-xs text-gray-400 mt-1">
              {Math.round((Object.keys(byDate).length / Math.max(1, (new Date() - new Date(parsedEvaluations[0]?.timestamp)) / (1000 * 60 * 60 * 24))) * 100)}% consistency
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-purple-600">{byType.length}</div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">📚</span>
              </div>
            </div>
            <div className="text-gray-600">Types Attempted</div>
            <div className="text-xs text-gray-400 mt-1">
              Most frequent: {byType.sort((a,b) => b.count - a.count)[0]?.type || 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-orange-600">{Math.max(...parsedEvaluations.map(e => e.score), 0)}</div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600">🏆</span>
              </div>
            </div>
            <div className="text-gray-600">Best Score</div>
            <div className="text-xs text-gray-400 mt-1">
              Avg: {Math.round(parsedEvaluations.reduce((s,e) => s + e.score, 0) / Math.max(1, parsedEvaluations.length))}
            </div>
          </div>
        </div>
        
        {/* Performance Trends - New Section */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Performance Trends</h3>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Last {daysForRange || 'All'} days</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Line Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Score Progress Over Time</h4>
              {viewByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={viewByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
            
            {/* Weekly Activity Heatmap */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Weekly Activity Pattern</h4>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-xs text-center text-gray-500 font-medium pb-1">
                    {day}
                  </div>
                ))}
                {(() => {
                  const last4Weeks = [];
                  const today = new Date();
                  const activityMap = {};
                  
                  // Create activity map
                  parsedEvaluations.forEach(e => {
                    const date = e.dateKey;
                    activityMap[date] = (activityMap[date] || 0) + 1;
                  });
                  
                  // Generate last 28 days
                  for (let i = 27; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                    const activity = activityMap[dateKey] || 0;
                    
                    last4Weeks.push({
                      date: dateKey,
                      activity,
                      intensity: activity === 0 ? 0 : activity === 1 ? 1 : activity === 2 ? 2 : 3
                    });
                  }
                  
                  return last4Weeks.map((day, idx) => {
                    const colors = ['bg-gray-100', 'bg-green-200', 'bg-green-400', 'bg-green-600'];
                    return (
                      <div 
                        key={idx} 
                        className={`aspect-square rounded ${colors[day.intensity]} hover:ring-2 hover:ring-green-500 transition-all cursor-pointer`}
                        title={`${day.date}: ${day.activity} submissions`}
                      />
                    );
                  });
                })()}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                  {['bg-gray-100', 'bg-green-200', 'bg-green-400', 'bg-green-600'].map((color, idx) => (
                    <div key={idx} className={`w-3 h-3 rounded ${color}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// History Page
const HistoryPage = ({ onBack, evaluations, userPlan }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  
  // Helper function for unlimited plan checking
  const hasUnlimitedAccess = () => {
    const plan = userPlan?.toLowerCase();
    return plan === 'unlimited';
  };
  
  // Parse feedback text into bullet points
  const parseFeedbackToBullets = (feedback) => {
    if (!feedback) return [];
    
    // Split by common delimiters
    const sentences = feedback
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Only meaningful sentences
      .slice(0, 10); // Limit to 10 points
    
    return sentences;
  };

  const getSubmarks = (evaluation) => {
    if (!evaluation) return [];
    const metricsByType = {
      igcse_writers_effect: ['READING'],
      igcse_descriptive: ['READING', 'WRITING'],
      igcse_narrative: ['READING', 'WRITING'],
      igcse_summary: ['READING', 'WRITING'],
      alevel_directed: ['AO1', 'AO2'],
      alevel_directed_writing: ['AO1', 'AO2'],
      alevel_comparative: ['AO1', 'AO3'],
      alevel_text_analysis: ['AO1', 'AO3'],
    };
    const defaultMax = {
      igcse_writers_effect: { READING: 15 },
      igcse_descriptive: { READING: 16, WRITING: 24 },
      igcse_narrative: { READING: 16, WRITING: 24 },
      igcse_summary: { READING: 10, WRITING: 5 },
      alevel_directed: { AO1: 5, AO2: 5 },
      alevel_directed_writing: { AO1: 5, AO2: 5 },
      alevel_comparative: { AO1: 5, AO3: 10 },
      alevel_text_analysis: { AO1: 5, AO3: 20 },
    };
    const formatValue = (raw, fallbackMax) => {
      if (!raw || typeof raw !== 'string') return '';
      const text = raw.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
      const slash = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (slash) return `${slash[1]}/${slash[2]}`;
      const outOf = text.match(/(\d+)\s*(?:out of|of)\s*(\d+)/i);
      if (outOf) return `${outOf[1]}/${outOf[2]}`;
      const firstNum = text.match(/\d+/);
      if (firstNum && fallbackMax) return `${firstNum[0]}/${fallbackMax}`;
      return firstNum ? firstNum[0] : '';
    };
    const type = evaluation.question_type;
    const metrics = metricsByType[type] || [];
    const results = [];
    metrics.forEach((metric) => {
      let raw = '';
      if (metric === 'READING') raw = evaluation.reading_marks || '';
      if (metric === 'WRITING') raw = evaluation.writing_marks || '';
      if (metric === 'AO1') raw = evaluation.ao1_marks || '';
      if (metric === 'AO2') raw = evaluation.ao2_marks || '';
      if (metric === 'AO3') raw = evaluation.ao3_marks || evaluation.ao2_marks || evaluation.ao1_marks || '';
      const value = formatValue(raw, defaultMax[type]?.[metric]);
      if (value) results.push({ label: metric, value });
    });
    return results;
  };

  const toggleSelectForCompare = (evaluation) => {
    setSelectedForCompare((prev) => {
      const exists = prev.find((e) => e.id === evaluation.id);
      if (exists) {
        return prev.filter((e) => e.id !== evaluation.id);
      }
      if (prev.length >= 2) {
        // replace the first selected if already two
        return [prev[1], evaluation];
      }
      return [...prev, evaluation];
    });
  };

  const openCompare = () => {
    if (selectedForCompare.length === 2) setShowCompare(true);
  };
  
  // Filter and search evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    // Text search in student response, feedback, and question type
    const matchesSearch = searchTerm === '' || 
      evaluation.student_response.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.question_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.grade.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by question type
    const matchesFilter = filterType === 'all' || 
      evaluation.question_type.includes(filterType);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort evaluations
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    switch (sortBy) {
      case 'oldest':
        return dateA - dateB;
      case 'newest':
      default:
        return dateB - dateA;
      case 'grade_high':
        const gradeA = parseInt(a.grade.match(/\d+/)?.[0] || 0);
        const gradeB = parseInt(b.grade.match(/\d+/)?.[0] || 0);
        return gradeB - gradeA;
      case 'grade_low':
        const gradeA2 = parseInt(a.grade.match(/\d+/)?.[0] || 0);
        const gradeB2 = parseInt(b.grade.match(/\d+/)?.[0] || 0);
        return gradeA2 - gradeB2;
    }
  });
  
  useEffect(() => {
    const onKey = (e) => {
      if (selectedEvaluation && e.key === 'Escape') {
        e.preventDefault();
        setSelectedEvaluation(null);
      }
      if (showCompare && e.key === 'Escape') {
        e.preventDefault();
        setShowCompare(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEvaluation, showCompare]);

  if (!hasUnlimitedAccess()) {
    return <LockedAnalyticsPage onBack={onBack} upgradeType="unlimited" page="history" />;
  }

  const StrengthsDiffChip = ({ a, b }) => {
    const aSet = new Set((a || []).map(s => s.trim().toLowerCase()));
    const bSet = new Set((b || []).map(s => s.trim().toLowerCase()));
    const added = [...bSet].filter(x => !aSet.has(x));
    const removed = [...aSet].filter(x => !bSet.has(x));
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {added.map((s, i) => (
          <span key={`added-${i}`} className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">+ {s}</span>
        ))}
        {removed.map((s, i) => (
          <span key={`removed-${i}`} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">- {s}</span>
        ))}
      </div>
    );
  };

  const CompareModal = ({ a, b, onClose }) => {
    if (!a || !b) return null;
    const scoreA = parseInt(a.grade.match(/\d+/)?.[0] || 0);
    const maxA = parseInt(a.grade.match(/\/(\d+)/)?.[1] || 0);
    const scoreB = parseInt(b.grade.match(/\d+/)?.[0] || 0);
    const maxB = parseInt(b.grade.match(/\/(\d+)/)?.[1] || 0);

    const subsA = getSubmarks(a);
    const subsB = getSubmarks(b);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Compare Evaluations">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Side-by-side Comparison</h2>
            <button onClick={onClose} aria-label="Close compare" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{new Date(a.timestamp).toLocaleString()}</div>
                  <div className="font-semibold">{a.question_type.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                </div>
                <div className="text-blue-600 font-bold text-xl">{a.grade}</div>
              </div>
              <div className="mt-3">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: maxA ? `${(scoreA/maxA)*100}%` : '0%' }}></div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Submarks</h4>
                <div className="flex flex-wrap gap-2">
                  {subsA.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs border">{s.label}: {s.value}</span>
                  ))}
                </div>
              </div>
              {Array.isArray(a.strengths) && a.strengths.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 text-sm text-green-800">
                    {a.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {Array.isArray(a.improvement_suggestions) && a.improvement_suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Improvements</h4>
                  <ul className="list-disc pl-5 text-sm text-yellow-800">
                    {a.improvement_suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{new Date(b.timestamp).toLocaleString()}</div>
                  <div className="font-semibold">{b.question_type.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                </div>
                <div className="text-blue-600 font-bold text-xl">{b.grade}</div>
              </div>
              <div className="mt-3">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: maxB ? `${(scoreB/maxB)*100}%` : '0%' }}></div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Submarks</h4>
                <div className="flex flex-wrap gap-2">
                  {subsB.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs border">{s.label}: {s.value}</span>
                  ))}
                </div>
              </div>
              {Array.isArray(b.strengths) && b.strengths.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 text-sm text-green-800">
                    {b.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {Array.isArray(b.improvement_suggestions) && b.improvement_suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Improvements</h4>
                  <ul className="list-disc pl-5 text-sm text-yellow-800">
                    {b.improvement_suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Strengths diff */}
          <div className="mt-6">
            <h4 className="font-semibold">Strengths Diff</h4>
            <StrengthsDiffChip a={a.strengths} b={b.strengths} />
          </div>
        </div>
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
            <h1 className="text-xl font-bold text-gray-900">Marking History</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={openCompare}
                disabled={selectedForCompare.length !== 2}
                className={`px-3 py-2 rounded-lg ${selectedForCompare.length === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 cursor-not-allowed'}`}
                aria-label="Compare selected evaluations"
              >
                Compare (2)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search essays, feedback, or grades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="igcse">IGCSE</option>
                <option value="alevel">A-Level</option>
                <option value="summary">Summary</option>
                <option value="narrative">Narrative</option>
                <option value="descriptive">Descriptive</option>
                <option value="directed">Directed Writing</option>
              </select>
            </div>
            
            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="grade_high">Highest Grade</option>
                <option value="grade_low">Lowest Grade</option>
              </select>
            </div>
          </div>
          
          {/* Results Count and Selection */}
          <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
            <div>
              Showing {filteredEvaluations.length} of {evaluations.length} evaluations
              {searchTerm && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">"{searchTerm}"</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Selected: {selectedForCompare.length} / 2
            </div>
          </div>
        </div>

        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No evaluations yet</h2>
            <p className="text-gray-600">Start your first assessment to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvaluations.map((evaluation) => {
              const isSelected = !!selectedForCompare.find((e) => e.id === evaluation.id);
              return (
                <div
                  key={evaluation.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border ${isSelected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 hover:shadow-md'} transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-4">
                          {evaluation.question_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {evaluation.grade}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {new Date(evaluation.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {evaluation.student_response.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          aria-label="Select for compare"
                          checked={isSelected}
                          onChange={() => toggleSelectForCompare(evaluation)}
                          className="w-4 h-4"
                        />
                        Compare
                      </label>
                      <button
                        onClick={() => setSelectedEvaluation(evaluation)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        aria-label="View details"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Evaluation Detail Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Evaluation Details">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Evaluation Details</h2>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Grade</h3>
                  <p className="text-blue-600 font-medium">{selectedEvaluation.grade}</p>
                </div>
                <div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <ul className="list-disc pl-5 text-gray-700">
                      {parseFeedbackToBullets(selectedEvaluation.feedback)}
                    </ul>
                  </div>
                </div>
                {selectedEvaluation.strengths && selectedEvaluation.strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Strengths</h3>
                    <div className="space-y-2">
                      {selectedEvaluation.strengths.map((strength, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded-xl">
                          <p className="text-green-800 text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvaluation.improvement_suggestions && selectedEvaluation.improvement_suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Improvement Suggestions</h3>
                    <div className="space-y-2">
                      {selectedEvaluation.improvement_suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-xl">
                          <p className="text-yellow-800 text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && selectedForCompare.length === 2 && (
        <CompareModal a={selectedForCompare[0]} b={selectedForCompare[1]} onClose={() => setShowCompare(false)} />)
      }
    </div>
  );
};




// --- Replace AccountSettingsPage with a stable version ---
const AccountPage = ({ onBack, user, userStats, onLevelChange, showLevelPrompt = false, darkMode, toggleDarkMode, onPricing }) => {
  const [academicLevel, setAcademicLevel] = useState('');
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    setError('');
    const userId = user?.uid || user?.id;
    if (user && userId) {
      // Fetch user data and academic level
      axios.get(`${API}/users/${userId}`).then(res => {
        if (!mounted) return;
        let backendLevel = res.data.user?.academic_level || '';
        backendLevel = backendLevel.toLowerCase().replace(/[^a-z]/g, '');
        setAcademicLevel(backendLevel);
      }).catch(() => {
        // Silently handle error
      });

      // Fetch transaction history
      setTransactionsLoading(true);
      axios.get(`${API}/transactions/${userId}`).then(res => {
        if (!mounted) return;
        setTransactions(res.data.transactions || []);
        setTransactionsLoading(false);
      }).catch(() => {
        if (mounted) setTransactionsLoading(false);
      });
    }
    return () => { mounted = false; };
  }, [user]);

  // Helper function to format transaction amount
  const formatTransactionAmount = (amountInr) => {
    // Convert INR paise to USD (assuming 1 USD = 83 INR for realistic conversion)
    const inrAmount = amountInr / 100; // Convert paise to INR
    const usdAmount = inrAmount / 83; // Convert INR to USD
    return usdAmount.toFixed(2);
  };

  const handleAcademicLevelChange = async (level) => {
    const normalized = level.toLowerCase().replace(/[^a-z]/g, '');
    // Debug logging removed for production
    // console.log('DEBUG: handleAcademicLevelChange called with level:', level, 'normalized:', normalized);
    setAcademicLevel(normalized);
    setError('');
    const userId = user?.uid || user?.id;
    if (user && userId) {
      try {
        // Debug logging removed for production
    // console.log('DEBUG: Updating user level in backend:', { academic_level: level });
        await axios.put(`${API}/users/${userId}`, { academic_level: level });
        if (onLevelChange) onLevelChange(normalized);
        
        // If this was triggered by the level prompt, redirect to question types
        if (showLevelPrompt) {
          // Debug logging removed for production
    // console.log('DEBUG: Level prompt active, will redirect after update');
          // Small delay to ensure the level is updated
          setTimeout(() => {
            // Debug logging removed for production
    // console.log('DEBUG: Reloading page to refresh state');
            window.location.reload(); // Simple way to refresh and go to dashboard
          }, 500);
        }
      } catch (err) {
        // Debug logging removed for production
      // console.error('DEBUG: Error updating level:', err);
        setError('Failed to update level.');
      }
    } else {
      // Debug logging removed for production
      // console.error('DEBUG: Cannot update level - user or user ID not available');
      setError('Please wait for authentication to complete.');
    }
  };

  // Remove loading state to prevent loading on every tab switch
  
  return (
    <div className="min-h-screen bg-main">
      <div className="bg-card shadow-sm border-b border-pink-200">
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
            <h1 className="text-xl font-fredoka text-gray-900 font-bold">Account</h1>
            <div></div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Level Selection Prompt */}
        {showLevelPrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
              <div className="ml-3">
                <h3 className="text-lg font-fredoka font-semibold text-blue-900 mb-2">
                  Choose Your Academic Level
                </h3>
                <p className="text-blue-700 font-fredoka">
                  To get started with marking your questions, please select your academic level below. 
                  This helps us provide you with the most appropriate questions and marking criteria.
                </p>
          </div>
        </div>
          </div>
        )}

        {/* Academic Preferences */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-pink-200 mb-6">
          <h2 className="text-2xl font-fredoka font-bold text-gray-900 mb-6">Academic Preferences</h2>
          {error && <div className="mb-2 text-red-600 font-fredoka">{error}</div>}
          <div className="space-y-6">
            <div>
              <h3 className="font-fredoka font-semibold text-gray-900 mb-3">Current Academic Level</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleAcademicLevelChange('igcse')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${academicLevel === 'igcse' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">🎓</span>
                    <h4 className="font-fredoka font-bold text-gray-900">IGCSE</h4>
                    {academicLevel === 'igcse' && (
                      <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="font-fredoka text-sm text-gray-600">International General Certificate</p>
                  <p className="font-fredoka text-xs text-gray-500 mt-1">Ages 14-16 • Secondary Level</p>
                </button>
                <button
                  onClick={() => handleAcademicLevelChange('alevel')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${academicLevel === 'alevel' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300'}`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">🚀</span>
                    <h4 className="font-fredoka font-bold text-gray-900">A-Level</h4>
                    {academicLevel === 'alevel' && (
                      <svg className="w-5 h-5 text-pink-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="font-fredoka text-sm text-gray-600">Advanced Level English</p>
                  <p className="font-fredoka text-xs text-gray-500 mt-1">Ages 16-18 • Pre-university</p>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Billing History */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-pink-200 mb-6">
          <h2 className="text-2xl font-fredoka font-bold text-gray-900 mb-6">Billing History</h2>
          <div className="space-y-4">
            {/* Current Plan Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-fredoka font-semibold text-gray-900">Current Plan</h3>
                  <p className="font-fredoka text-sm text-gray-600 capitalize">
                    {userStats.currentPlan === 'unlimited' ? '🎉 Unlimited (Launch)' : (userStats.currentPlan || 'Basic')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-fredoka text-sm text-gray-600">Credits Remaining</p>
                  <p className="font-fredoka font-bold text-blue-600">
                    {userStats.currentPlan === 'unlimited' ? 'Unlimited' : userStats.credits}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-3">
              <h3 className="font-fredoka font-semibold text-gray-900">Transaction History</h3>
              {transactionsLoading ? (
                <div className="text-center py-4">
                  <p className="font-fredoka text-gray-600">Loading transactions...</p>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((transaction, index) => {
                    const amountUSD = formatTransactionAmount(transaction.amount_inr);
                    const date = new Date(transaction.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const time = new Date(transaction.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                                         return (
                       <div key={transaction.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                         <div className="flex justify-between items-center">
                           <div>
                             <h4 className="font-fredoka font-semibold text-gray-900">
                               {transaction.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Pending'}
                             </h4>
                             <p className="font-fredoka text-sm text-gray-600">
                               {transaction.amount_inr >= 49900 ? 'Unlimited Plan' : 
                                transaction.amount_inr >= 29900 ? 'Pro Plan' : 
                                transaction.amount_inr >= 9900 ? 'Basic Plan' : 'Credit Purchase'}
                             </p>
                             <p className="font-fredoka text-xs text-gray-500">
                               {date} at {time}
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="font-fredoka font-bold text-green-600">
                               ${amountUSD}
                             </p>
                             <span className={`font-fredoka text-xs px-2 py-1 rounded-full ${
                               transaction.status === 'SUCCESS' 
                                 ? 'bg-green-100 text-green-700' 
                                 : 'bg-yellow-100 text-yellow-700'
                             }`}>
                               {transaction.status}
                             </span>
                           </div>
                         </div>
                       </div>
                     );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="font-fredoka text-gray-600">No transactions found</p>
                  <p className="font-fredoka text-sm text-gray-500 mt-1">Your payment history will appear here</p>
                </div>
              )}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={onPricing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-fredoka font-medium"
              >
                View All Plans
              </button>
            </div>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-pink-200 mb-6">
          <h2 className="text-2xl font-fredoka font-bold text-gray-900 mb-6">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                <h3 className="font-fredoka font-semibold text-gray-900">Dark Mode</h3>
                <p className="font-fredoka text-sm text-gray-600">Toggle dark theme (Still in beta, not reccomended)</p>
                </div>
              <button 
                onClick={toggleDarkMode}
                className={`rounded-full p-1 w-12 h-6 relative transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <div className={`bg-white rounded-full w-4 h-4 shadow transform transition-transform ${
                  darkMode ? 'translate-x-6' : ''
                }`}></div>
              </button>
                </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fredoka font-semibold text-gray-900">Email Notifications</h3>
                <p className="font-fredoka text-sm text-gray-600">Receive updates about your progress</p>
              </div>
              <button className="bg-blue-600 rounded-full p-1 w-12 h-6 relative">
                <div className="bg-white rounded-full w-4 h-4 shadow transform translate-x-6 transition-transform"></div>
              </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UPDATED Dashboard Page - Always Navigate to Analytics/History with Mobile Social Links in Profile Menu
const Dashboard = ({ questionTypes, onStartQuestion, onPricing, onHistory, onAnalytics, onAccountSettings, onSubscription, userStats, user, darkMode, onSignOut }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  
  // Helper function to check if user has unlimited access
  const hasUnlimitedAccess = () => {
    const plan = userStats.currentPlan?.toLowerCase();
    return plan === 'unlimited';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-card border-pink-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <img 
                src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
                alt="EnglishGPT Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                style={{ background: 'transparent' }}
              />
              <span className={`ml-1 sm:ml-2 text-base sm:text-xl font-fredoka ${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>EnglishGPT</span>
            </div>
            
            {/* Center Navigation - Hide on mobile - Improved spacing */}
            <div className="hidden lg:flex items-center">
              {/* User Stats - Show for all users */}
                <div className="flex items-center space-x-6">
                {hasUnlimitedAccess() ? (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-fredoka font-bold text-purple-600">{userStats.questionsMarked}</div>
                      <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Essays Marked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-fredoka font-bold text-blue-600 capitalize">
                        Unlimited
                      </div>
                      <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</div>
                    </div>

                  </>
                ) : (
                  <>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-blue-600">
                      {userStats.currentPlan === 'unlimited' ? '∞' : userStats.credits}
                    </div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-green-600 capitalize">
                        Free
                    </div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-fredoka font-bold text-purple-600">{userStats.questionsMarked}</div>
                    <div className={`text-xs font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Marked</div>
                  </div>
                  </>
              )}
              </div>
              
            </div>
            
            {/* New User Welcome Message - Separate from stats */}
            {!hasUnlimitedAccess() && userStats.questionsMarked === 0 && (
              <div className={`hidden lg:block ${darkMode ? 'bg-blue-900 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200'} px-3 py-1.5 rounded-lg border`}>
                <div className="flex items-center space-x-2">
                  <span className="font-fredoka text-sm">🎉 3 free credits</span>
                  <span className={`font-fredoka text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>• Upgrade for $4.99/mo</span>
                </div>
              </div>
            )}
            
            {/* Mobile User Stats - Show condensed version on mobile */}
            <div className="lg:hidden flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-xs">
                {hasUnlimitedAccess() ? (
                  <>
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">{userStats.questionsMarked}</span>
                    </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">Unlimited</span>
                  </div>

                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">
                        {userStats.currentPlan === 'unlimited' ? '∞' : userStats.credits}
                      </span>
                    </div>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <span className="font-fredoka font-bold">Free</span>
                    </div>
                  </>
              )}
              </div>
              
              {/* Mobile Welcome Message - Compact */}
              {!hasUnlimitedAccess() && userStats.questionsMarked === 0 && (
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <span className="font-fredoka text-xs">🎉 3 free</span>
                </div>
              )}
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Social Media Icons - Hide on mobile */}
              <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
                <a href="https://www.reddit.com/r/everythingenglish/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </a>
                <a href="https://discord.gg/xRqB4BWCcJ" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@everythingenglishdotxyz" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/everythingenglish.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
             {/* Navigation Buttons - FIXED to always navigate */}
             <button
                onClick={onPricing}
                className="font-fredoka bg-pink-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm sm:text-base"
              >
                Pricing
              </button>
              
              {/* FIXED Analytics Button - Always navigate */}
              <button 
                onClick={onAnalytics} // Always navigate, let AnalyticsDashboard handle lock state
                className="hidden sm:flex font-fredoka text-gray-600 hover:text-gray-900 items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
              </button>
              
              {/* FIXED History Button - Always navigate */}
              <button 
                onClick={onHistory} // Always navigate, let HistoryPage handle lock state
                className="hidden sm:flex font-fredoka text-gray-600 hover:text-gray-900 items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 p-1 sm:p-2 rounded-lg transition-colors"
                >
                  <img 
                    src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/32'} 
                    alt="User Profile" 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-fredoka text-sm font-medium text-gray-900">{user?.user_metadata?.full_name || 'User'}</span>
                    <span className="font-fredoka text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Account Dropdown - UPDATED with mobile social links */}
                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {/* Mobile-only Analytics and History - FIXED to always navigate */}
                      <div className="sm:hidden">
                        <button 
                          onClick={() => {
                            onAnalytics(); // Always navigate, let page handle lock state
                            setShowAccountDropdown(false);
                          }} 
                          className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
                        </button>
                        
                        <button 
                          onClick={() => {
                            onHistory(); // Always navigate, let page handle lock state
                            setShowAccountDropdown(false);
                          }} 
                          className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          History {!hasUnlimitedAccess() && <span className="ml-1 text-xs">🔒</span>}
                        </button>
                        
                        {/* Mobile stats display */}
                        {(userStats.currentPlan !== 'basic' || userStats.questionsMarked > 0) && (
                          <div className="px-4 py-2 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                              <span className="font-fredoka text-gray-600">Credits:</span>
                              <span className="font-fredoka font-medium text-blue-600">
                                {userStats.currentPlan === 'unlimited' ? 'Unlimited' : userStats.credits}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-fredoka text-gray-600">Plan:</span>
                              <span className="font-fredoka font-medium text-green-600">
                                {userStats.currentPlan === 'unlimited' ? '🎉 Unlimited' : 
                                 userStats.currentPlan === 'basic' ? 'No Plan' : userStats.currentPlan}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-fredoka text-gray-600">Marked:</span>
                              <span className="font-fredoka font-medium text-purple-600">{userStats.questionsMarked}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* UPDATED: Mobile Social Links instead of Billing History */}
                        <div className="border-t border-gray-100">
                          <a 
                            href="https://discord.gg/xRqB4BWCcJ" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                            </svg>
                            Join the Discord
                          </a>
                          
                          <a 
                            href="https://www.youtube.com/@everythingenglishdotxyz" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            Join the YouTube
                          </a>
                          
                          <a 
                            href="https://www.instagram.com/everythingenglish.xyz" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Join the Instagram
                          </a>
                          
                          <a 
                            href="https://www.reddit.com/r/everythingenglish/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setShowAccountDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                            </svg>
                            Join the Reddit
                          </a>
                        </div>
                        
                        <div className="border-t border-gray-100"></div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onAccountSettings();
                          setShowAccountDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account Settings
                      </button>
                      
                      <button 
                        onClick={() => {
                          onSubscription();
                          setShowAccountDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left font-fredoka text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Subscription
                      </button>
                      
                      <div className="border-t border-gray-100"></div>
                      <button 
                        onClick={async () => {
                          await onSignOut();
                          setShowAccountDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left font-fredoka text-red-700 hover:bg-red-50 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Balanced between old and new */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
              alt="EnglishGPT Logo" 
              className="w-20 h-20 object-contain"
              style={{ background: 'transparent' }}
            />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-fredoka">EnglishGPT</h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-fredoka">
            Get instant, professional feedback on your English essays and assignments
          </p>
          
          {/* Main CTA Button - Prominent but fitting the original style */}
          <button
            onClick={onStartQuestion}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-xl font-fredoka font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Mark a Question
            </span>
          </button>
          
          {/* Quick features - smaller, simpler */}
          <div className="mt-8 flex justify-center gap-6 text-sm font-fredoka">
            <span className="text-gray-600">✨ Instant Results</span>
            <span className="text-gray-600">📚 All Levels</span>
            <span className="text-gray-600">🎯 Professional Feedback</span>
          </div>
        </div>
        
        {/* Question Types - Clean cards with original pink theme */}
        <div className="space-y-12">
          {/* IGCSE Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg mr-4">
                <span className="font-fredoka font-bold">IGCSE</span>
              </div>
              <h2 className="text-2xl font-fredoka font-bold text-gray-900">International General Certificate of Secondary Education</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {/* Summary */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#3b82f6'}}>📄</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Summary</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm">Condensing key information from texts</p>
              </div>
              
              {/* Narrative */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#8b5cf6'}}>📖</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Narrative</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm">Creative storytelling and structure</p>
              </div>
              
              {/* Descriptive */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#22c55e'}}>🖼️</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Descriptive</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm">Vivid imagery and atmospheric writing</p>
              </div>
              
              {/* Writer's Effect */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#f59e42'}}>⚡</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Writer's Effect</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm">Language analysis and impact</p>
              </div>
              
              {/* Directed Writing */}
              <div className="bg-pink-50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 text-xl sm:text-2xl" style={{background:'#6366f1'}}>✍️</div>
                <h3 className="font-fredoka text-base sm:text-lg text-gray-900 mb-2 font-semibold">Directed Writing</h3>
                <p className="font-fredoka text-gray-600 text-xs sm:text-sm">Transform text into specific formats</p>
              </div>
            </div>
          </div>
          
          {/* A-Level Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-red-500 text-white px-4 py-2 rounded-lg mr-4">
                <span className="font-fredoka font-bold">A-Level</span>
              </div>
              <h2 className="text-2xl font-fredoka font-bold text-gray-900">Advanced Level English</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reflective Commentary */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#ef4444'}}>📊</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Reflective Commentary</h3>
                <p className="font-fredoka text-gray-600 text-sm">Critical reflection and personal response</p>
              </div>
              
              {/* Directed Writing */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#22c55e'}}>✏️</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Directed Writing</h3>
                <p className="font-fredoka text-gray-600 text-sm">Task-specific writing with audience awareness</p>
              </div>
              
              {/* Text Analysis */}
              <div className="bg-pink-50 rounded-xl p-6 cursor-pointer hover:bg-pink-100 transition-all duration-300 border border-pink-100 hover:border-pink-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 text-2xl" style={{background:'#ec4899'}}>🔍</div>
                <h3 className="font-fredoka text-lg text-gray-900 mb-2 font-semibold">Text Analysis</h3>
                <p className="font-fredoka text-gray-600 text-sm">Literary analysis and critical interpretation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UPDATED Question Type Page Flow - Now shows only questions from selected level
const QuestionTypePage = ({ questionTypes, onSelectQuestionType, onBack, onEvaluate, selectedLevel, darkMode }) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [showMarkingSchemeChoice, setShowMarkingSchemeChoice] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const essayRef = useRef(null);

  // Restore draft on mount
  useEffect(() => {
    const key = 'draft_student_response';
    const saved = localStorage.getItem(key);
    if (saved && !studentResponse) {
      setStudentResponse(saved);
      setRestoredDraft(true);
      setTimeout(() => setRestoredDraft(false), 3000);
    }
  }, []);

  // Autosave on change (debounced)
  useEffect(() => {
    const key = 'draft_student_response';
    const handle = setTimeout(() => {
      if (studentResponse && studentResponse.trim().length > 0) {
        localStorage.setItem(key, studentResponse);
        setLastSavedAt(Date.now());
      } else {
        localStorage.removeItem(key);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [studentResponse]);

  const applyFormat = (prefix, suffix = prefix) => {
    const textarea = essayRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const selected = value.substring(selectionStart, selectionEnd) || 'text';
    const after = value.substring(selectionEnd);
    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    setStudentResponse(newValue);
    setTimeout(() => {
      const pos = selectionStart + prefix.length + selected.length + suffix.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertParagraphBreak = () => {
    const textarea = essayRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    const newValue = `${before}\n\n${after}`;
    setStudentResponse(newValue);
    setTimeout(() => {
      const pos = selectionStart + 2;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const wordCount = studentResponse.trim().split(/\s+/).filter(w => w.length > 0).length;

  const getWordGoal = () => {
    if (!selectedQuestionType) return 300;
    const map = {
      igcse_summary: 50,
      igcse_narrative: 300,
      igcse_descriptive: 300,
      igcse_writers_effect: 150,
      igcse_directed: 150,
      alevel_directed: 300,
      alevel_text_analysis: 400,
      alevel_comparative: 500,
    };
    return map[selectedQuestionType.id] || 300;
  };

  const WordCountRing = ({ count, goal }) => {
    const pct = Math.max(0, Math.min(100, Math.floor((count / goal) * 100)));
    const ringColor = pct >= 100 ? '#10b981' : pct >= 75 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ec4899';
    const ring = `conic-gradient(${ringColor} ${pct}%, ${darkMode ? '#374151' : '#f3e8ff'} ${pct}% 100%)`;
    
    return (
      <div className={`flex items-center gap-4 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-50 to-pink-50'} px-4 py-3 rounded-xl`}>
        <div className="relative w-14 h-14" aria-label="Word count progress">
          <div className="w-14 h-14 rounded-full shadow-lg" style={{ backgroundImage: ring }} />
          <div className={`absolute inset-1.5 rounded-full flex items-center justify-center text-xs font-bold ${
            darkMode ? 'bg-gray-900 text-white' : 'bg-white text-purple-700 shadow-inner'
          }`}>
            {pct}%
          </div>
        </div>
        <div>
          <div className={`font-fredoka font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {count} / {goal} words
          </div>
          {lastSavedAt && (
            <div className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Auto-saved {Math.max(0, Math.floor((Date.now() - lastSavedAt) / 60000))} min ago
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleQuestionSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setShowNextButton(true);
    if (questionType.id === 'igcse_writers_effect') {
      setShowMarkingSchemeChoice(true);
    } else {
      setShowMarkingSchemeChoice(false);
    }
  };

  const handleProceed = (useMarkingScheme = null) => {
    if (!selectedQuestionType || !studentResponse.trim()) return;

    // Handle Writer's Effect optional marking scheme
    if (selectedQuestionType.id === 'igcse_writers_effect') {
      if (useMarkingScheme) {
        // User chose to use marking scheme - go to assessment page
        onSelectQuestionType({
          ...selectedQuestionType,
          studentResponse: studentResponse,
          requires_marking_scheme: true // Override for this instance
        });
        return;
      } else {
        // User chose to skip marking scheme - evaluate directly
        const evaluationData = {
          question_type: selectedQuestionType.id,
          student_response: studentResponse,
          marking_scheme: null,
        };
        onEvaluate(evaluationData);
        return;
      }
    }

    // Smart flow for other question types
    if (selectedQuestionType.requires_marking_scheme === true) {
      // Pass student response and go to assessment page for marking scheme
      onSelectQuestionType({
        ...selectedQuestionType,
        studentResponse: studentResponse // Pass the essay along
      });
    } else {
      // No marking scheme needed - evaluate directly
      const evaluationData = {
        question_type: selectedQuestionType.id,
        student_response: studentResponse,
        marking_scheme: null,
      };
      onEvaluate(evaluationData);
    }
  };

  // Filter questions based on selected level
  const getQuestionsForLevel = () => {
    if (!questionTypes || questionTypes.length === 0) {
      return { questions: [], levelName: 'Loading...', fullName: 'Loading...', color: 'gray', gradient: 'from-gray-500 to-gray-600' };
    }

    // Debug logging removed for production
    // console.log('DEBUG: All question types:', questionTypes);
    // Debug logging removed for production
    // console.log('DEBUG: Selected level:', selectedLevel);

    const igcseQuestions = questionTypes.filter(q => q.category === 'IGCSE').map(q => ({
      ...q,
      requiresScheme: q.requires_marking_scheme,
      icon: getIconForQuestionType(q.id)
    }));

    const alevelQuestions = questionTypes.filter(q => q.category.includes('A-Level')).map(q => ({
      ...q,
      requiresScheme: q.requires_marking_scheme,
      icon: getIconForQuestionType(q.id)
    }));

    // Debug logging removed for production
    // console.log('DEBUG: IGCSE questions:', igcseQuestions);
    // Debug logging removed for production
    // console.log('DEBUG: A-Level questions:', alevelQuestions);

    if (selectedLevel === 'igcse') {
      return { questions: igcseQuestions, levelName: 'IGCSE', fullName: 'International GCSE', color: 'blue', gradient: 'from-blue-500 to-green-500' };
    } else if (selectedLevel === 'alevel') {
      return { questions: alevelQuestions, levelName: 'A-Level', fullName: 'Advanced Level', color: 'purple', gradient: 'from-purple-500 to-red-500' };
    }
    // Default to showing both if no level selected
    return { 
      questions: [...igcseQuestions, ...alevelQuestions], 
      levelName: 'All Levels', 
      fullName: 'IGCSE & A-Level', 
      color: 'gray', 
      gradient: 'from-gray-500 to-gray-600' 
    };
  };

  // Helper function to get icons for question types
  const getIconForQuestionType = (questionId) => {
    const iconMap = {
      'igcse_summary': '📄',
      'igcse_narrative': '📖',
      'igcse_descriptive': '🖼️',
      'igcse_writers_effect': '⚡',
      'igcse_directed': '✍️',
      'alevel_comparative': '📊',
      'alevel_directed': '✏️',
      'alevel_text_analysis': '🔍'
    };
    return iconMap[questionId] || '📝';
  };

  const levelData = getQuestionsForLevel();

  const generatePrompt = () => {
    const map = {
      igcse_summary: 'Summarize the key arguments of an article about climate change impacts on coastal cities.',
      igcse_narrative: 'Write a narrative about a time when an unexpected event changed your day completely.',
      igcse_descriptive: 'Describe a bustling city market at sunset using vivid sensory details.',
      igcse_writers_effect: 'Analyze how the author uses metaphor and contrast to create tension in a short passage.',
      igcse_directed: 'Write a letter to your local council proposing a new community garden.',
      alevel_directed: 'Write a speech arguing for the benefits of gap years before university.',
      alevel_text_analysis: 'Analyze how the writer presents memory and identity in an unseen prose extract.',
      alevel_comparative: 'Compare how two poets explore the theme of loss.'
    };
    return map[selectedQuestionType?.id] || 'Write about a meaningful experience and what you learned from it.';
  };

  const getExampleForType = (id) => {
    const examples = {
      igcse_summary: 'Example summary: The article outlines three main points... (concise neutral tone).',
      igcse_narrative: 'Example narrative: The wind clawed at the shutters as I stepped outside...',
      igcse_descriptive: 'Example descriptive: The marketplace hummed—a tapestry of scents and colours...',
      igcse_writers_effect: 'Example analysis: The simile “like a coiled spring” compresses tension...',
      igcse_directed: 'Example directed writing: Dear Councillors, I propose establishing a community garden...',
      alevel_directed: 'Example directed: Esteemed audience, today I contend that...',
      alevel_text_analysis: 'Example analysis: The narrator’s fragmented syntax mirrors her fractured memory...',
      alevel_comparative: 'Example comparative: While Poet A elegizes loss with restraint, Poet B embraces raw immediacy...'
    };
    return examples[id] || 'A focused, well-structured response illustrating expectations for this task type.';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'}`}>
      {/* Header with Back Button */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/80 backdrop-blur-lg border-purple-100'} border-b sticky top-0 z-10 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-fredoka font-medium transition-all ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-purple-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'}`}>
                <span className="font-fredoka font-medium">✍️ Write Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Choose Question Type */}
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-purple-100'} rounded-2xl p-6 shadow-xl border backdrop-blur-lg`}>
            <h2 className={`text-lg font-fredoka font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📚 Choose Question Type</h2>
            <div className="mb-4 flex items-center">
              <div className={`bg-gradient-to-r ${levelData.gradient} text-white px-2 py-1 rounded-md mr-2`}>
                <span className="font-fredoka font-bold text-xs">{levelData.levelName}</span>
              </div>
              <h3 className={`font-fredoka font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{levelData.fullName}</h3>
            </div>
            <div className="space-y-2">
              {levelData.questions.length > 0 ? (
                levelData.questions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionSelect(question)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 border ${
                      selectedQuestionType?.id === question.id
                        ? `${darkMode ? 'border-blue-500 bg-gray-800' : 'border-blue-500 bg-blue-50'} shadow-md`
                        : `${darkMode ? 'border-gray-700 bg-black hover:border-blue-400 hover:bg-gray-800' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`
                    }`}
                    aria-pressed={selectedQuestionType?.id === question.id}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{question.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-fredoka font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-sm truncate`}>{question.name}</h4>
                          {selectedQuestionType?.id === question.id && (
                            <svg className={`w-4 h-4 text-blue-500 flex-shrink-0 ml-1`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`font-fredoka ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs mt-1`}>{question.description}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="font-fredoka text-sm">No questions found for {levelData.levelName}</p>
                </div>
              )}
            </div>
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-5 border mt-6`}>
              <h3 className={`font-fredoka font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-xl">💡</span> Getting Started
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
                Tips for your {selectedQuestionType?.name || levelData.levelName} response:
              </p>
              <div className="space-y-2">
                {[
                  { icon: '📝', text: 'Plan briefly: outline intro, key points, conclusion' },
                  { icon: '✨', text: 'Use precise vocabulary and vary sentences' },
                  { icon: '🎯', text: 'Keep consistent tone and answer directly' },
                  { icon: '📊', text: 'Target the word goal shown above' }
                ].map((tip, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                    <span className="text-base mt-0.5">{tip.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button 
                  onClick={() => setShowExample(true)} 
                  className={`flex-1 px-4 py-2.5 rounded-lg font-fredoka font-medium transition-all transform hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                      : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>👁️</span> View Example
                  </span>
                </button>
                <button 
                  onClick={() => setStudentResponse((v) => (v ? v + '\n\n' : '') + generatePrompt())} 
                  className={`flex-1 px-4 py-2.5 rounded-lg font-fredoka font-medium text-white transition-all transform hover:scale-105 shadow-md hover:shadow-lg`}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span> Generate Prompt
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Essay Input */}
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-purple-100'} rounded-2xl shadow-xl border lg:col-span-2 backdrop-blur-lg overflow-hidden`}>
            {/* Essay Header */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'} border-b px-6 py-4`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-fredoka font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span className="inline-block animate-bounce" style={{animationDelay: '0.1s'}}>📝</span> Your Essay
                </h2>
                {selectedQuestionType && (
                  <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-white'} px-4 py-2 rounded-full shadow-sm`}>
                    <span className="text-xl mr-2">{selectedQuestionType.icon}</span>
                    <span className={`font-fredoka text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-purple-700'}`}>{selectedQuestionType.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {restoredDraft && (
                <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-fredoka">Draft restored successfully!</span>
                </div>
              )}

              {/* Beautiful Formatting Toolbar */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} rounded-xl p-3 mb-4 border`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    {/* Bold Button */}
                    <button
                      onClick={() => applyFormat('**')}
                      className={`group relative px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-purple-100 text-gray-700 shadow-sm hover:shadow-md'
                      }`}
                      title="Bold (Ctrl+B)"
                    >
                      <span className="font-bold">B</span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Bold
                      </span>
                    </button>

                    {/* Italic Button */}
                    <button
                      onClick={() => applyFormat('*')}
                      className={`group relative px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-pink-100 text-gray-700 shadow-sm hover:shadow-md'
                      }`}
                      title="Italic (Ctrl+I)"
                    >
                      <span className="italic">I</span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Italic
                      </span>
                    </button>

                    {/* Underline Button */}
                    <button
                      onClick={() => applyFormat('<u>', '</u>')}
                      className={`group relative px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-blue-100 text-gray-700 shadow-sm hover:shadow-md'
                      }`}
                      title="Underline"
                    >
                      <span className="underline">U</span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Underline
                      </span>
                    </button>

                    <div className={`w-px h-6 ${darkMode ? 'bg-gray-600' : 'bg-purple-200'}`} />

                    {/* Paragraph Break */}
                    <button
                      onClick={insertParagraphBreak}
                      className={`group relative px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-green-100 text-gray-700 shadow-sm hover:shadow-md'
                      }`}
                      title="New Paragraph"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Paragraph
                      </span>
                    </button>

                    {/* Quote Button */}
                    <button
                      onClick={() => applyFormat('"', '"')}
                      className={`group relative px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                          : 'bg-white hover:bg-orange-100 text-gray-700 shadow-sm hover:shadow-md'
                      }`}
                      title="Add Quotes"
                    >
                      <span className="text-lg">"</span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Quote
                      </span>
                    </button>
                  </div>

                  {/* Right side tools */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const textarea = essayRef.current;
                        if (textarea) {
                          textarea.select();
                          document.execCommand('copy');
                        }
                      }}
                      className={`group relative px-3 py-2 rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                      }`}
                      title="Copy All"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setStudentResponse('')}
                      className={`group relative px-3 py-2 rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-red-900 hover:bg-red-800 text-red-300' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                      title="Clear All"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Beautiful Textarea */}
              <div className={`relative rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 via-white to-pink-50'}`}>
                <textarea
                  value={studentResponse}
                  onChange={(e) => setStudentResponse(e.target.value)}
                  placeholder={`Type or paste your ${levelData.levelName} essay answer here...\n\n✨ Select a question type from the left panel and write your response to get instant AI feedback!`}
                  className={`w-full h-96 p-6 rounded-xl focus:outline-none resize-none font-fredoka leading-relaxed transition-all ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-100 placeholder-gray-500 border-2 border-gray-700 focus:border-purple-500' 
                      : 'bg-white/70 text-gray-700 placeholder-gray-400 border-2 border-purple-200 focus:border-purple-400 focus:shadow-lg'
                  }`}
                  aria-label="Essay input"
                  ref={essayRef}
                  style={{
                    backgroundImage: darkMode ? 'none' : 'linear-gradient(0deg, transparent 24%, rgba(147, 51, 234, 0.04) 25%, rgba(147, 51, 234, 0.04) 26%, transparent 27%, transparent 74%, rgba(147, 51, 234, 0.04) 75%, rgba(147, 51, 234, 0.04) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(147, 51, 234, 0.04) 25%, rgba(147, 51, 234, 0.04) 26%, transparent 27%, transparent 74%, rgba(147, 51, 234, 0.04) 75%, rgba(147, 51, 234, 0.04) 76%, transparent 77%, transparent)',
                    backgroundSize: '30px 30px'
                  }}
                />
                {/* Character count indicator */}
                <div className={`absolute bottom-2 right-2 text-xs ${darkMode ? 'text-gray-500' : 'text-purple-400'}`}>
                  {studentResponse.length} characters
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
              <WordCountRing count={wordCount} goal={getWordGoal()} />

                {showMarkingSchemeChoice && selectedQuestionType && studentResponse.trim() && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleProceed(false)}
                      className="relative group px-6 py-3 rounded-xl font-fredoka font-bold text-white overflow-hidden transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        Skip Scheme
                      </span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                    <button
                      onClick={() => handleProceed(true)}
                      className="relative group px-6 py-3 rounded-xl font-fredoka font-bold text-white overflow-hidden transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                      style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-xl">📋</span>
                        Add Scheme
                      </span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                  </div>
                )}

                {showNextButton && selectedQuestionType && studentResponse.trim() && !showMarkingSchemeChoice && (
                  <button
                    onClick={handleProceed}
                    className="relative group px-8 py-4 rounded-xl font-fredoka font-bold text-white overflow-hidden transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2 text-lg">
                      {selectedQuestionType.requiresScheme === true ? (
                        <>
                          <span>Add Marking Scheme</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🚀</span>
                          <span>Get AI Feedback Now</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    {/* Animated gradient shine effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                        transform: 'translateX(-100%)',
                        animation: 'group-hover:shine 1s ease-out'
                      }}
                    />
                  </button>
                )}
            </div>

            </div>

            {/* Example modal */}
            {showExample && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`${darkMode ? 'bg-black border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-2xl max-w-2xl w-full p-6 border`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Example {selectedQuestionType?.name || 'Essay'}</h3>
                    <button onClick={() => setShowExample(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-4 text-sm leading-6`}>
                    {getExampleForType(selectedQuestionType?.id)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Assessment Page - Marking Scheme Input
const AssessmentPage = ({ selectedQuestionType, onBack, onEvaluate, darkMode }) => {
  const [markingScheme, setMarkingScheme] = useState('');
  const [uploadOption, setUploadOption] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [restoredScheme, setRestoredScheme] = useState(false);

  // Restore marking scheme draft
  useEffect(() => {
    const key = 'draft_marking_scheme';
    const saved = localStorage.getItem(key);
    if (saved && !markingScheme) {
      setMarkingScheme(saved);
      setRestoredScheme(true);
      setTimeout(() => setRestoredScheme(false), 3000);
    }
  }, []);

  // Autosave marking scheme
  useEffect(() => {
    const key = 'draft_marking_scheme';
    const handle = setTimeout(() => {
      if (markingScheme && markingScheme.trim().length > 0) {
        localStorage.setItem(key, markingScheme);
      } else {
        localStorage.removeItem(key);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [markingScheme]);

  const loadingMessages = [
    "🤖 AI is analyzing your essay...",
    "📝 Checking grammar and structure...",
    "🎯 Evaluating content quality...",
    "✨ Analyzing writing style and flow...",
    "🔍 Examining vocabulary usage...",
    "📊 Assessing argument structure...",
    "⚡ Generating personalized feedback...",
    "🎭 Reviewing literary techniques...",
    "💡 Identifying key strengths...",
    "🎨 Evaluating descriptive language...",
    "🧠 Processing complex ideas...",
    "📖 Checking coherence and clarity...",
    "🏆 Measuring against marking criteria...",
    "🌟 Crafting improvement suggestions...",
    "🎪 Analyzing tone and mood...",
    "🔬 Examining evidence and examples...",
    "🎵 Checking rhythm and pacing...",
    "🌈 Evaluating creativity and originality...",
    "⭐ Finalizing detailed assessment...",
    "🎉 Almost done! Preparing your results..."
  ];

  const handleUploadOptionChange = (option) => {
    if (option === 'file' && uploadOption === 'text') {
      setShowUploadWarning(true);
    } else {
      setUploadOption(option);
    }
  };
  
  const confirmFileUpload = () => {
    setUploadOption('file');
    setShowUploadWarning(false);
  };
  
  const cancelFileUpload = () => {
    setShowUploadWarning(false);
  };
  
  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/process-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMarkingScheme(response.data.extracted_text);
      setError('');
    } catch (error) {
      setError('Failed to process file. Please try pasting the text instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedQuestionType.requiresScheme === true && !markingScheme.trim()) {
      setError('This question type requires a marking scheme');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setCurrentMessageIndex(0);
    
    // Animate through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(messageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    
    try {
      const evaluationData = {
        question_type: selectedQuestionType.id,
        student_response: selectedQuestionType.studentResponse, // From previous page
        marking_scheme: markingScheme || null,
      };
      
      await onEvaluate(evaluationData);
      clearInterval(messageInterval);
    } catch (error) {
      clearInterval(messageInterval);
      setError('Failed to evaluate submission. Please try again.');
      setIsLoading(false);
    }
  };

  // Loading Page Component
  const LoadingPage = ({ selectedQuestionType, loadingMessages, currentMessageIndex }) => {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-main'} flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="mb-8">
            <img 
              src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
              alt="EnglishGPT Logo" 
              className="w-20 h-20 mx-auto object-contain animate-pulse"
              style={{ background: 'transparent' }}
            />
          </div>
          <div className="loading-animation">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            
            <div className="loading-text">
              {loadingMessages && loadingMessages[currentMessageIndex] ? loadingMessages[currentMessageIndex] : "🤖 AI is analyzing your essay..."}
            </div>
            
            <div className="loading-subtext">
              Our AI is carefully analyzing your {selectedQuestionType?.name} submission. This may take up to 60 seconds.
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingPage selectedQuestionType={selectedQuestionType} loadingMessages={loadingMessages} currentMessageIndex={currentMessageIndex} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center mx-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Essay
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>📋 Add Marking Scheme</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your essay is ready! Now add the marking scheme for accurate evaluation.</p>
        </div>
        
        {restoredScheme && (
          <div className="mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            Restored unsaved marking scheme.
          </div>
        )}
        
        {/* Essay Preview */}
        <div className={`${darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} rounded-xl p-4 mb-6 border`}>
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Essay Ready ({selectedQuestionType.name})</h3>
          </div>
          <p className={`${darkMode ? 'text-green-200' : 'text-green-700'} text-sm`}>
            {selectedQuestionType.studentResponse.substring(0, 150)}...
          </p>
        </div>

        {/* Marking Scheme Section */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 mb-6 shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Marking Scheme</h2>
            <span className="text-sm px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
              Required
            </span>
          </div>
          
          <div className="flex mb-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-1 flex`}>
              <button
                onClick={() => handleUploadOptionChange('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadOption === 'text'
                    ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                    : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => handleUploadOptionChange('file')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadOption === 'file'
                    ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                    : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                Upload File
              </button>
            </div>
          </div>
          
          {uploadOption === 'text' ? (
            <textarea
              value={markingScheme}
              onChange={(e) => setMarkingScheme(e.target.value)}
              placeholder="Paste your marking scheme here..."
              className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-gray-600 mt-2">Supports PDF, JPG, PNG files</p>
            </div>
          )}
          
          {markingScheme && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-medium">✓ Marking scheme loaded successfully</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !markingScheme.trim()}
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Get AI Feedback
            </button>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}
      </div>
      
      {/* Upload Warning Modal */}
      {showUploadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DO NOT UPLOAD MARK SCHEMES</h3>
              <p className="text-gray-600 mb-6">
                Uploading a mark scheme does not yet work, please paste the text instead.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelFileUpload}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFileUpload}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Full Chat removed

// Results Page
const ResultsPage = ({ evaluation, onNewEvaluation, userPlan, darkMode }) => {
  const [activeTab, setActiveTab] = useState('Summary');
  // Full Chat removed
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'overall' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackAccurate, setFeedbackAccurate] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const routerLocation = useLocation();
  const modalRef = useRef(null);
  const firstModalButtonRef = useRef(null);

  // Handle hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getTabFromHash();
      setActiveTab(newTab);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Update URL hash when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab.toLowerCase();
  };
  
  useEffect(() => {
    const handler = (e) => {
      if (feedbackModal.open) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setFeedbackModal({ open: false, category: 'overall' });
          setFeedbackAccurate(null);
          setFeedbackComments('');
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!feedbackSubmitting && feedbackAccurate !== null) {
            submitFeedback();
          }
        }
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        return;
      }
      if (e.key === '1') handleTabChange('Summary');
      if (e.key === '2') handleTabChange('Strengths');
      if (e.key === '3') handleTabChange('Improvements');
      if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => prev === 'Strengths' ? 'Summary' : prev === 'Improvements' ? 'Strengths' : 'Improvements');
      }
      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => prev === 'Summary' ? 'Strengths' : prev === 'Strengths' ? 'Improvements' : 'Summary');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feedbackModal.open, feedbackSubmitting, feedbackAccurate]);

  useEffect(() => {
    // Focus trap when modal opens
    if (feedbackModal.open) {
      setTimeout(() => {
        firstModalButtonRef.current?.focus();
      }, 0);
    }
  }, [feedbackModal.open]);
  
  // Parse grade to get score
  const parseGrade = (gradeString) => {
    // Extract numbers from grade string
    const matches = gradeString.match(/(\d+)\/(\d+)/g);
    if (matches) {
      let totalScore = 0;
      let maxScore = 0;
      matches.forEach(match => {
        const [score, max] = match.split('/').map(Number);
        totalScore += score;
        maxScore += max;
      });
      return { score: totalScore, maxScore, percentage: (totalScore / maxScore * 100).toFixed(1) };
    }
    return { score: 0, maxScore: 40, percentage: 0 };
  };
  
  const gradeInfo = parseGrade(evaluation.grade);
  
  // Determine letter grade
  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A*';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'U';
  };
  
  const letterGrade = getLetterGrade(Number(gradeInfo.percentage));
  
  // Extract submarks dynamically per question type and present as "xx/xx"
  const getSubmarks = (evaluation) => {
    if (!evaluation) return [];

    const metricsByType = {
      igcse_writers_effect: ['READING'],
      igcse_descriptive: ['READING', 'WRITING'],
      igcse_narrative: ['READING', 'WRITING'],
      igcse_summary: ['READING', 'WRITING'],
      alevel_directed: ['AO1', 'AO2'],
      alevel_directed_writing: ['AO1', 'AO2'],
      alevel_comparative: ['AO1', 'AO3'],
      alevel_text_analysis: ['AO1', 'AO3'],
    };

    const defaultMax = {
      igcse_writers_effect: { READING: 15 },
      igcse_descriptive: { READING: 16, WRITING: 24 },
      igcse_narrative: { READING: 16, WRITING: 24 },
      igcse_summary: { READING: 10, WRITING: 5 },
      alevel_directed: { AO1: 5, AO2: 5 },
      alevel_directed_writing: { AO1: 5, AO2: 5 },
      alevel_comparative: { AO1: 5, AO3: 10 },
      alevel_text_analysis: { AO1: 5, AO3: 20 },
    };

    const formatValue = (raw, fallbackMax) => {
      if (!raw || typeof raw !== 'string') return '';
      const text = raw.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
      const slash = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (slash) return `${slash[1]}/${slash[2]}`;
      const outOf = text.match(/(\d+)\s*(?:out of|of)\s*(\d+)/i);
      if (outOf) return `${outOf[1]}/${outOf[2]}`;
      const firstNum = text.match(/\d+/);
      if (firstNum && fallbackMax) return `${firstNum[0]}/${fallbackMax}`;
      return firstNum ? firstNum[0] : '';
    };

    const type = evaluation.question_type;
    const metrics = metricsByType[type] || [];
    const results = [];

    metrics.forEach((metric) => {
      let raw = '';
      if (metric === 'READING') raw = evaluation.reading_marks || '';
      if (metric === 'WRITING') raw = evaluation.writing_marks || '';
      if (metric === 'AO1') raw = evaluation.ao1_marks || '';
      if (metric === 'AO2') raw = evaluation.ao2_marks || '';
      if (metric === 'AO3') raw = evaluation.ao3_marks || evaluation.ao2_marks || evaluation.ao1_marks || '';
      const value = formatValue(raw, defaultMax[type]?.[metric]);
      if (value) results.push({ label: metric === 'READING' || metric === 'WRITING' ? metric.charAt(0) + metric.slice(1).toLowerCase() : metric, value });
    });

    return results;
  };
  
  // Parse feedback text into bullet points
  const parseFeedbackToBullets = (feedback) => {
    if (!feedback) return [];
    
    // Split by common delimiters
    const sentences = feedback
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Only meaningful sentences
      .slice(0, 10); // Limit to 10 points
    
    return sentences;
  };

  const submitFeedback = async () => {
    if (!evaluation) return;
    if (feedbackAccurate === null) return;
    setFeedbackSubmitting(true);
    try {
      await axios.post(`${API}/feedback`, {
        evaluation_id: evaluation.id || evaluation?.evaluation_id || evaluation?.timestamp || 'unknown',
        user_id: evaluation.user_id,
        category: feedbackModal.category,
        accurate: !!feedbackAccurate,
        comments: feedbackComments || null,
      });
      setFeedbackModal({ open: false, category: 'overall' });
      setFeedbackAccurate(null);
      setFeedbackComments('');
    } catch (e) {
      console.error('Feedback submit failed', e);
    } finally {
      setFeedbackSubmitting(false);
    }
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Overall Score Card */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-8 mb-6 shadow-sm border`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Overall Score</h2>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Grade {letterGrade}</div>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-6xl font-extrabold text-blue-600 mb-2">{gradeInfo.score}/{gradeInfo.maxScore}</div>
            <div className="text-blue-600 text-lg font-semibold">Total Score</div>
            </div>
          <div className={`w-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-2 mb-1`}>
            <div 
              className="h-3 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(gradeInfo.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {getSubmarks(evaluation).map((submark, idx) => (
              <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-200" key={submark.label + idx}>
                <div className="text-2xl font-extrabold text-green-700 tracking-tight">{submark.value}</div>
                <div className="text-green-700 text-sm mt-0.5">{submark.label}</div>
              </div>
            ))}
          </div>
                </div>

        {/* Overall feedback prompt (separate box) */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 mb-6 border flex items-center justify-between`}>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
            Was this marking accurate?
          </div>
          <button
            onClick={() => setFeedbackModal({ open: true, category: 'overall' })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Give feedback
          </button>
        </div>
        

        
        {/* Detailed Feedback Card */}
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 mb-6 shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Feedback</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const feedbackText = activeTab === 'Summary' 
                    ? parseFeedbackToBullets(evaluation.feedback).join('\n• ')
                    : activeTab === 'Strengths'
                    ? (Array.isArray(evaluation.strengths) ? evaluation.strengths : [evaluation.strengths]).filter(s => s).join('\n• ')
                    : (Array.isArray(evaluation.improvements) ? evaluation.improvements : [evaluation.improvements]).filter(s => s).join('\n• ');
                  navigator.clipboard.writeText(`${activeTab}:\n• ${feedbackText}`);
                  alert(`${activeTab} copied to clipboard!`);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                title="Copy to clipboard"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className={`px-3 py-1.5 text-sm rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                title="Share link"
              >
                Share
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className={`px-3 py-1.5 text-sm rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                title="Print or export as PDF"
              >
                Export
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {['Summary', 'Strengths', 'Improvements'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'Summary' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4">Detailed Feedback</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="list-disc pl-5 text-gray-700 leading-relaxed space-y-2">
                    {parseFeedbackToBullets(evaluation.feedback).map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'Strengths' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 mb-4">What You Did Well</h4>
                <div className="space-y-3">
                  {(() => {
                    // Completely new strengths processing
                    let strengthsArray = [];
                    
                    if (evaluation.strengths && Array.isArray(evaluation.strengths)) {
                      strengthsArray = evaluation.strengths.filter(s => s && s.trim() && s.trim().length > 0);
                    } else if (evaluation.strengths && typeof evaluation.strengths === 'string') {
                      const strengthsText = evaluation.strengths.trim();
                      
                      // Try multiple parsing methods
                      if (strengthsText.includes('|')) {
                        // Split by pipe
                        strengthsArray = strengthsText.split('|').map(s => s.trim()).filter(s => s && s.length > 0);
                      } else if (strengthsText.includes('\n')) {
                        // Split by newlines
                        strengthsArray = strengthsText.split('\n').map(s => s.trim()).filter(s => s && s.length > 0);
                      } else {
                        // Use as single strength only if not empty
                        if (strengthsText && strengthsText.length > 0) {
                          strengthsArray = [strengthsText];
                        }
                      }
                    }
                    
                    // Additional filter to remove any remaining empty strings
                    strengthsArray = strengthsArray.filter(s => s && s.trim() && s.trim().length > 0);
                    
                    return strengthsArray.length > 0 ? (
                      strengthsArray.map((strength, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-green-800 font-medium leading-relaxed">
                                {strength}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-700 text-center">
                          No specific strengths identified in this evaluation.
                          {evaluation.strengths && (
                            <span className="block text-xs text-gray-500 mt-2">

                            </span>
                          )}
                        </p>
                  </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {activeTab === 'Improvements' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-yellow-800 mb-4">Areas for Improvement</h4>
                <div className="space-y-3">
                {evaluation.improvement_suggestions && evaluation.improvement_suggestions.length > 0 ? (
                    evaluation.improvement_suggestions.flatMap((suggestion, idx) => {
                      // Split by numbered points (e.g., 1. 2. 3.)
                      const split = suggestion.split(/\s*(?=\d+\.)/g).map(s => s.trim()).filter(Boolean);
                      return split.map((point, i) => (
                        <div key={idx + '-' + i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {i + 1}
                    </div>
                            <div className="flex-1">
                              <p className="text-yellow-800 font-medium leading-relaxed">
                                {point.replace(/^(\d+\.)\s*/, '')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-700 text-center">No specific improvements suggested. Great work!</p>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onNewEvaluation}
            className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Start New Question
          </button>
        </div>
      </div>

      {/* Strengths feedback prompt (separate box) */}
      {activeTab === 'Strengths' && (
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 mb-6 border flex items-center justify-between`}>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
            Was this strengths summary accurate?
          </div>
          <button
            onClick={() => setFeedbackModal({ open: true, category: 'strengths' })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Give feedback
          </button>
        </div>
      )}

      {/* Improvements feedback prompt (separate box) */}
      {activeTab === 'Improvements' && (
        <div className={`${darkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 mb-6 border flex items-center justify-between`}>
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
            Was this improvements summary accurate?
          </div>
          <button
            onClick={() => setFeedbackModal({ open: true, category: 'improvements' })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Give feedback
          </button>
        </div>
      )}

      {/* Full Chat removed */}

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Feedback on marking accuracy">
          <div ref={modalRef} className={`${darkMode ? 'bg-black text-white border-gray-700' : 'bg-white text-gray-900'} border rounded-2xl p-6 max-w-md mx-4 shadow-xl w-full`}>
            <h3 className="text-lg font-semibold mb-2">
              {feedbackModal.category === 'overall' && 'Was this marking accurate?'}
              {feedbackModal.category === 'strengths' && 'Was this strengths summary accurate?'}
              {feedbackModal.category === 'improvements' && 'Was this improvements summary accurate?'}
            </h3>
            <div className="flex gap-3 mt-3">
              <button ref={firstModalButtonRef} onClick={() => setFeedbackAccurate(true)} className={`px-4 py-2 rounded-lg border ${feedbackAccurate === true ? 'bg-green-600 text-white' : 'bg-transparent'}`} aria-pressed={feedbackAccurate === true}>Yes</button>
              <button onClick={() => setFeedbackAccurate(false)} className={`px-4 py-2 rounded-lg border ${feedbackAccurate === false ? 'bg-red-600 text-white' : 'bg-transparent'}`} aria-pressed={feedbackAccurate === false}>No</button>
            </div>
            <textarea
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              placeholder="Optional comments"
              className={`${darkMode ? 'bg-black border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} mt-4 w-full border rounded-lg p-3`}
              rows={3}
              aria-label="Additional comments"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setFeedbackModal({ open: false, category: 'overall' }); setFeedbackAccurate(null); setFeedbackComments(''); }} className="px-4 py-2 rounded-lg border" aria-label="Cancel feedback">Cancel</button>
              <button onClick={submitFeedback} disabled={feedbackSubmitting || feedbackAccurate === null} className={`px-4 py-2 rounded-lg ${feedbackSubmitting || feedbackAccurate === null ? 'bg-gray-300' : 'bg-blue-600 text-white'}`} aria-disabled={feedbackSubmitting || feedbackAccurate === null}>
                {feedbackSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sign In Modal Component
const SignInModal = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const handleSignIn = async (provider) => {
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/dashboard` 
        : 'http://localhost:3000/dashboard';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          flowType: 'pkce'
        }
      });
      
      if (error) throw error;
      onClose();
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      alert(`${provider} sign-in failed. Please try again.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900'} rounded-2xl p-8 max-w-md mx-4 shadow-xl w-full`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Sign in to Continue
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            Create an account or sign in to start marking your essays
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => handleSignIn('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Continue with Google
            </span>
          </button>
          
          <button
            onClick={() => handleSignIn('discord')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="font-medium">Continue with Discord</span>
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Why sign in?</h4>
          <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Save your essays and track progress over time</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Get personalized analytics and recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Access your work from any device</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={onClose}
          className={`mt-6 w-full px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Custom Error Modal Component
const ErrorModal = ({ isOpen, onClose, message, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-black text-white border border-gray-700' : 'bg-white text-gray-900'} rounded-2xl p-6 max-w-md mx-4 shadow-xl`}>
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Essay Error</h3>
        </div>
        
        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-6 leading-relaxed`}>
          {message}
        </p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// Launch Event Modal Component
const LaunchEventModal = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900'} rounded-2xl p-8 max-w-lg mx-4 shadow-2xl`}>
        <div className="text-center">
          {/* Celebration Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-3xl font-fredoka font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎉 Welcome to Our Launch Event!
          </h2>

          {/* Message */}
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-6 space-y-3`}>
            <p className="text-lg">
              Great news! As part of our exclusive launch event, you've been granted:
            </p>
            
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-blue-50'} rounded-xl p-4 my-4`}>
              <p className="text-2xl font-fredoka font-bold text-green-600 mb-2">
                Unlimited Plan Access
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Completely FREE during our launch period!
              </p>
            </div>

            <div className="text-left space-y-2">
              <p className="font-semibold mb-2">Your benefits include:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited essay marking</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-fredoka font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Start Using Your Benefits!
          </button>

          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No credit card required • No hidden charges
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const navigate = useNavigate();
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null); // Track selected level
  const [showLevelPrompt, setShowLevelPrompt] = useState(false); // Show level prompt in account settings
  const [evaluation, setEvaluation] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showLaunchEventModal, setShowLaunchEventModal] = useState(false);
  const [hasShownLaunchModal, setHasShownLaunchModal] = useState(false);
  const [userStats, setUserStats] = useState({
    questionsMarked: 0,
    credits: 3,
    currentPlan: 'free'
  });
  
  // --- Landing Page (public) ---
  const LandingPage = ({ onDiscord, onGoogle }) => {
    // Product screenshots (defined explicitly as requested)
    const LOGO_URL = 'https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143';
    const [showAuthModal, setShowAuthModal] = useState(false);
    const IMG_STRENGTHS = 'https://ik.imagekit.io/lqf8a8nmt/Screenshot%202025-08-17%20at%2012-17-17%20EnglishGPT%20-%20AI%20English%20Marking.png?updatedAt=1755509276805';
    const IMG_PRICING = 'https://ik.imagekit.io/lqf8a8nmt/Screenshot%202025-08-17%20at%2012-11-06%20EnglishGPT%20-%20AI%20English%20Marking.png?updatedAt=1755509276757';
    const IMG_WRITE = 'https://ik.imagekit.io/lqf8a8nmt/Screenshot%202025-08-17%20at%2012-10-47%20EnglishGPT%20-%20AI%20English%20Marking.png?updatedAt=1755509276693';
    const IMG_MARKING = 'https://ik.imagekit.io/lqf8a8nmt/Screenshot%202025-08-17%20at%2012-17-35%20EnglishGPT%20-%20AI%20English%20Marking.png?updatedAt=1755509276578';
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background gradient + floating transparent purple boxes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F7F2FF] to-white" />
          <div className="pointer-events-none select-none">
            <div className="absolute -top-16 -left-10 h-72 w-72 rounded-3xl bg-purple-500/20 backdrop-blur-md border border-purple-300/30 shadow-2xl shadow-purple-500/10 rotate-6" />
            <div className="absolute top-40 left-1/3 h-40 w-40 rounded-2xl bg-purple-400/20 backdrop-blur-md border border-purple-300/30 shadow-xl shadow-purple-400/10 -rotate-6" />
            <div className="absolute -right-12 top-20 h-80 w-80 rounded-3xl bg-purple-600/20 backdrop-blur-md border border-purple-300/30 shadow-2xl shadow-purple-600/10 rotate-12" />
            <div className="absolute bottom-10 right-1/4 h-56 w-56 rounded-3xl bg-purple-500/15 backdrop-blur-md border border-purple-300/30 shadow-2xl shadow-purple-500/10 -rotate-3" />
          </div>
        </div>

        {/* Header */}
        <header className="relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="EnglishGPT logo" className="w-9 h-9 object-contain" style={{ background: 'transparent' }} />
              <span className="font-fredoka font-bold text-xl text-gray-900">EnglishGPT</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-gray-700">
              <a href="#features" className="hover:text-gray-900">Features</a>
              <a href="#how" className="hover:text-gray-900">How it works</a>
              <a href="#testimonials" className="hover:text-gray-900">Testimonials</a>
              <a href="#faq" className="hover:text-gray-900">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 rounded-xl text-white bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40">Get Started</button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-300/40 text-purple-700 text-xs mb-4 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                  IGCSE & A-Level aligned
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
                  AI English Marking
                </h1>
                <p className="text-lg text-gray-700/90 mb-6">
                  Master English with transparent, AI‑powered marking
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-xl text-white bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40">Get Started</button>
                  <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-xl border border-purple-300/60 text-purple-700 hover:bg-purple-50/70 backdrop-blur-md">Start Marking</button>
                </div>
                <p className="text-xs text-gray-500 mt-3">No credit card required. Cheap & Simple .</p>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  {[{label:'Avg. improvement', value:'+27%'},{label:'Marking speed', value:'< 30s'},{label:'Simple Pricing', value:'Just $4.99/m'}]
                  .map((s,i)=> (
                    <div key={i} className="rounded-2xl p-4 bg-purple-400/10 border border-purple-300/40 backdrop-blur-md">
                      <div className="text-sm text-gray-600">{s.label}</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="relative h-[420px] md:h-[460px]">
                  {/* Strengths (primary) */}
                  <div className="absolute left-0 top-0 right-6 rounded-3xl p-2 sm:p-4 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10">
                    <img src={IMG_STRENGTHS} alt="Detailed strengths preview" loading="lazy" className="w-full h-auto rounded-2xl border border-purple-200/60" onError={(e)=>{e.currentTarget.style.display='none';}} />
                  </div>
                  {/* Marking overlay */}
                  <div className="absolute -right-2 md:-right-6 top-24 w-1/2 rounded-2xl p-2 bg-purple-500/10 border border-purple-300/40 backdrop-blur-md shadow-lg shadow-purple-600/10 rotate-3">
                    <img src={IMG_MARKING} alt="Marking interface preview" loading="lazy" className="w-full h-auto rounded-xl border border-purple-200/60" onError={(e)=>{e.currentTarget.style.display='none';}} />
                  </div>
                  {/* Write overlay */}
                  <div className="absolute left-3 bottom-2 w-2/3 rounded-2xl p-2 bg-purple-500/10 border border-purple-300/40 backdrop-blur-md shadow-lg shadow-purple-600/10 -rotate-3">
                    <img src={IMG_WRITE} alt="Write page preview" loading="lazy" className="w-full h-auto rounded-xl border border-purple-200/60" onError={(e)=>{e.currentTarget.style.display='none';}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Feature rows (alternating) */}
        <section id="features" className="relative py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-fredoka font-bold text-gray-900 mb-3">Write with clarity and confidence</h3>
                <p className="text-gray-700 mb-4">Draft directly in a distraction‑free editor. Auto‑save, undo/redo, and structured prompts help you start fast and stay focused.</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {['Clean, student‑friendly editor','Keyboard shortcuts for speed','Instant evaluate when ready'].map((b,i)=>(
                    <li key={i} className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl p-3 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10">
                <img src={IMG_WRITE} alt="Write" loading="lazy" className="w-full h-auto rounded-2xl border border-purple-200/60" />
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 rounded-3xl p-3 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10">
                <img src={IMG_STRENGTHS} alt="Strengths" loading="lazy" className="w-full h-auto rounded-2xl border border-purple-200/60" />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-fredoka font-bold text-gray-900 mb-3">Crystal‑clear, criteria‑aligned feedback</h3>
                <p className="text-gray-700 mb-4">Understand exactly what worked with strengths pulled straight from exam standards, and know what to do next.</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {['Transparent marks across components','Short, actionable strengths','Improvement suggestions that compound'].map((b,i)=>(
                    <li key={i} className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Row 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-fredoka font-bold text-gray-900 mb-3">A marking view that builds confidence</h3>
                <p className="text-gray-700 mb-4">See where your marks come from and how to reach the next band. Progress tracking keeps you motivated.</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {['Band descriptors made visual','Trend lines for your progress','Sharable results when you’re proud'].map((b,i)=>(
                    <li key={i} className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl p-3 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10">
                <img src={IMG_MARKING} alt="Marking" loading="lazy" className="w-full h-auto rounded-2xl border border-purple-200/60" />
              </div>
            </div>
            {/* Row 4 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 rounded-3xl p-3 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-xl shadow-purple-600/10">
                <img src={IMG_PRICING} alt="Pricing" loading="lazy" className="w-full h-auto rounded-2xl border border-purple-200/60" />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-fredoka font-bold text-gray-900 mb-3">Simple pricing, built for students</h3>
                <p className="text-gray-700 mb-4">Unlimited marking with monthly or yearly options. Cancel anytime — no hidden fees.</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {['Unlimited submissions','Priority support on yearly','Secure payments'].map((b,i)=>(
                    <li key={i} className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials upgraded */}
        <section id="testimonials" className="relative py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {q:'I went from a C to an A in 6 weeks. The feedback was clear and motivating.', name:'Student, IGCSE'},
                {q:'The marks map perfectly to our rubrics. Saves me hours of grading.', name:'Teacher, A‑Level'},
                {q:'Finally understood what “analysis” really meant. The step‑by‑step tips are gold.', name:'Student, A‑Level'},
              ].map((t,i)=> (
                <div key={i} className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-md shadow-purple-600/10">
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    {Array.from({length:5}).map((_,s)=> <span key={s}>★</span>)}
                  </div>
                  <p className="text-gray-800">“{t.q}”</p>
                  <div className="text-xs text-gray-500 mt-3">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ with accordion */}
        <section id="faq" className="relative py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {q:'Is this aligned to exam criteria?', a:'Yes. We align to IGCSE and A‑Level descriptors and show transparent marks.'},
                {q:'Is my data private?', a:'Yes. We keep your submissions secure and never sell your data.'},
                {q:'How fast is the feedback?', a:'You usually get marks and guidance in under 10 seconds.'},
                {q:'Can teachers use this?', a:'Yes. Many teachers use it to save time and guide students faster.'},
              ].map((f,i)=> (
                <details key={i} className="rounded-2xl p-5 bg-white/70 backdrop-blur-xl border border-purple-200/60 shadow-md shadow-purple-600/10">
                  <summary className="cursor-pointer list-none font-semibold text-gray-900">{f.q}</summary>
                  <div className="text-gray-700 text-sm mt-2">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-300/40 backdrop-blur-xl shadow-xl shadow-purple-600/20 flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="font-bold text-2xl mb-2 text-gray-900">Ready to improve faster?</h3>
                <p className="text-gray-700">Sign in and start marking in under a minute.</p>
              </div>
              <div className="mt-6 md:mt-0 flex gap-3">
                <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-xl text-white bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40">Get Started</button>
                <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-xl border border-purple-300/60 text-purple-700 hover:bg-purple-50/70 backdrop-blur-md">Start Marking</button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-purple-200/50 bg-white/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="EnglishGPT logo" className="w-8 h-8 object-contain" style={{ background: 'transparent' }} />
              <span className="font-fredoka font-semibold text-gray-900">EnglishGPT</span>
            </div>
            <div className="text-sm text-gray-600">© {new Date().getFullYear()} EnglishGPT. All rights reserved.</div>
          </div>
        </footer>
        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAuthModal(false)} />
            <div className="relative w-full max-w-xl mx-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-purple-200/60 shadow-2xl p-0 overflow-hidden auth-modal">
              {/* Decorative header */}
              <div className="px-6 pt-6 pb-4 border-b border-purple-200/60 bg-gradient-to-br from-white/60 to-purple-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={LOGO_URL} alt="EnglishGPT logo" className="w-8 h-8 object-contain" style={{ background: 'transparent' }} />
                    <div>
                      <div className="font-fredoka font-semibold text-gray-900">Welcome</div>
                      <div className="text-xs text-gray-600">Sign in to continue to your dashboard</div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAuthModal(false)}>✕</button>
                </div>
              </div>
              {/* Body */}
              <div className="px-6 py-5 grid md:grid-cols-2 gap-6">
                <div className="order-2 md:order-1">
                  <div className="text-sm text-gray-700 mb-3 font-medium">Why sign in?</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>Save your results and track progress</li>
                    <li className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>Unlock analytics and recommendations</li>
                    <li className="flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-0.5">✓</span>Switch devices seamlessly</li>
                  </ul>
                  <div className="text-[11px] text-gray-500 mt-4">By continuing you agree to our terms and privacy policy.</div>
                </div>
                <div className="order-1 md:order-2 space-y-3">
                  {/* Discord button */}
                  <button className="discord-btn" onClick={() => { setShowAuthModal(false); onDiscord(); }}>
                    Continue with Discord
                    <span aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"></path>
                      </svg>
                    </span>
                  </button>
                  {/* Google button */}
                  <button className="google-btn" onClick={() => { setShowAuthModal(false); onGoogle(); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="svg">
                      <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" className="blue"></path>
                      <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" className="green"></path>
                      <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" className="yellow"></path>
                      <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" className="red"></path>
                    </svg>
                    <span className="text">Sign in with Google</span>
                  </button>
                </div>
              </div>
              {/* Modal-scoped styles for custom buttons */}
              <style>{`
                .auth-modal .discord-btn {
                  max-width: 320px;
                  display: flex;
                  overflow: hidden;
                  position: relative;
                  padding: 0.875rem 72px 0.875rem 1.75rem;
                  background-color: rgba(88,101,242,1);
                  background-image: linear-gradient(to top right,rgb(46,56,175),rgb(82,93,218));
                  color: #ffffff;
                  font-size: 15px;
                  line-height: 1.25rem;
                  font-weight: 700;
                  text-align: center;
                  text-transform: uppercase;
                  vertical-align: middle;
                  align-items: center;
                  border-radius: 0.5rem;
                  gap: 0.75rem;
                  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                  border: none;
                  transition: all .6s ease;
                  width: 100%;
                }
                .auth-modal .discord-btn span{background-color: rgb(82,93,218);display:grid;position:absolute;right:0;place-items:center;width:3rem;height:100%;}
                .auth-modal .discord-btn span svg{width:1.5rem;height:1.5rem;color:#fff}
                .auth-modal .discord-btn:hover{box-shadow:0 4px 30px rgba(4,175,255,.1),0 2px 30px rgba(11,158,255,.06)}

                .auth-modal .google-btn{padding:10px;font-weight:bold;display:flex;position:relative;overflow:hidden;border-radius:35px;align-items:center;border:2px solid black;outline:none;width:100%;max-width:320px;background:#fff}
                .auth-modal .google-btn .svg{height:25px;margin-right:10px}
                .auth-modal .google-btn .text{z-index:10;font-size:14px}
                .auth-modal .google-btn:hover .text{animation:text 0.3s forwards}
                @keyframes text{from{color:black}to{color:white}}
                .auth-modal .google-btn .svg{z-index:6}
                .auth-modal .google-btn:hover::before{content:"";display:block;position:absolute;top:50%;left:9%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;border-radius:300px;animation:wave1 2.5s ease-in-out forwards}
                .auth-modal .google-btn:hover::after{content:"";display:block;position:absolute;top:50%;left:9%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;border-radius:300px;animation:wave2 2.5s ease-in-out forwards}
                @keyframes wave1{0%{z-index:1;background:#EB4335;width:0;height:0;opacity:1}1%{z-index:1;background:#EB4335;width:0;height:0;opacity:1}25%{z-index:1;background:#EB4335;width:800px;height:800px;opacity:1}26%{z-index:3;background:#34A853;width:0;height:0;opacity:1}50%{z-index:3;background:#34A853;width:800px;height:800px;opacity:1}70%{z-index:3;background:#34A853;width:800px;height:800px;opacity:1}100%{z-index:3;background:#34A853;width:800px;height:800px;opacity:1}}
                @keyframes wave2{0%{z-index:2;background:#FBBC05;width:0;height:0;opacity:1}11%{z-index:2;background:#FBBC05;width:0;height:0;opacity:1}35%{z-index:2;background:#FBBC05;width:800px;height:800px;opacity:1}39%{z-index:2;background:#FBBC05;width:800px;height:800px;opacity:1}40%{z-index:4;background:#4285F4;width:0;height:0;opacity:1}64%{z-index:4;background:#4285F4;width:800px;height:800px;opacity:1}100%{z-index:4;background:#4285F4;width:800px;height:800px;opacity:1}}
                .auth-modal .google-btn:hover .red{animation:disappear 0.1s forwards;animation-delay:0.1s}
                .auth-modal .google-btn:hover .yellow{animation:disappear 0.1s forwards;animation-delay:0.3s}
                .auth-modal .google-btn:hover .green{animation:disappear 0.1s forwards;animation-delay:0.7s}
                .auth-modal .google-btn:hover .blue{animation:disappear 0.1s forwards;animation-delay:1.1s}
                @keyframes disappear{from{filter:brightness(1)}to{filter:brightness(100)}}
              `}</style>
            </div>
          </div>
        )}
      </div>
    );
  };
  const [evaluations, setEvaluations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => { const cachedAuth = sessionStorage.getItem("auth_checked"); return !cachedAuth; }); // Only for initial authentication loading
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, category: 'overall' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackAccurate, setFeedbackAccurate] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  // Additional loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    userUpdate: false,
    dataLoad: false,
    planUpdate: false,
    historyLoad: false,
    fileUpload: false
  });
  
  // Helper function to update loading states
  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // PayU functions removed - ready for DodoPayments integration

  // --- Tab routing: sync URL <-> currentPage ---
  const routerLocation = useLocation();
  const tabToPage = {
    pricing: 'pricing',
    history: 'history',
    analytics: 'analytics',
    write: 'questionTypes',
  };
  const pageToTab = {
    pricing: 'pricing',
    history: 'history',
    analytics: 'analytics',
    questionTypes: 'write',
  };

  // When URL changes, update currentPage accordingly (for /dashboard and tab param)
  useEffect(() => {
    const pathname = (routerLocation && routerLocation.pathname) || '';
    if (pathname.startsWith('/results/')) return; // results handled separately
    if (!pathname.startsWith('/dashboard')) return; // only control under dashboard
    const search = new URLSearchParams((routerLocation && routerLocation.search) || '');
    const tab = (search.get('tab') || '').toLowerCase();
    if (tab && tabToPage[tab]) {
      if (currentPage !== tabToPage[tab]) setCurrentPage(tabToPage[tab]);
    } else {
      if (currentPage !== 'dashboard') setCurrentPage('dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.pathname, routerLocation.search]);

  // When currentPage changes, ensure URL reflects /dashboard?tab=...
  useEffect(() => {
    const pathname = (routerLocation && routerLocation.pathname) || '';
    if (pathname.startsWith('/results/')) return; // don't override results links
    const desiredTab = pageToTab[currentPage];
    if (desiredTab) {
      const currentTab = new URLSearchParams((routerLocation && routerLocation.search) || '').get('tab');
      if (currentTab !== desiredTab || !pathname.startsWith('/dashboard')) {
        navigate(`/dashboard?tab=${desiredTab}`, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const submitFeedback = async () => {
    if (!evaluation || !user) return;
    if (feedbackAccurate === null) return;
    setFeedbackSubmitting(true);
    try {
      await axios.post(`${API}/feedback`, {
        evaluation_id: evaluation.id || evaluation?.evaluation_id || evaluation?.timestamp || 'unknown',
        user_id: user?.uid || user?.id,
        category: feedbackModal.category,
        accurate: !!feedbackAccurate,
        comments: feedbackComments || null,
      });
      setFeedbackModal({ open: false, category: 'overall' });
      setFeedbackAccurate(null);
      setFeedbackComments('');
    } catch (e) {
      console.error('Feedback submit failed', e);
    } finally {
      setFeedbackSubmitting(false);
    }
  };
  
  // Undo/Redo functionality for essay writing
  const [essayHistory, setEssayHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentEssayText, setCurrentEssayText] = useState('');
  
  // Add to essay history (for undo/redo)
  const addToHistory = (text) => {
    const newHistory = essayHistory.slice(0, historyIndex + 1);
    newHistory.push(text);
    setEssayHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // Undo function
  const undoEssay = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentEssayText(essayHistory[historyIndex - 1]);
    }
  };
  
  // Redo function
  const redoEssay = () => {
    if (historyIndex < essayHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentEssayText(essayHistory[historyIndex + 1]);
    }
  };
  
  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only apply shortcuts when not typing in input fields
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );
      
      // Ctrl+Z for undo (only in textareas)
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey && isTyping) {
        // Allow default behavior in text fields
        return;
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for redo (only in textareas)
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        if (isTyping) return; // Allow default in text fields
        e.preventDefault();
        redoEssay();
      }
      
      // Navigation shortcuts (when not typing)
      if (!isTyping) {
        // Alt+1 for Dashboard
        if (e.altKey && e.key === '1') {
          e.preventDefault();
          setCurrentPage('dashboard');
        }
        // Alt+2 for Analytics
        if (e.altKey && e.key === '2') {
          e.preventDefault();
          setCurrentPage('analytics');
        }
        // Alt+3 for History
        if (e.altKey && e.key === '3') {
          e.preventDefault();
          setCurrentPage('history');
        }
        // Alt+4 for Account
        if (e.altKey && e.key === '4') {
          e.preventDefault();
          setCurrentPage('account');
        }
                 // Escape to go back/close modals
         if (e.key === 'Escape') {
           e.preventDefault();
           if (showShortcutsHelp) {
             setShowShortcutsHelp(false);
           } else if (showErrorModal) {
             setShowErrorModal(false);
           } else if (currentPage !== 'dashboard') {
             setCurrentPage('dashboard');
           }
         }
         // ? to show keyboard shortcuts help
         if (e.key === '?' || (e.shiftKey && e.key === '/')) {
           e.preventDefault();
           setShowShortcutsHelp(true);
         }
      }
      
      // Ctrl+S for save (prevent default browser save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Could implement auto-save here
      }
      
      // Ctrl+Enter to submit forms (when in textarea)
      if (e.ctrlKey && e.key === 'Enter' && isTyping && activeElement.tagName === 'TEXTAREA') {
        e.preventDefault();
        // Find and click submit button
        const submitButton = document.querySelector('button[type="submit"], button:contains("Submit"), button:contains("Evaluate")');
        if (submitButton) {
          submitButton.click();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
      }, [historyIndex, essayHistory, currentPage, showErrorModal, showShortcutsHelp]);
  
  // Loading messages array
  const loadingMessages = [
    "🤖 AI is analyzing your essay...",
    "📝 Checking grammar and structure...",
    "🎯 Evaluating content quality...",
    "✨ Analyzing writing style and flow...",
    "🔍 Examining vocabulary usage...",
    "📊 Assessing argument structure...",
    "🎭 Reviewing literary techniques...",
    "💡 Identifying key strengths...",
    "🎨 Evaluating descriptive language...",
    "🧠 Processing complex ideas...",
    "📖 Checking coherence and clarity...",
    "🏆 Measuring against marking criteria...",
    "🌟 Crafting improvement suggestions...",
    "🎪 Analyzing tone and mood...",
    "🔬 Examining evidence and examples...",
    "🎵 Checking rhythm and pacing...",
    "🌈 Evaluating creativity and originality...",
    "⚡ Generating personalized feedback...",    
    "⭐ Finalizing detailed assessment...",
    "🎉 Almost done! Preparing your results..."
  ];

  // Loading state management
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Rotate messages every 2 seconds when evaluationLoading is true
  useEffect(() => {
    if (evaluationLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [evaluationLoading, loadingMessages.length]);
  
  // Authentication effect
  useEffect(() => {
    const safeAtob = (str) => {
      try {
        return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
      } catch {
        return '';
      }
    };

    const decodeJwt = (jwt) => {
      if (!jwt || typeof jwt !== 'string') return null;
      const parts = jwt.split('.');
      if (parts.length < 2) return null;
      const header = JSON.parse(safeAtob(parts[0] || '')) || {};
      const payload = JSON.parse(safeAtob(parts[1] || '')) || {};
      return { header, payload };
    };

    const hydrateSessionFromUrl = async () => {
      try {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
        const code = searchParams.get('code') || hashParams.get('code');

        if (code) {
          // Debug logging removed for production
    // console.log('DEBUG: Detected OAuth PKCE code param');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          // Debug logging removed for production
    // console.log('DEBUG: exchangeCodeForSession result:', { data, error });
          const userRes = await supabase.auth.getUser();
          // Debug logging removed for production
    // console.log('DEBUG: getUser after code exchange:', userRes);
          // Clean URL (remove code from both query and hash)
          const cleanedSearch = url.search.replace(/([?&])code=[^&]*&?/, '$1').replace(/[?&]$/, '');
          window.history.replaceState({}, document.title, window.location.pathname + cleanedSearch);
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname + cleanedSearch);
          }
        }
      } catch (e) {
        // Debug logging removed for production
      // console.error('DEBUG: Error hydrating session from URL:', e);
      }
    };

    const initializeSession = async () => {
      // Debug logging removed for production
    // console.log('DEBUG: Getting session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        // Debug logging removed for production
    // console.log('DEBUG: Session data:', session);
        // Debug logging removed for production
    // console.log('DEBUG: Session error:', error);
        if (session?.user?.id) {
          setUser(session.user);
          loadUserData(session.user, true);
          // If already signed in and currently on landing, go to dashboard
          if (typeof window !== 'undefined' && window.location.pathname === '/') {
            window.location.href = 'https://englishgpt.everythingenglish.xyz/dashboard';
          }
        } else {
          setUser(null);
          setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
          setEvaluations([]);
        }
      } catch (error) {
        // Debug logging removed for production
      // console.error('DEBUG: Exception getting session:', error);
        setUser(null);
        setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    // First, hydrate if returning from OAuth
    hydrateSessionFromUrl().finally(initializeSession);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Debug logging removed for production
    // console.log('DEBUG: Auth state change:', event, session?.user?.id);
      // Debug logging removed for production
    // console.log('DEBUG: Full session object:', session);
      switch (event) {
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
          if (session?.user?.id) {
            setUser(session.user);
            // Force reload user data on sign-in and initial session
            loadUserData(session.user, true);
            // Ensure clean URL after sign-in
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            // Only redirect from landing to dashboard
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              window.location.href = 'https://englishgpt.everythingenglish.xyz/dashboard';
            }
          }
          break;
        case 'TOKEN_REFRESHED':
          if (session?.user?.id) {
            setUser(session.user);
            // Only reload user data if it's been a while since last load
            // TOKEN_REFRESHED happens frequently and shouldn't trigger full data reload every time
            loadUserData(session.user, false);
          }
          break;
        case 'SIGNED_OUT':
        default:
          setUser(null);
          setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
          setEvaluations([]);
          // Go back to landing on sign out
          navigate('/', { replace: true });
          break;
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      // Clean up user data timeout on unmount
      if (userDataTimeout.current) {
        clearTimeout(userDataTimeout.current);
      }
    };
  }, []);
  
  // Cache for preventing unnecessary loadUserData calls
  const lastUserDataLoad = useRef(null);
  const userDataTimeout = useRef(null);
  
  // Load user data from backend with debouncing and caching
  const loadUserData = async (supabaseUser, force = false) => {
    // Debug logging removed for production
    // console.log('DEBUG: loadUserData called with:', supabaseUser);
    
    if (!supabaseUser) {
      console.error('No user object provided to loadUserData');
      return;
    }
    
    if (!supabaseUser.id) {
      console.error('No user ID in supabaseUser:', supabaseUser);
      return;
    }
    
    if (supabaseUser.id === 'undefined' || supabaseUser.id === undefined) {
      console.error('User ID is undefined:', supabaseUser.id);
      return;
    }

    // Prevent unnecessary calls - only reload if it's been more than 5 minutes or forced
    const now = Date.now();
    const lastLoad = lastUserDataLoad.current;
    const timeSinceLastLoad = lastLoad ? now - lastLoad : Infinity;
    const shouldLoad = force || !lastLoad || timeSinceLastLoad > 5 * 60 * 1000; // 5 minutes
    
    if (!shouldLoad) {
      // console.log('DEBUG: Skipping loadUserData - recent load detected');
      return;
    }

    // Clear any existing timeout
    if (userDataTimeout.current) {
      clearTimeout(userDataTimeout.current);
    }

    // Debounce - wait 100ms before actually loading
    userDataTimeout.current = setTimeout(async () => {
      setLoadingState('dataLoad', true);
      try {
        // Debug logging removed for production
      // console.log('DEBUG: Loading user data for:', supabaseUser.id);
        
        const userData = {
          user_id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email
        };
        
        // Debug logging removed for production
      // console.log('DEBUG: Sending user data to backend:', userData);
        const response = await axios.post(`${API}/users`, userData);
        const userInfo = response.data.user;
        
        // Update last load time
        lastUserDataLoad.current = Date.now();
      
      // Set the user state with backend user data
      setUser(userInfo);
      
      setUserStats({
        questionsMarked: userInfo.questions_marked || 0,
        credits: userInfo.credits || 3,
        currentPlan: userInfo.current_plan || 'free'
      });
      
      // Show launch event modal for users with unlimited plan (new or upgraded)
      if (userInfo.current_plan === 'unlimited' && !hasShownLaunchModal) {
        // Check if this is their first time seeing the modal
        const modalShownKey = `launch_modal_shown_${userInfo.uid || userInfo.id}`;
        const hasSeenModal = localStorage.getItem(modalShownKey);
        
        if (!hasSeenModal) {
          setShowLaunchEventModal(true);
          setHasShownLaunchModal(true);
          localStorage.setItem(modalShownKey, 'true');
        }
      }
      
      // Load dark mode preference
      setDarkMode(userInfo.dark_mode || false);
      
      // Load user's evaluations with loading state
      setLoadingState('historyLoad', true);
      const historyResponse = await axios.get(`${API}/history/${supabaseUser.id}`);
      setEvaluations(historyResponse.data.evaluations || []);
      setLoadingState('historyLoad', false);
      
        // Debug logging removed for production
      // console.log('DEBUG: User data loaded successfully');
        
      } catch (error) {
        console.error('Error loading user data:', error);
        console.error('Error details:', error.response?.data);
        // Handle authentication errors gracefully
        if (error.response?.status === 401) {
          // Token might be expired, let Supabase handle re-authentication
          console.log('Authentication error, will retry on next auth event');
        }
      } finally {
        setLoadingState('dataLoad', false);
      }
    }, 100); // 100ms debounce
  };
  
  // Toggle dark mode
  const toggleDarkMode = async () => {
    const userId = user?.uid || user?.id;
    if (!user || !userId) {
      console.error('Cannot update dark mode: user not ready');
      return;
    }

    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    try {
      await axios.put(`${API}/users/${userId}/preferences`, {
        dark_mode: newDarkMode
      });
    } catch (error) {
      console.error('Error updating dark mode preference:', error);
    }
  };
  
  // Handle academic level change
  const handleAcademicLevelChange = async (level) => {
    const userId = user?.uid || user?.id;
    if (!user || !userId) {
      console.error('Cannot update academic level: user not ready');
      return;
    }

    const normalized = level.toLowerCase().replace(/[^a-z]/g, '');
    // Debug logging removed for production
    // console.log('DEBUG: onLevelChange called with:', level, 'normalized:', normalized);
    setSelectedLevel(normalized);    
    // Update the user level in backend
    try {
      // Debug logging removed for production
    // console.log('DEBUG: Updating user level in backend:', { academic_level: level });
      await axios.put(`${API}/users/${userId}`, { academic_level: level });
      // Debug logging removed for production
    // console.log('DEBUG: User level updated successfully');
    } catch (err) {
      // Debug logging removed for production
      // console.error('DEBUG: Error updating level:', err);
      // Don't throw error here to avoid breaking the UI flow
    }
  };
  
  // Validation function for essay content
  const validateEssayContent = (studentResponse, questionType) => {
    const wordCount = studentResponse.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Skip word count validation for summary writing
    if (questionType === 'igcse_summary') {
      // Only check for test content
    } else {
      // Check word count for other question types
      if ( 1 < wordCount && wordCount < 100) {
        return {
          isValid: false,
          error: `Your essay is too short. You have ${wordCount} words, but you need at least 100 words for a proper evaluation. We understand you might want to test our AI, for that, please look at our examples on the dashboard. Please write a more detailed response to get meaningful feedback.`
        };
      }
      if (wordCount === 1) {
        return {
          isValid: false,
          error: `Your essay is too long. You have ${wordCount} word, but you need at least 100 words for a proper evaluation. We understand you might want to test our AI, for that, please look at our examples on the dashboard. Please write a more detailed response to get meaningful feedback.`
        };
      }
    }
    
    // Check for test content
    const testWords = ['test', 'hello', 'world', 'random', 'testing', 'sample', 'example', 'demo', 'essay', 'essay writing', 'essay help', 'essay writing help', 'essay writing service', 'essay writing assistant', 'essay writing tool', 'essay writing software', 'essay writing app', 'essay writing online', 'essay writing tool', 'essay writing software', 'essay writing app', 'essay writing online', 'okay', ];
    const lowerResponse = studentResponse.toLowerCase();
    
    // Check if response contains mostly test words or is very repetitive
    const testWordCount = testWords.filter(word => lowerResponse.includes(word)).length;
    const uniqueWords = new Set(lowerResponse.split(/\s+/).filter(word => word.length > 0));
    const totalWords = lowerResponse.split(/\s+/).filter(word => word.length > 0).length;
    
    if (testWordCount > 2 || (uniqueWords.size / totalWords) < 0.3) {
      return {
        isValid: false,
        error: `Your essay appears to be test content or contains repetitive text. Please write a proper essay with meaningful content to get accurate feedback. The AI needs real content to provide helpful analysis.`
      };
    }
    
    // Check for very short responses
    if (studentResponse.trim().length < 200) {
      return {
        isValid: false,
        error: `Your essay is too brief for meaningful analysis. Please write a more detailed response (at least 200 characters) to receive comprehensive feedback.`
      };
    }
    
    return { isValid: true };
  };
  
// Authentication functions
const signInWithDiscord = async () => {
  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard';
    
    // Debug logging removed for production
    // console.log('Current origin:', window.location.origin);
    console.log('Redirect URL will be:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: redirectUrl,
        flowType: 'pkce'
      }
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in with Discord:', error);
    alert('Discord sign-in is not configured. Please try Google sign-in.');
  }
};

const signInWithGoogle = async () => {
  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard';
    
    // Debug logging removed for production
    // console.log('Current origin:', window.location.origin);
    console.log('Redirect URL will be:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        flowType: 'pkce'
      }
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    alert('Google sign-in is not configured. Please try Discord sign-in.');
  }
};

const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

  // Authentication state is already handled above with Supabase


  // Authentication Required Component
  const AuthRequired = ({ children }) => {
    // Only show loading for initial authentication, not for data loading
    if (loading) {
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-main'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="mb-8">
              <img 
                src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
                alt="EnglishGPT Logo" 
                className="w-20 h-20 mx-auto object-contain animate-pulse"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="loading-animation">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
            <p className="mt-4 font-fredoka">
              Starting the magic...
            </p>
            <p className="mt-2 text-sm opacity-75">
              Please wait while we make your english prep effortless
            </p>
          </div>
        </div>
      );
    }

    if (!user) {
      // Redirect unauthenticated users to landing page; do not render sign-in UI here
      navigate('/', { replace: true });
      return null;
    }

    return (
      <div className={darkMode ? 'dark' : ''}>
        {currentPage === 'dashboard' && (
          <Dashboard 
            questionTypes={questionTypes}
            onStartQuestion={handleStartQuestion}
            onPricing={() => setCurrentPage('pricing')}
            onHistory={() => setCurrentPage('history')}
            onAnalytics={() => setCurrentPage('analytics')}
            onAccountSettings={() => setCurrentPage('accountSettings')}
            onSubscription={() => setCurrentPage('subscription')}
            userStats={userStats}
            user={user}
            darkMode={darkMode}
            onSignOut={handleSignOut}
          />
        )}
        {currentPage === 'questionTypes' && (
          <QuestionTypePage 
            questionTypes={questionTypes} 
            onSelectQuestionType={handleSelectQuestionType}
            onBack={handleBack}
            onEvaluate={handleEvaluate}
            selectedLevel={selectedLevel}
            darkMode={darkMode}
          />
        )}
        {currentPage === 'assessment' && (
          <AssessmentPage 
            selectedQuestionType={selectedQuestionType}
            onBack={handleBack}
            onEvaluate={handleEvaluate}
            darkMode={darkMode}
          />
        )}
        {currentPage === 'results' && evaluation && (
          <ResultsPage 
            evaluation={evaluation}
            onNewEvaluation={handleNewEvaluation}
            userPlan={userStats.currentPlan}
            
            darkMode={darkMode}
          />
        )}

        {currentPage === 'pricing' && (
          <PricingPage 
            onBack={handleBack}
            user={user}
          />
        )}
        {currentPage === 'subscription' && (
          <SubscriptionDashboard
            user={user}
            onBack={handleBack}
            darkMode={darkMode}
          />
        )}
        {currentPage === 'history' && (
          <HistoryPage 
            onBack={handleBack}
            evaluations={evaluations}
            userPlan={userStats.currentPlan}
          />
        )}
        {currentPage === 'analytics' && (
          <AnalyticsDashboard 
            onBack={handleBack}
            userStats={userStats}
            user={user}
            evaluations={evaluations}
            onUpgrade={() => setCurrentPage('pricing')}
          />
        )}
        {currentPage === 'accountSettings' && (
          <AccountPage 
            onBack={handleBack}
            user={user}
            userStats={userStats}
            onLevelChange={handleAcademicLevelChange}
            showLevelPrompt={showLevelPrompt}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onPricing={() => setCurrentPage('pricing')}
          />
        )}
        
        {/* Sign In Modal for unauthenticated users on results page */}
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          darkMode={darkMode}
        />
      </div>
    );
  };
  
  // Load question types
  useEffect(() => {
    const loadQuestionTypes = async () => {
      try {
        const response = await axios.get(`${API}/question-types`);
        setQuestionTypes(response.data.question_types);
      } catch (error) {
        console.error('Error loading question types:', error);
      }
    };
    loadQuestionTypes();
  }, []);
  
  const handleStartQuestion = () => {
    // Debug logging removed for production
    // console.log('DEBUG: handleStartQuestion called, selectedLevel:', selectedLevel);
    if (selectedLevel) {
      // Debug logging removed for production
    // console.log('DEBUG: Level found, going to questionTypes');
      setCurrentPage('questionTypes');
    } else {
      // Debug logging removed for production
    // console.log('DEBUG: No level found, redirecting to account settings');
      // Redirect to account settings with level prompt
      setShowLevelPrompt(true);
      setCurrentPage('accountSettings');
    }
  };

  // --- On login, fetch academic level from backend ---
  useEffect(() => {
    const userId = user?.uid || user?.id;
    if (user && userId) {
      // Debug logging removed for production
    // console.log('DEBUG: Fetching user level for:', userId);
      const fetchUserLevel = async () => {
        try {
          const response = await axios.get(`${API}/users/${userId}`);
          let backendLevel = response.data.user?.academic_level;
          // Debug logging removed for production
    // console.log('DEBUG: Fetched academic level:', backendLevel);
          if (backendLevel && backendLevel !== 'N/A') {
            backendLevel = backendLevel.toLowerCase().replace(/[^a-z]/g, ''); // normalize
            // Debug logging removed for production
    // console.log('DEBUG: Normalized level:', backendLevel);
            setSelectedLevel(backendLevel);
          } else {
            // Debug logging removed for production
    // console.log('DEBUG: No level set or level is N/A');
          }
        } catch (error) {
          console.error('Error fetching user level:', error);
          console.error('Error details:', error.response?.data);
        }
      };
      fetchUserLevel();
    } else {
      // Debug logging removed for production
    // console.log('DEBUG: No user or user ID available for fetching level');
    }
  }, [user]);
  
  const handleSelectQuestionType = (questionType) => {
    setSelectedQuestionType(questionType);
    setCurrentPage('assessment');
  };
  
  const handleEvaluate = async (evaluationResult) => {
    if (!evaluationResult) return;
    
    const userId = user?.uid || user?.id;
    if (!user || !userId) {
      console.error('Cannot evaluate: user not ready');
      setErrorMessage('Please wait for authentication to complete.');
      setShowErrorModal(true);
      return;
    }
    
    // Validate essay content before sending to API
    const validation = validateEssayContent(evaluationResult.student_response, evaluationResult.question_type);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      setShowErrorModal(true);
      return;
    }
    
    setEvaluationLoading(true);
    try {
      const evaluationWithUser = {
        ...evaluationResult,
        user_id: userId
      };
      const response = await axios.post(`${API}/evaluate`, evaluationWithUser);
      setEvaluation(response.data);
      setEvaluations(prev => [response.data, ...prev]);
      
      // Update user stats based on plan
      if (userStats.currentPlan === 'unlimited') {
        setUserStats(prev => ({
          ...prev,
          questionsMarked: prev.questionsMarked + 1,
          credits: prev.currentPlan === 'free' ? prev.credits - 1 : prev.credits
        }));
      } else {
      setUserStats(prev => ({
        ...prev,
        credits: prev.credits - 1,
        questionsMarked: prev.questionsMarked + 1,
          showWelcomeMessage: false
      }));
      }
      
      // Navigate to shareable public results page (prefer short_id if present)
      const resultId = response?.data?.short_id || response?.data?.id;
      if (resultId) {
        navigate(`/results/${resultId}`);
      } else {
        navigate(`/dashboard`);
      }
    } catch (error) {
      console.error('Error evaluating submission:', error);
      // Handle specific error messages
      if (error.response?.status === 402) {
        setErrorMessage('No credits remaining. Please upgrade to unlimited for unlimited marking.');
        setShowErrorModal(true);
      } else if (error.response?.status === 429) {
        setErrorMessage('Rate limit exceeded. Please try again later.');
        setShowErrorModal(true);
      }
    } finally {
      setEvaluationLoading(false);
    }
  };
  
  const handleNewEvaluation = () => {
    // Check if user is signed in
    if (!user) {
      // Show sign-in modal for unauthenticated users
      setShowSignInModal(true);
      return;
    }
    
    // For authenticated users, navigate to question types
    // Check if we're on a public results page (routed component)
    const isPublicResultsPage = window.location.pathname.startsWith('/results/');
    
    if (isPublicResultsPage) {
      // Navigate using window.location for public results pages
      window.location.href = '/dashboard';
    } else {
      // Use state-based navigation for main app
      setSelectedQuestionType(null);
      setEvaluation(null);
      setCurrentPage('questionTypes');
    }
  };

  // Public Result route wrapper component to fetch by ID and render ResultsPage
  const PublicResultPageWrapper = () => {
    const { id } = useParams();
    const [loadingEval, setLoadingEval] = useState(true);
    const [publicEval, setPublicEval] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      let isMounted = true;
      const fetchEvaluation = async () => {
        try {
          const response = await axios.get(`${API}/evaluations/${id}`);
          if (!isMounted) return;
          setPublicEval(response.data.evaluation);
        } catch (err) {
          console.error('Failed to load evaluation:', err);
        } finally {
          if (isMounted) setLoadingEval(false);
        }
      };
      fetchEvaluation();
      return () => { isMounted = false; };
    }, [id]);

    if (loadingEval) {
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-main'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="mb-8">
              <img 
                src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
                alt="EnglishGPT Logo" 
                className="w-20 h-20 mx-auto object-contain animate-pulse"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="loading-animation">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
            <p className="mt-4 font-fredoka">Loading result...</p>
          </div>
        </div>
      );
    }

    if (!publicEval) {
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-main'} flex items-center justify-center`}>
          <div className="text-center">
            <h1 className="text-2xl font-fredoka font-bold mb-2">Result not found</h1>
            <p className="text-gray-600">The evaluation you are looking for does not exist or has been removed.</p>
            <button onClick={() => navigate('/')} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg">Go Home</button>
          </div>
        </div>
      );
    }

    return (
      <div className={darkMode ? 'dark' : ''}>
        <ResultsPage 
          evaluation={publicEval}
          onNewEvaluation={handleNewEvaluation}
          userPlan={userStats.currentPlan}
          darkMode={darkMode}
        />
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          darkMode={darkMode}
        />
      </div>
    );
  };
  
  const handleSelectPlan = async (plan) => {
    const userId = user?.uid || user?.id;
    if (!user || !userId) {
      console.error('Cannot update plan: user not ready');
      return;
    }

    try {
      // Update to unlimited plan. Distinguish monthly vs yearly by id if provided
      const selectedId = plan?.id || 'unlimited_monthly';
      const planName = 'unlimited'; // backend recognizes 'unlimited' for access
      const updates = {
        current_plan: planName,
        updated_at: new Date().toISOString()
      };
      
      await axios.put(`${API}/users/${userId}`, updates);
      
      setUserStats(prev => ({
        ...prev,
        currentPlan: 'unlimited',
        showWelcomeMessage: false
      }));
      
      setCurrentPage('dashboard');
      
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };
  
  const handleBack = () => {
    if (currentPage === 'questionTypes') {
      setCurrentPage('dashboard');
    } else if (currentPage === 'assessment') {
      setCurrentPage('questionTypes');
    } else if (currentPage === 'pricing' || currentPage === 'history' || currentPage === 'analytics' || currentPage === 'accountSettings') {
      setCurrentPage('dashboard');
      setShowLevelPrompt(false); // Clear the level prompt when going back to dashboard
    }
  };

  // HARDCODED: Show loading screen when evaluationLoading is true
  if (evaluationLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-main'} flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="mb-8">
            <img 
              src="https://ik.imagekit.io/lqf8a8nmt/logo-modified.png?updatedAt=1752578868143" 
              alt="EnglishGPT Logo" 
              className="w-20 h-20 mx-auto object-contain animate-pulse"
              style={{ background: 'transparent' }}
            />
          </div>
          <div className="loading-animation">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            
            <div className="loading-text">
              {loadingMessages[loadingMessageIndex]}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/results/:id" element={<PublicResultPageWrapper />} />
      {/* Public landing */}
      <Route path="/" element={<LandingPage onDiscord={signInWithDiscord} onGoogle={signInWithGoogle} />} />
      {/* Dashboard entry */}
      <Route path="/dashboard" element={<div className={darkMode ? 'dark' : ''}><AuthRequired /></div>} />
      {/* Payment success landing */}
      <Route path="/dashboard/payment-success" element={<PaymentSuccess darkMode={darkMode} />} />

      {/* App routes behind auth */}
      <Route
        path="*"
        element={
          <div className={darkMode ? 'dark' : ''}>
            <AuthRequired />
            <SignInModal
              isOpen={showSignInModal}
              onClose={() => setShowSignInModal(false)}
              darkMode={darkMode}
            />
            <ErrorModal 
              isOpen={showErrorModal} 
              onClose={() => setShowErrorModal(false)}
              message={errorMessage}
              darkMode={darkMode}
            />
            <LaunchEventModal
              isOpen={showLaunchEventModal}
              onClose={() => setShowLaunchEventModal(false)}
              darkMode={darkMode}
            />
            <KeyboardShortcutsHelp 
              isVisible={showShortcutsHelp}
              onClose={() => setShowShortcutsHelp(false)}
            />
            
            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: darkMode ? '#374151' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                },
              }}
            />
          </div>
        }
      />
    </Routes>
  );
};

export default App;