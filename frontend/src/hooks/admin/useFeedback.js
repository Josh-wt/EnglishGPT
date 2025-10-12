import { useQuery } from '@tanstack/react-query';
import { listFeedback } from '../../lib/sb/feedback';

export const useFeedback = (params) => {
  console.log('=== FEEDBACK HOOK DEBUG ===');
  console.log('useFeedback called with params:', params);
  
  return useQuery({
    queryKey: ['admin-feedback', params],
    queryFn: () => {
      console.log('Feedback queryFn executing with params:', params);
      return listFeedback(params);
    },
    keepPreviousData: true,
    onSuccess: (data) => {
      console.log('Feedback query success:', data);
    },
    onError: (error) => {
      console.error('Feedback query error:', error);
    }
  });
};


