import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../../utils/backendUrl';

export const useAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAdminHeaders = () => {
    const sessionToken = localStorage.getItem('admin_session_token');
    return {
      'X-Admin-Session': sessionToken,
      'Content-Type': 'application/json',
    };
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const headers = getAdminHeaders();
      const baseUrl = getApiUrl();

      const [
        statsResponse,
        trendResponse,
        gradeResponse,
        questionResponse,
        subscriptionResponse,
        activityResponse,
      ] = await Promise.all([
        fetch(`${baseUrl}/admin/dashboard/stats`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/evaluations-trend`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/grade-distribution`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/question-types`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/subscription-stats`, { headers }),
        fetch(`${baseUrl}/admin/dashboard/recent-activity`, { headers }),
      ]);

      const responses = [statsResponse, trendResponse, gradeResponse, questionResponse, subscriptionResponse, activityResponse];
      for (const r of responses) {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      }

      const [stats, evaluationsTrend, gradeDistribution, questionTypeStats, subscriptionStats, recentActivity] = await Promise.all([
        statsResponse.json(),
        trendResponse.json(),
        gradeResponse.json(),
        questionResponse.json(),
        subscriptionResponse.json(),
        activityResponse.json(),
      ]);

      setData({
        ...stats,
        evaluationsTrend,
        gradeDistribution,
        questionTypeStats,
        subscriptionStats,
        recentActivity,
      });
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { data, isLoading, error, refetch: fetchDashboardData };
};
