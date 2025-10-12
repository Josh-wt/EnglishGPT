import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../utils/backendUrl';

const getAdminHeaders = () => {
  const sessionToken = localStorage.getItem('admin_session_token');
  return {
    'X-Admin-Session': sessionToken,
    'Content-Type': 'application/json',
  };
};

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const { page = 1, pageSize = 25, search = '', sortBy = 'created_at', sortDir = 'desc', subscription = '', academic_level = '', min_credits, max_credits, created_from = '', created_to = '' } = params;
      const offset = (page - 1) * pageSize;
      
      const url = `${getApiUrl()}/admin/dashboard/users?limit=${pageSize}&offset=${offset}&search=${encodeURIComponent(search)}&sort_by=${encodeURIComponent(sortBy)}&sort_dir=${encodeURIComponent(sortDir)}&subscription=${encodeURIComponent(subscription)}&academic_level=${encodeURIComponent(academic_level)}&min_credits=${min_credits ?? ''}&max_credits=${max_credits ?? ''}&created_from=${encodeURIComponent(created_from)}&created_to=${encodeURIComponent(created_to)}`;
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

export const useUserDetail = (userId) => {
  console.log('=== USER DETAIL HOOK DEBUG ===');
  console.log('useUserDetail called with userId:', userId);
  
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      console.log('UserDetail queryFn executing for userId:', userId);
      if (!userId) return null;
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const url = `${getApiUrl()}/admin/dashboard/users/${userId}`;
        console.log('UserDetail API URL:', url);
        console.log('UserDetail headers:', getAdminHeaders());
        
        const response = await fetch(url, { 
          headers: getAdminHeaders(),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('UserDetail response status:', response.status);
        console.log('UserDetail response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('UserDetail API error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('UserDetail API result:', result);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('UserDetail query error:', error);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. This user may have too many evaluations.');
        }
        throw error;
      }
    },
    enabled: !!userId,
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onSuccess: (data) => {
      console.log('UserDetail query success:', data);
    },
    onError: (error) => {
      console.error('UserDetail query error:', error);
    }
  });
};


