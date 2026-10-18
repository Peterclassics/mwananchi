import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 20000,
});
let csrf;
api.interceptors.request.use(async (config) => {
  if (!['get', 'head', 'options'].includes(config.method)) {
    if (!csrf) csrf = (await api.get('/auth/csrf')).data.data.csrfToken;
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/'))
      window.dispatchEvent(new Event('session-expired'));
    if (error.response?.status === 403) csrf = null;
    return Promise.reject(error);
  },
);
export const message = (error) =>
  error.response?.data?.message ||
  'Unable to connect. Check your connection and try again.';
