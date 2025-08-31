import { getBackendUrl } from '../utils/backendUrl';

const BACKEND_URL = getBackendUrl();
const API = `${BACKEND_URL}/api`;

export const API_ENDPOINTS = {
  BACKEND_URL,
  API,
  USERS: `${API}/users`,
  EVALUATIONS: `${API}/evaluations`,
  ANALYTICS: `${API}/analytics`,
  TRANSACTIONS: `${API}/transactions`,
  SUBSCRIPTIONS: `${API}/subscriptions`,
  WEBHOOKS: `${API}/webhooks`,
  FEEDBACK: `${API}/feedback`,
  QUESTION_TYPES: `${API}/question-types`,
};

export default API_ENDPOINTS;
