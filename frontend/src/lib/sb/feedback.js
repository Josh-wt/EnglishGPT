import { getApiUrl } from '../../utils/backendUrl';

const getAdminHeaders = () => {
  const sessionToken = localStorage.getItem('admin_session_token');
  return {
    'X-Admin-Session': sessionToken,
    'Content-Type': 'application/json',
  };
};

export async function listFeedback({
  page = 1,
  pageSize = 25,
  search = '',
  category = '',
  accurate = '',
  userId = '',
  evaluationId = '',
  fromDate = '',
  toDate = '',
  sortBy = 'created_at',
  sortDir = 'desc',
} = {}) {
  console.log('=== FEEDBACK SERVICE DEBUG ===');
  console.log('listFeedback called with:', { page, pageSize, search, category, accurate, userId, evaluationId, fromDate, toDate, sortBy, sortDir });
  
  const offset = (page - 1) * pageSize;
  
  const params = new URLSearchParams({
    limit: pageSize.toString(),
    offset: offset.toString(),
    search,
    category,
    accurate,
    user_id: userId,
    evaluation_id: evaluationId,
    date_from: fromDate,
    date_to: toDate,
    sort_by: sortBy,
    sort_dir: sortDir,
  });

  // Remove empty parameters
  for (const [key, value] of [...params]) {
    if (!value) {
      params.delete(key);
    }
  }

  const url = `${getApiUrl()}/admin/dashboard/feedback?${params.toString()}`;
  console.log('Feedback API URL:', url);
  console.log('Feedback headers:', getAdminHeaders());
  
  const response = await fetch(url, { headers: getAdminHeaders() });
  console.log('Feedback response status:', response.status);
  console.log('Feedback response ok:', response.ok);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Feedback API error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  console.log('Feedback API result:', result);
  return result;
}


