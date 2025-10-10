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
      const { page = 1, pageSize = 25, search = '' } = params;
      const offset = (page - 1) * pageSize;
      
      const response = await fetch(
        `${getApiUrl()}/admin/dashboard/users?limit=${pageSize}&offset=${offset}`,
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
        filteredData = data.filter(user => 
          user.display_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
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

export const useUserDetail = (userId) => {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const response = await fetch(
        `${getApiUrl()}/users/${userId}`,
        { headers: getAdminHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!userId,
  });
};


