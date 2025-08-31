import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
  
  // Fetch AI recommendations function
  const fetchRecommendations = async () => {
    if (!hasUnlimitedAccess()) return;
    
    if (!user?.id || evaluations.length === 0) {
      console.log('🚫 Skipping recommendations - no user or evaluations');
      return;
    }
      
      // Check if we should fetch recommendations (1st, 5th, 10th, etc.)
      const evalCount = evaluations.length;
      const shouldFetch = evalCount === 1 || evalCount === 5 || evalCount === 10 || 
                         (evalCount > 10 && evalCount % 5 === 0);
      
    console.log(`📊 Recommendations check - Count: ${evalCount}, Should fetch: ${shouldFetch}, Has AI recs: ${!!aiRecommendations}`);
    
    // Always try to fetch if we don't have recommendations, not just at milestones
    if (!aiRecommendations) {
      console.log('🔄 Fetching AI recommendations...');
        setIsLoadingRecommendations(true);
        try {
          // Get the current session for auth token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
          console.error('❌ No valid session found for recommendations');
            setIsLoadingRecommendations(false);
            return;
          }
          
        // Use the correct API endpoint
        const apiUrl = `${BACKEND_URL}/api/analytics/${user.id}`;
        console.log('🌐 Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            }
          });
        
        console.log('📡 Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
          console.log('📋 Analytics data received:', data);
          
            if (data.analytics?.recommendations) {
            console.log('✅ AI recommendations found:', data.analytics.recommendations.substring(0, 100) + '...');
              setAiRecommendations(data.analytics.recommendations);
          } else {
            console.log('⚠️ No recommendations in response');
            }
        } else {
          const errorText = await response.text();
          console.error('❌ API request failed:', response.status, errorText);
          }
        } catch (error) {
        console.error('❌ Error fetching recommendations:', error);
        } finally {
          setIsLoadingRecommendations(false);
        }
      }
    };
    
  // Fetch AI recommendations when component mounts or evaluations change
  useEffect(() => {
    if (hasUnlimitedAccess() && user?.id && evaluations.length >= 5 && !aiRecommendations) {
    fetchRecommendations();
  }
  }, [user?.id, evaluations.length, hasUnlimitedAccess()]);

  // Enhanced data processing for comprehensive analytics
  const parsedEvaluations = (evaluations || []).map((e) => {
    const scoreMatch = (e.grade || '').match(/(\d+)\s*\/\s*(\d+)/);
    const score = scoreMatch ? Number(scoreMatch[1]) : 0;
    const max = scoreMatch ? Number(scoreMatch[2]) : 0;
    const date = new Date(e.timestamp);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const type = (e.question_type || 'unknown').toLowerCase();
    
    // Extract all possible submarks dynamically
    const submarks = {};
    Object.keys(e).forEach(key => {
      if (key.includes('_marks') || key.includes('marks')) {
        const value = typeof e[key] === 'string' ? Number((e[key].match(/\d+/) || [0])[0]) : 0;
        const cleanKey = key.replace('_marks', '').replace('marks', '');
        if (cleanKey && value > 0) {
          submarks[cleanKey] = value;
        }
      }
    });
    
    return {
      ...e,
      score,
      max,
      percent: max > 0 ? Math.round((score / max) * 100) : 0,
      date,
      dateKey,
      type,
      submarks
    };
  });

  // Filter evaluations by time range
  const filterByTimeRange = (data) => {
    const now = new Date();
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };
    
    const cutoff = ranges[selectedTimeRange];
    return data.filter(item => item.date >= cutoff);
  };

  // Process data for charts
  const viewEvaluations = filterByTimeRange(parsedEvaluations);
  
  // Group by question type
  const byTypeMap = viewEvaluations.reduce((acc, e) => {
    const type = e.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(e);
    return acc;
  }, {});

  // Calculate averages for each component
  const calculateComponentAverage = (componentData) => {
    if (!componentData || componentData.length === 0) return 0;
    const average = componentData.reduce((sum, d) => sum + d.value, 0) / componentData.length;
    return Math.round(average * 10) / 10;
  };

  // Prepare data for charts
  const typeDistribution = Object.entries(byTypeMap).map(([type, evals]) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: evals.length,
    type
  }));

  const totalTypeCount = typeDistribution.reduce((s, x) => s + x.value, 0) || 1;

  // Custom tooltip for charts
  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate performance trends
  const performanceTrend = viewEvaluations
    .sort((a, b) => a.date - b.date)
    .map((e, i) => ({
      name: `Essay ${i + 1}`,
      score: e.percent,
      date: e.dateKey
    }));

  // Calculate daily averages
  const dailyData = viewEvaluations.reduce((acc, e) => {
    if (!acc[e.dateKey]) {
      acc[e.dateKey] = { count: 0, total: 0, evaluations: [] };
    }
    acc[e.dateKey].count++;
    acc[e.dateKey].total += e.percent;
    acc[e.dateKey].evaluations.push(e);
    return acc;
  }, {});

  const dailyAverages = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      average: Math.round(data.total / data.count),
      count: data.count
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate component breakdown
  const componentBreakdown = Object.entries(byTypeMap).map(([type, evals]) => {
    const componentData = evals.flatMap(e => 
      Object.entries(e.submarks).map(([component, value]) => ({
        component,
        value,
        type
      }))
    );
    
    return {
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      components: componentData,
      average: calculateComponentAverage(componentData)
    };
  });

  // Calculate improvement over time
  const recentEvaluations = viewEvaluations.slice(-5);
  const olderEvaluations = viewEvaluations.slice(-10, -5);
  
  const recentAvg = recentEvaluations.length > 0 
    ? recentEvaluations.reduce((sum, e) => sum + e.percent, 0) / recentEvaluations.length 
    : 0;
  const olderAvg = olderEvaluations.length > 0 
    ? olderEvaluations.reduce((sum, e) => sum + e.percent, 0) / olderEvaluations.length 
    : 0;
  
  const improvement = recentAvg - olderAvg;

  return (
    <motion.div 
      className="min-h-screen bg-main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 flex items-center font-fredoka"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            
            <h1 className="text-xl font-bold text-gray-900 font-fredoka">Analytics Dashboard</h1>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Essays</p>
                <p className="text-2xl font-bold text-gray-900">{viewEvaluations.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {viewEvaluations.length > 0 
                    ? Math.round(viewEvaluations.reduce((sum, e) => sum + e.percent, 0) / viewEvaluations.length)
                    : 0}%
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className={`text-2xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvement >= 0 ? '+' : ''}{Math.round(improvement)}%
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Question Types</p>
                <p className="text-2xl font-bold text-gray-900">{typeDistribution.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Question Type Distribution */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        {hasUnlimitedAccess() && (
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
              {isLoadingRecommendations && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                  Loading...
                </div>
              )}
            </div>
            
            {aiRecommendations ? (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{aiRecommendations}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No recommendations available yet</p>
                <p className="text-sm text-gray-400">Complete more essays to get personalized AI recommendations</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Upgrade Prompt for Free Users */}
        {!hasUnlimitedAccess() && (
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Unlock Advanced Analytics</h3>
                <p className="text-purple-100">Get AI-powered recommendations and detailed insights</p>
              </div>
              <button
                onClick={onUpgrade}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
