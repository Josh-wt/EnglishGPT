import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from '../ui/Footer';
import { getUserAnalytics } from '../../services/analytics';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  TrophyIcon, 
  FireIcon,
  LightBulbIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  ChartPieIcon,
  AcademicCapIcon,
  ClockIcon,
  BoltIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophySolidIcon,
  FireIcon as FireSolidIcon,
  SparklesIcon as SparklesSolidIcon
} from '@heroicons/react/24/solid';

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
  console.log('🚀 [AnalyticsDashboard] Component initialized with props:', {
    userStats,
    user: user ? { id: user.id, email: user.email } : null,
    evaluationsCount: evaluations?.length || 0,
    onBack: typeof onBack,
    onUpgrade: typeof onUpgrade
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [lastFetchedCount, setLastFetchedCount] = useState(0);

  console.log('📊 [AnalyticsDashboard] State initialized:', {
    selectedTimeRange,
    activeTab,
    hasAiRecommendations: !!aiRecommendations,
    loadingRecommendations,
    hasAnalyticsData: !!analyticsData,
    lastFetchedCount
  });
  
  // Check if user has unlimited access
  const hasUnlimitedAccess = useMemo(() => {
    const plan = userStats?.current_plan?.toLowerCase();
    const credits = userStats?.credits;
    const hasAccess = plan === 'unlimited' || credits >= 99999;
    
    console.log('🔐 [AnalyticsDashboard] Access check:', {
      plan,
      credits,
      hasAccess,
      userStats
    });
    
    return hasAccess;
  }, [userStats?.current_plan, userStats?.credits]);

  // Check if new insights are available (dynamic - 5 assessments after last fetch)
  const shouldShowInsightsButton = useMemo(() => {
    const currentCount = evaluations?.length || 0;
    
    console.log('💡 [AnalyticsDashboard] Insights button calculation:', {
      currentCount,
      lastFetchedCount,
      hasAiRecommendations: !!aiRecommendations,
      evaluationsLength: evaluations?.length
    });
    
    // Always require minimum of 5 assessments for first insights
    if (currentCount < 5) {
      console.log('💡 [AnalyticsDashboard] Insights button hidden - insufficient assessments:', {
        currentCount,
        required: 5
      });
      return false;
    }
    
    // Show button if we haven't fetched yet
    if (!aiRecommendations || lastFetchedCount === 0) {
      console.log('💡 [AnalyticsDashboard] Insights button shown - first time fetch:', {
        currentCount,
        hasAiRecommendations: !!aiRecommendations,
        lastFetchedCount
      });
      return true;
    }
    
    // Show button if 5+ new assessments since last fetch
    // This is dynamic: if user fetched at 8, next appears at 13
    // If they skip 13 and fetch at 17, next appears at 22
    const assessmentsSinceLastFetch = currentCount - lastFetchedCount;
    const shouldShow = assessmentsSinceLastFetch >= 5;
    
    console.log('💡 [AnalyticsDashboard] Insights button calculation:', {
      currentCount,
      lastFetchedCount,
      assessmentsSinceLastFetch,
      shouldShow,
      required: 5
    });
    
    return shouldShow;
  }, [evaluations?.length, lastFetchedCount, aiRecommendations]);

  // Calculate when next insights will be available
  const nextInsightCount = useMemo(() => {
    const nextCount = !lastFetchedCount || lastFetchedCount === 0 ? 5 : lastFetchedCount + 5;
    console.log('🔮 [AnalyticsDashboard] Next insight count calculated:', {
      lastFetchedCount,
      nextCount
    });
    return nextCount;
  }, [lastFetchedCount]);

  // Manual fetch for AI insights
  const fetchAIInsights = async () => {
    console.log('🚀 [AI Insights] fetchAIInsights called');
    console.log('🔍 [AI Insights] Pre-flight checks:', {
      hasUser: !!user,
      userId: user?.id,
      hasUnlimitedAccess,
      userStats,
      currentPlan: userStats?.current_plan,
      credits: userStats?.credits
    });

    if (!user?.id || !hasUnlimitedAccess) {
      console.log('❌ [AI Insights] Cannot fetch - missing user or access:', {
        hasUser: !!user,
        hasUserId: !!user?.id,
        hasUnlimitedAccess,
        reason: !user?.id ? 'No user ID' : 'No unlimited access'
      });
      return;
    }
    
    try {
      console.log('🚀 [AI Insights] Starting AI insights fetch for user:', user.id);
      console.log('📊 [AI Insights] Current evaluations count:', evaluations?.length || 0);
      console.log('📊 [AI Insights] Last fetched count:', lastFetchedCount);
      
      const startTime = Date.now();
      
      setLoadingRecommendations(true);
      console.log('⏳ [AI Insights] Loading state set to true');
      
      console.log('🔍 [AI Insights] Calling getUserAnalytics with user ID:', user.id);
      const data = await getUserAnalytics(user.id);
      
      const duration = Date.now() - startTime;
      console.log(`✅ [AI Insights] getUserAnalytics completed in ${duration}ms`);
      
      console.log('📊 [AI Insights] Raw response data:', data);
      console.log('📊 [AI Insights] Response structure analysis:', {
        hasData: !!data,
        dataType: typeof data,
        hasAnalytics: !!data?.analytics,
        analyticsType: typeof data?.analytics,
        hasRecommendations: !!data?.analytics?.recommendations,
        recommendationsType: typeof data?.analytics?.recommendations,
        recommendationsLength: data?.analytics?.recommendations?.length,
        totalResponses: data?.analytics?.total_responses,
        analyticsKeys: data?.analytics ? Object.keys(data.analytics) : 'No analytics object'
      });
      
      if (data?.analytics?.recommendations) {
        console.log('💡 [AI Insights] Recommendations content:', data.analytics.recommendations);
        console.log('💡 [AI Insights] First recommendation:', data.analytics.recommendations[0]);
      }
      
      console.log('🔄 [AI Insights] Updating state with new data...');
      setAnalyticsData(data?.analytics);
      setAiRecommendations(data?.analytics?.recommendations);
      setLastFetchedCount(evaluations?.length || 0);
      
      console.log('✅ [AI Insights] State updated successfully:', {
        newAnalyticsData: !!data?.analytics,
        newRecommendations: !!data?.analytics?.recommendations,
        newLastFetchedCount: evaluations?.length || 0,
        recommendationsCount: data?.analytics?.recommendations?.length || 0
      });
      
    } catch (error) {
      console.error('❌ [AI Insights] Error fetching AI insights:', error);
      console.error('❌ [AI Insights] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack,
        name: error.name
      });
      
      if (error.response) {
        console.error('❌ [AI Insights] HTTP Response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      setAiRecommendations(null);
      console.log('🔄 [AI Insights] Recommendations cleared due to error');
    } finally {
      setLoadingRecommendations(false);
      console.log('⏳ [AI Insights] Loading state set to false');
    }
  };

  // If user doesn't have unlimited access, show locked page
  if (!hasUnlimitedAccess) {
    return <LockedAnalyticsPage onBack={onBack} page="analytics" />;
  }

  // Handle loading and empty states
  const hasEvaluations = evaluations && Array.isArray(evaluations) && evaluations.length > 0;
  const isLoadingEvaluations = evaluations === undefined || evaluations === null;
  
  console.log('🔍 Analytics Dashboard State:', {
    evaluations: evaluations,
    evaluationsType: typeof evaluations,
    evaluationsIsArray: Array.isArray(evaluations),
    evaluationsLength: evaluations?.length,
    hasEvaluations,
    isLoadingEvaluations,
    hasUnlimitedAccess
  });

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

  // Prepare chart data (safely handle null/undefined)
  const parsedEvaluations = (evaluations && Array.isArray(evaluations) ? evaluations : []).map((e) => {
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

        {/* Beautiful Horizontal Menu Bar */}
        <div className="w-full mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left Section - Main Navigation */}
              <div className="flex items-center space-x-1">
                {[
                  { id: 'overview', label: 'Overview', Icon: ChartBarIcon, color: 'from-blue-500 to-blue-600' },
                  { id: 'performance', label: 'Performance', Icon: TrophyIcon, color: 'from-yellow-500 to-orange-500' },
                  { id: 'progress', label: 'Progress', Icon: ArrowTrendingUpIcon, color: 'from-green-500 to-emerald-600' },
                  { id: 'insights', label: 'Insights', Icon: LightBulbIcon, color: 'from-purple-500 to-pink-500' }
                ].map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => {
                       console.log('🔄 [AnalyticsDashboard] Tab changed:', {
                         from: activeTab,
                         to: tab.id,
                         tabLabel: tab.label
                       });
                       setActiveTab(tab.id);
                     }}
                     className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 font-fredoka flex items-center gap-3 group ${
                       activeTab === tab.id
                         ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 hover:shadow-md'
                     }`}
                   >
                    <tab.Icon className={`w-5 h-5 transition-transform duration-200 ${
                      activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span className="font-semibold">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Center Section - Time Range Selector */}
              <div className="flex items-center space-x-2 bg-gray-50/80 rounded-xl p-1">
                <span className="text-sm font-medium text-gray-600 px-3">Time Range:</span>
                {['week', 'month', 'quarter', 'year'].map((range) => (
                   <button
                     key={range}
                     onClick={() => {
                       console.log('📅 [AnalyticsDashboard] Time range changed:', {
                         from: selectedTimeRange,
                         to: range
                       });
                       setSelectedTimeRange(range);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                       selectedTimeRange === range
                         ? 'bg-white text-blue-600 shadow-md font-semibold'
                         : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                     }`}
                   >
                    {range}
                  </button>
                ))}
              </div>

              {/* Right Section - Settings Button */}
              <div className="flex items-center">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="h-1 bg-gray-100">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ 
                  width: activeTab === 'overview' ? '25%' : 
                         activeTab === 'performance' ? '50%' : 
                         activeTab === 'progress' ? '75%' : '100%' 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Response Count Display */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-fredoka bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-gray-200">
            <ChartPieIcon className="w-5 h-5" />
            <span>Showing <span className="font-semibold text-gray-900">{totalResponses}</span> responses</span>
          </div>
        </div>
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl border-2 border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs bg-white/30 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                {viewByDate.length > 1 ? (
                  <>
                    {Math.round((viewByDate[viewByDate.length - 1]?.average || 0) - (viewByDate[0]?.average || 0)) > 0 ? 
                      <ArrowTrendingUpIcon className="w-3 h-3" /> : 
                      <ArrowTrendingDownIcon className="w-3 h-3" />
                    }
                    {Math.abs(Math.round((viewByDate[viewByDate.length - 1]?.average || 0) - (viewByDate[0]?.average || 0)))}%
                  </>
                ) : (
                  <>
                    <ArrowRightIcon className="w-3 h-3" />
                    0%
                  </>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-fredoka">
              {Math.round((viewByDate.reduce((s,d)=>s+d.average,0)/(viewByDate.length||1))||0)}%
            </div>
            <div className="text-sm text-blue-100 font-fredoka">Average Score</div>
            <div className="text-xs text-blue-200 mt-2">
              {viewEvaluations.length} assessments in range
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl border-2 border-emerald-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs bg-white/30 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                {(viewEvaluations.length / (new Set(viewByDate?.map(d=>d.date)).size || 1)).toFixed(1)}/day
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-fredoka">
              {new Set(viewByDate?.map(d=>d.date)).size || 0}
            </div>
            <div className="text-sm text-emerald-100 font-fredoka">Active Days</div>
            <div className="text-xs text-emerald-200 mt-2">
              {Math.round(((new Set(viewByDate?.map(d=>d.date)).size || 0) / (daysForRange || 1)) * 100)}% consistency
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl border-2 border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs bg-white/30 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                Explored
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-fredoka">
              {viewByType.length}
            </div>
            <div className="text-sm text-purple-100 font-fredoka">Question Types</div>
            <div className="text-xs text-purple-200 mt-2">
              {viewByType.reduce((s,t)=>s+t.count,0)} total attempts
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl border-2 border-orange-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrophySolidIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs bg-white/30 text-white px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                Peak
              </div>
            </div>
            <div className="text-3xl font-bold mb-1 font-fredoka">
              {Math.round(Math.max(...parsedEvaluations.map(e => (e.max>0?(e.score/e.max)*100:0)), 0))}%
            </div>
            <div className="text-sm text-orange-100 font-fredoka">Best Score</div>
            <div className="text-xs text-orange-200 mt-2">
              You can do this again!
            </div>
          </motion.div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Performance Overview Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900 font-fredoka">Performance Trend</h3>
                </div>
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
                <div className="flex items-center gap-2 mb-6">
                  <TrophyIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900 font-fredoka">Type Performance</h3>
                </div>
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
                <div className="flex items-center gap-2 mb-6">
                  <ChartPieIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900 font-fredoka">Component Analysis</h3>
                </div>
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
              <div className="flex items-center gap-2 mb-6">
                <TrophySolidIcon className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900 font-fredoka">Performance Breakdown</h3>
              </div>
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
              <div className="flex items-center gap-2 mb-6">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900 font-fredoka">Progress Timeline</h3>
              </div>
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
            {/* AI-Powered Personalized Recommendations */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <LightBulbIcon className="w-7 h-7 text-white" />
              </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-fredoka">AI-Powered Insights</h3>
                    <p className="text-sm text-gray-600">Personalized recommendations based on your performance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium shadow-md">
                  <SparklesSolidIcon className="w-4 h-4" />
                  <span>Powered by Advanced AI</span>
              </div>
            </div>

              {shouldShowInsightsButton ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center">
                  {evaluations && evaluations.length < 5 ? (
                    <>
                      <ChartBarIcon className="w-16 h-16 text-purple-500 mx-auto mb-6" />
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 font-fredoka">Complete More Assessments</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        AI insights become available after your 5th submission. Keep writing to unlock personalized recommendations!
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="text-sm text-gray-500">
                          Progress: <span className="font-bold text-purple-600">{evaluations.length} / 5</span> assessments
          </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 max-w-md mx-auto shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(evaluations.length / 5) * 100}%` }}
                        >
                          {evaluations.length > 0 && (
                            <span className="text-white text-xs font-bold">{Math.round((evaluations.length / 5) * 100)}%</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <BoltIcon className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 font-fredoka">
                        {aiRecommendations ? 'New Insights Available!' : 'Get Your AI-Powered Insights'}
                      </h4>
                      <p className="text-gray-600 mb-4 max-w-lg mx-auto">
                        {aiRecommendations 
                          ? `You've completed ${(evaluations?.length || 0) - lastFetchedCount} new assessments since your last analysis (at ${lastFetchedCount}). Generate fresh insights now!`
                          : `Our advanced AI will analyze your ${evaluations?.length || 0} assessments and provide personalized recommendations to help you improve.`
                        }
                      </p>
                      {aiRecommendations && (
                        <div className="mb-6 inline-block bg-purple-100 px-4 py-2 rounded-full">
                          <p className="text-sm text-purple-700 font-medium">
                            <span className="font-bold">{evaluations?.length}</span> total assessments | Last analyzed: <span className="font-bold">{lastFetchedCount}</span>
                          </p>
                        </div>
                      )}
                      <button
                        onClick={fetchAIInsights}
                        disabled={loadingRecommendations}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-fredoka font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
                      >
                        <SparklesSolidIcon className="w-5 h-5" />
                        <span>{aiRecommendations ? 'Refresh AI Insights' : 'Generate AI Insights'}</span>
                        <SparklesSolidIcon className="w-5 h-5" />
                      </button>
                      <p className="text-xs text-gray-500 mt-4">
                        This may take a few seconds while our AI analyzes your performance
                      </p>
                    </>
                  )}
                </div>
              ) : loadingRecommendations ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LightBulbIcon className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 font-fredoka">Analyzing Your Performance</h4>
                  <p className="text-gray-600 mb-4">Our AI is reviewing your {evaluations?.length || 0} assessments...</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500 max-w-md mx-auto">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Identifying performance patterns</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center" style={{animationDelay: '0.2s'}}>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                      <span>Analyzing question type strengths & weaknesses</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center" style={{animationDelay: '0.4s'}}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Generating personalized recommendations</span>
                    </div>
                  </div>
                </div>
              ) : aiRecommendations ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 font-fredoka">Your Personalized Study Plan</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on {lastFetchedCount} assessments
                          {!shouldShowInsightsButton && (
                            <span className="ml-1">
                              • Next update at {nextInsightCount} ({nextInsightCount - (evaluations?.length || 0)} more needed)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {shouldShowInsightsButton && (
                      <button
                        onClick={fetchAIInsights}
                        disabled={loadingRecommendations}
                        className="flex items-center gap-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        <span>Refresh Insights</span>
                      </button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {aiRecommendations.split('\n').map((line, idx) => {
                        // Format bold sections
                        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-700 font-semibold">$1</strong>');
                        
                        // Check if it's a numbered heading
                        if (line.match(/^\d+\.\s\*\*/)) {
                          return (
                            <div key={idx} className="mt-6 mb-3">
                              <h4 
                                className="text-lg font-bold text-purple-800 font-fredoka" 
                                dangerouslySetInnerHTML={{ __html: formattedLine }}
                              />
                            </div>
                          );
                        }
                        
                        // Check if it's a bullet point
                        if (line.trim().startsWith('-')) {
                          return (
                            <div key={idx} className="ml-4 mb-2 flex items-start gap-2">
                              <span className="text-purple-500 mt-1 font-bold">•</span>
                              <span 
                                className="flex-1 text-gray-700 font-fredoka" 
                                dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^-\s*/, '') }}
                              />
                            </div>
                          );
                        }
                        
                        // Regular paragraph
                        return line.trim() ? (
                          <p 
                            key={idx} 
                            className="mb-3 text-gray-700 font-fredoka" 
                            dangerouslySetInnerHTML={{ __html: formattedLine }}
                          />
                        ) : <div key={idx} className="h-2" />;
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center">
                  <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2 font-fredoka">Unable to Generate Insights</h4>
                  <p className="text-gray-600 mb-4">
                    There was an issue generating your AI insights. Please try again.
                  </p>
                  <button
                    onClick={fetchAIInsights}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-fredoka font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 mx-auto"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>

            {/* Performance Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Strongest Area */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <TrophySolidIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 font-fredoka">Strongest Area</h4>
                </div>
                {viewByType.length > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-green-700 mb-1 capitalize font-fredoka">
                      {viewByType.sort((a,b)=>b.average-a.average)[0]?.type || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Average: {viewByType.sort((a,b)=>b.average-a.average)[0]?.average || 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {viewByType.sort((a,b)=>b.average-a.average)[0]?.count || 0} attempts
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Needs Improvement */}
              <motion.div 
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200 shadow-lg"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 font-fredoka">Focus Area</h4>
                </div>
                {viewByType.length > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-orange-700 mb-1 capitalize font-fredoka">
                      {viewByType.sort((a,b)=>a.average-b.average)[0]?.type || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Average: {viewByType.sort((a,b)=>a.average-b.average)[0]?.average || 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Room for {Math.round((viewByType.sort((a,b)=>b.average-a.average)[0]?.average || 0) - (viewByType.sort((a,b)=>a.average-b.average)[0]?.average || 0))}% improvement
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Recent Trend */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 font-fredoka">Recent Trend</h4>
                </div>
                {viewByDate.length >= 2 && (
                  <div>
                    {(() => {
                      const recent = viewByDate.slice(-3);
                      const trend = recent[recent.length - 1]?.average - recent[0]?.average;
                      const isPositive = trend > 0;
                      return (
                        <>
                          <p className={`text-2xl font-bold mb-1 font-fredoka flex items-center gap-2 ${isPositive ? 'text-blue-700' : 'text-gray-700'}`}>
                            {isPositive ? <ArrowTrendingUpIcon className="w-6 h-6" /> : trend < 0 ? <ArrowTrendingDownIcon className="w-6 h-6" /> : <ArrowRightIcon className="w-6 h-6" />}
                            {Math.abs(Math.round(trend))}%
                          </p>
                          <p className="text-sm text-gray-600">
                            {isPositive ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'} over last {recent.length} days
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {isPositive ? 'Keep up the great work!' : 'Focus on your weak areas'}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <ChartPieIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 font-fredoka">Question Type Deep Dive</h3>
              </div>
              <div className="space-y-4">
                {viewByType.sort((a,b)=>b.average-a.average).map((type, index) => (
                  <div key={type.type} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                          'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize font-fredoka">{type.type}</h4>
                          <p className="text-xs text-gray-500">{type.count} attempts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 font-fredoka">{type.average}%</p>
                        <p className="text-xs text-gray-500">Average</p>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          type.average >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          type.average >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                          type.average >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          'bg-gradient-to-r from-orange-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min(type.average, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
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
