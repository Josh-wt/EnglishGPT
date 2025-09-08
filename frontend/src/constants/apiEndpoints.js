import { getBackendUrl } from '../utils/backendUrl';

const BACKEND_URL = getBackendUrl();
const API = `${BACKEND_URL}/api`;

export const API_ENDPOINTS = {
  BACKEND_URL,
  API,
  USERS: `/users`,
  EVALUATIONS: `/evaluations`,
  ANALYTICS: `/analytics`,
  FEEDBACK: `/feedback`,
  QUESTION_TYPES: `/question-types`,
  PAYMENTS: `/payments`,
  SUBSCRIPTIONS: `/payments/subscriptions`,
  CUSTOMERS: `/payments/customers`,
  PRODUCTS: `/payments/products`,
  DISCOUNTS: `/payments/discounts`,
  LICENSES: `/payments/licenses`,
  WEBHOOKS: `/payments/webhooks`
};

export default API_ENDPOINTS;
