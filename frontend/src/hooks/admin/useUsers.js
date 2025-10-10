import { useQuery } from '@tanstack/react-query';
import { listUsers, getUserWithRelations } from '../../lib/sb/users';

export const useUsers = (params) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => listUsers(params),
    keepPreviousData: true,
  });
};

export const useUserDetail = (userId) => {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => getUserWithRelations(userId),
    enabled: !!userId,
  });
};


