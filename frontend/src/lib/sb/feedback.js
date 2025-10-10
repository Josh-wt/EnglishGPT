import { supabase } from '../../supabaseClient';

const baseSelect = `id, evaluation_id, user_id, category, accurate, comments, created_at`;

export async function listFeedback({
  page = 1,
  pageSize = 25,
  search = '',
  category,
  accurate,
  userId,
  evaluationId,
  fromDate,
  toDate,
  sortBy = 'created_at',
  sortDir = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('assessment_feedback')
    .select(baseSelect + ', user:assessment_users(uid, display_name), evaluation:assessment_evaluations(short_id)', { count: 'exact' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, to);

  if (search) query = query.ilike('comments', `%${search}%`);
  if (category) query = query.eq('category', category);
  if (accurate != null) query = query.eq('accurate', accurate);
  if (userId) query = query.eq('user_id', userId);
  if (evaluationId) query = query.eq('evaluation_id', evaluationId);
  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}


