import { supabase } from '../../supabaseClient';

const baseSelect = `uid, display_name, email, phone, academic_level, question_marked, credits, current_user, dark_mode, subscription_status, updated_at, created_at`;

export async function listUsers({
  page = 1,
  pageSize = 25,
  search = '',
  academicLevel,
  subscriptionStatus,
  minCredits,
  maxCredits,
  minQuestions,
  maxQuestions,
  fromDate,
  toDate,
  sortBy = 'created_at',
  sortDir = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('assessment_users')
    .select(baseSelect, { count: 'exact' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, to);

  if (search) {
    query = query.or(
      `display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }
  if (academicLevel) query = query.eq('academic_level', academicLevel);
  if (subscriptionStatus) query = query.eq('subscription_status', subscriptionStatus);
  if (minCredits != null) query = query.gte('credits', minCredits);
  if (maxCredits != null) query = query.lte('credits', maxCredits);
  if (minQuestions != null) query = query.gte('question_marked', minQuestions);
  if (maxQuestions != null) query = query.lte('question_marked', maxQuestions);
  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getUserWithRelations(userId) {
  const { data, error } = await supabase
    .from('assessment_users')
    .select(`
      ${baseSelect},
      evaluations:assessment_evaluations(*),
      feedback:assessment_feedback(*)
    `)
    .eq('uid', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function usersMetrics() {
  const totalUsers = await supabase.from('assessment_users').select('uid', { count: 'exact', head: true });
  const byStatus = await supabase.from('assessment_users').select('subscription_status', { count: 'exact' }).group('subscription_status');
  return { totalUsers: totalUsers.count || 0, byStatus: byStatus.data || [] };
}


