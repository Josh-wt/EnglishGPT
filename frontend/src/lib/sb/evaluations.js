import { supabase } from '../../supabaseClient';

const baseSelect = `id, essay_id, user_id, question_type, student_response, feedback, grade, reading_marks, writing_marks, sol_marks, so2_marks, content_structure_marks, style_accuracy_marks, word_target, strengths, short_id, created_at`;

export async function listEvaluations({
  page = 1,
  pageSize = 25,
  search = '',
  questionTypes,
  minGrade,
  maxGrade,
  markRanges = {},
  fromDate,
  toDate,
  userId,
  hasFeedback,
  sortBy = 'created_at',
  sortDir = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('assessment_evaluations')
    .select(baseSelect + ', user:assessment_users(uid, display_name, email)', { count: 'exact' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, to);

  if (search) {
    // basic ilike fallback; FTS can be done via RPC/view if added
    query = query.or(
      `student_response.ilike.%${search}%,feedback.ilike.%${search}%,strengths.ilike.%${search}%`
    );
  }
  if (questionTypes?.length) query = query.in('question_type', questionTypes);
  if (userId) query = query.eq('user_id', userId);
  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);
  if (hasFeedback != null) query = hasFeedback ? query.not('feedback', 'is', null) : query.is('feedback', null);

  // mark ranges: { reading_marks: [min,max], writing_marks: [min,max], ... }
  Object.entries(markRanges).forEach(([key, [min, max]]) => {
    if (min != null) query = query.gte(key, min);
    if (max != null) query = query.lte(key, max);
  });

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getEvaluationWithRelations(id) {
  const { data, error } = await supabase
    .from('assessment_evaluations')
    .select(`
      ${baseSelect},
      user:assessment_users(uid, display_name, email, academic_level, subscription_status),
      feedback:assessment_feedback(*)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function evaluationsMetrics() {
  const totalEvaluations = await supabase.from('assessment_evaluations').select('id', { count: 'exact', head: true });
  return { totalEvaluations: totalEvaluations.count || 0 };
}


