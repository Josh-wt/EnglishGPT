import { useQuery } from '@tanstack/react-query';
import { listFeedback } from '../../lib/sb/feedback';

export const useFeedback = (params) => {
  return useQuery({
    queryKey: ['admin-feedback', params],
    queryFn: () => listFeedback(params),
    keepPreviousData: true,
  });
};


