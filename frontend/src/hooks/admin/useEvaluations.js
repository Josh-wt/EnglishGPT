import { useQuery } from '@tanstack/react-query';
import { listEvaluations, getEvaluationWithRelations } from '../../lib/sb/evaluations';

export const useEvaluations = (params) => {
  return useQuery({
    queryKey: ['admin-evaluations', params],
    queryFn: () => listEvaluations(params),
    keepPreviousData: true,
  });
};

export const useEvaluationDetail = (id) => {
  return useQuery({
    queryKey: ['admin-evaluation', id],
    queryFn: () => getEvaluationWithRelations(id),
    enabled: !!id,
  });
};


