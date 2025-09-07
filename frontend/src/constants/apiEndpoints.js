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
};

export default API_ENDPOINTS;
