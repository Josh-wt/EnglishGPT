import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../utils/backendUrl';

const getAdminHeaders = () => {
  const sessionToken = localStorage.getItem('admin_session_token');
  return {
    'X-Admin-Session': sessionToken,
    'Content-Type': 'application/json',
  };
};

export const useEvaluations = (params = {}) => {
  return useQuery({
    queryKey: ['admin-evaluations', params],
    queryFn: async () => {
      const { page = 1, pageSize = 25, search = '' } = params;
      const offset = (page - 1) * pageSize;
      
      const response = await fetch(
        `${getApiUrl()}/admin/dashboard/evaluations?limit=${pageSize}&offset=${offset}`,
        { headers: getAdminHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter by search if provided
      let filteredData = data;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = data.filter(evaluation => 
          evaluation.short_id?.toLowerCase().includes(searchLower) ||
          evaluation.question_type?.toLowerCase().includes(searchLower) ||
          evaluation.user_id?.toLowerCase().includes(searchLower)
        );
      }
      
      return {
        data: filteredData,
        count: filteredData.length,
        page,
        pageSize
      };
    },
    keepPreviousData: true,
  });
};

export const useEvaluationDetail = (evaluationId) => {
  return useQuery({
    queryKey: ['admin-evaluation', evaluationId],
    queryFn: async () => {
      if (!evaluationId) return null;
      
      const response = await fetch(
        `${getApiUrl()}/evaluations/${evaluationId}/admin`,
        { headers: getAdminHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!evaluationId,
  });
};