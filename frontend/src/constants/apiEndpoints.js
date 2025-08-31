import { getBackendUrl } from '../utils/backendUrl';

const BACKEND_URL = getBackendUrl();
const API = `${BACKEND_URL}/api`;

export const API_ENDPOINTS = {
  BACKEND_URL,
  API,
  USERS: `/api/users`,
  EVALUATIONS: `/api/evaluations`,
  ANALYTICS: `/api/analytics`,
  TRANSACTIONS: `/api/transactions`,
  SUBSCRIPTIONS: `/api/subscriptions`,
  WEBHOOKS: `/api/webhooks`,
  FEEDBACK: `/api/feedback`,
  QUESTION_TYPES: `/api/question-types`,
};

export default API_ENDPOINTS;
