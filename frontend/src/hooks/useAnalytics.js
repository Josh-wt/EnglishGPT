import { useState, useCallback } from 'react';
import { 
  getUserAnalytics, 
  getPerformanceTrends, 
  getGradeDistribution, 
  getQuestionTypePerformance,
  getSubmarkAnalysis,
  getAIRecommendations,
  getWeeklyPerformance,
  getImprovementMetrics
} from '../services/analytics';

/**
 * Custom hook for analytics management
 * @returns {Object} - Analytics state and functions
 */
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [gradeDistribution, setGradeDistribution] = useState(null);
  const [questionTypePerformance, setQuestionTypePerformance] = useState(null);
  const [submarkAnalysis, setSubmarkAnalysis] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [weeklyPerformance, setWeeklyPerformance] = useState(null);
  const [improvementMetrics, setImprovementMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user analytics
   * @param {string} userId - The user ID
   * @param {Object} filters - Optional filters
   */
  const fetchAnalytics = useCallback(async (userId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserAnalytics(userId, filters);
      setAnalytics(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch performance trends
   * @param {string} userId - The user ID
   * @param {string} timeRange - Time range filter
   */
  const fetchTrends = useCallback(async (userId, timeRange = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getPerformanceTrends(userId, timeRange);
      setTrends(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch grade distribution
   * @param {string} userId - The user ID
   */
  const fetchGradeDistribution = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getGradeDistribution(userId);
      setGradeDistribution(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching grade distribution:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch question type performance
   * @param {string} userId - The user ID
   */
  const fetchQuestionTypePerformance = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getQuestionTypePerformance(userId);
      setQuestionTypePerformance(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching question type performance:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch submark analysis
   * @param {string} userId - The user ID
   */
  const fetchSubmarkAnalysis = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getSubmarkAnalysis(userId);
      setSubmarkAnalysis(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching submark analysis:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch AI recommendations
   * @param {string} userId - The user ID
   */
  const fetchAIRecommendations = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAIRecommendations(userId);
      setAiRecommendations(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch weekly performance
   * @param {string} userId - The user ID
   * @param {number} weeks - Number of weeks to fetch
   */
  const fetchWeeklyPerformance = useCallback(async (userId, weeks = 12) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getWeeklyPerformance(userId, weeks);
      setWeeklyPerformance(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching weekly performance:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch improvement metrics
   * @param {string} userId - The user ID
   */
  const fetchImprovementMetrics = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getImprovementMetrics(userId);
      setImprovementMetrics(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching improvement metrics:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all analytics data
   * @param {string} userId - The user ID
   * @param {Object} filters - Optional filters
   */
  const fetchAllAnalytics = useCallback(async (userId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load critical data first
      const [analyticsData, trendsData] = await Promise.all([
        getUserAnalytics(userId, filters),
        getPerformanceTrends(userId, filters.timeRange || 'month'),
      ]);
      
      // Load secondary data
      const [gradeData, questionTypeData] = await Promise.all([
        getGradeDistribution(userId),
        getQuestionTypePerformance(userId),
      ]);
      
      // Load remaining data
      const [submarkData, recommendationsData, weeklyData, improvementData] = await Promise.all([
        getSubmarkAnalysis(userId),
        getAIRecommendations(userId),
        getWeeklyPerformance(userId, 12),
        getImprovementMetrics(userId),
      ]);
      
      setAnalytics(analyticsData);
      setTrends(trendsData);
      setGradeDistribution(gradeData);
      setQuestionTypePerformance(questionTypeData);
      setSubmarkAnalysis(submarkData);
      setAiRecommendations(recommendationsData);
      setWeeklyPerformance(weeklyData);
      setImprovementMetrics(improvementData);
      
      return {
        analytics: analyticsData,
        trends: trendsData,
        gradeDistribution: gradeData,
        questionTypePerformance: questionTypeData,
        submarkAnalysis: submarkData,
        aiRecommendations: recommendationsData,
        weeklyPerformance: weeklyData,
        improvementMetrics: improvementData,
      };
    } catch (err) {
      console.error('Error fetching all analytics:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear all analytics data
   */
  const clearAnalytics = useCallback(() => {
    setAnalytics(null);
    setTrends(null);
    setGradeDistribution(null);
    setQuestionTypePerformance(null);
    setSubmarkAnalysis(null);
    setAiRecommendations(null);
    setWeeklyPerformance(null);
    setImprovementMetrics(null);
    setError(null);
  }, []);

  return {
    analytics,
    trends,
    gradeDistribution,
    questionTypePerformance,
    submarkAnalysis,
    aiRecommendations,
    weeklyPerformance,
    improvementMetrics,
    loading,
    error,
    fetchAnalytics,
    fetchTrends,
    fetchGradeDistribution,
    fetchQuestionTypePerformance,
    fetchSubmarkAnalysis,
    fetchAIRecommendations,
    fetchWeeklyPerformance,
    fetchImprovementMetrics,
    fetchAllAnalytics,
    clearAnalytics,
  };
};
