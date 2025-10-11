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
      const { page = 1, pageSize = 25, search = '', sortBy = 'timestamp', sortDir = 'desc', include = 'basic' } = params;
      const offset = (page - 1) * pageSize;
      
      const url = `${getApiUrl()}/admin/dashboard/evaluations?limit=${pageSize}&offset=${offset}&search=${encodeURIComponent(search)}&sort_by=${encodeURIComponent(sortBy)}&sort_dir=${encodeURIComponent(sortDir)}&include=${encodeURIComponent(include)}`;
      const response = await fetch(url, { headers: getAdminHeaders() });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const payload = await response.json();
      return {
        data: payload.data,
        count: payload.count,
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