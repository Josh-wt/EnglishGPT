import { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/backendUrl';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [evaluationsTrend, setEvaluationsTrend] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [questionTypeStats, setQuestionTypeStats] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAdminHeaders = () => {
    const sessionToken = localStorage.getItem('admin_session_token');
    return {
      'X-Admin-Session': sessionToken,
      'Content-Type': 'application/json',
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAdminHeaders();
      const baseUrl = getApiUrl();

      // Fetch all dashboard data in parallel
      const [
        statsResponse,
        trendResponse,
        gradeResponse,
        questionResponse,
        subscriptionResponse,
        activityResponse,
        usersResponse,
        evaluationsResponse
      ] = await Promise.all([
        fetch(`${baseUrl}/admin/dashboard/stats`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/evaluations-trend`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/grade-distribution`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/question-types`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/subscription-stats`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/recent-activity`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/users?limit=50`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/evaluations?limit=50`, { headers })
      ]);

      // Check if any request failed
      const responses = [
        statsResponse, trendResponse, gradeResponse, questionResponse,
        subscriptionResponse, activityResponse, usersResponse, evaluationsResponse
      ];

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Parse all responses
      const [
        statsData,
        trendData,
        gradeData,
        questionData,
        subscriptionData,
        activityData,
        usersData,
        evaluationsData
      ] = await Promise.all([
        statsResponse.json(),
        trendResponse.json(),
        gradeResponse.json(),
        questionResponse.json(),
        subscriptionResponse.json(),
        activityResponse.json(),
        usersResponse.json(),
        evaluationsResponse.json()
      ]);

      // Set all data
      setStats(statsData);
      setEvaluationsTrend(trendData);
      setGradeDistribution(gradeData);
      setQuestionTypeStats(questionData);
      setSubscriptionStats(subscriptionData);
      setRecentActivity(activityData);
      setUsers(usersData);
      setEvaluations(evaluationsData);

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    stats,
    evaluationsTrend,
    gradeDistribution,
    questionTypeStats,
    subscriptionStats,
    recentActivity,
    users,
    evaluations,
    loading,
    error,
    refreshData
  };
};
