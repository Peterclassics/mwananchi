import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';
import { apiErrorMessage } from './apiErrors';
export const api = axios.create({
  baseURL: getApiBaseUrl(import.meta.env),
  withCredentials: true,
  timeout: 20000,
});
let csrf;
let csrfRequest;
api.interceptors.request.use(async (config) => {
  if (!['get', 'head', 'options'].includes(config.method)) {
    config.timeout = 60000;
    if (!csrf) {
      // Concurrent writes must share one token fetch so the cookie cannot race.
      if (!csrfRequest)
        csrfRequest = api
          .get('/auth/csrf')
          .then((response) => {
            csrf = response.data.data.csrfToken;
            return csrf;
          })
          .finally(() => {
            csrfRequest = null;
          });
      await csrfRequest;
    }
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/')
    )
      window.dispatchEvent(new Event('session-expired'));
    if (error.response?.status === 403) csrf = null;
    return Promise.reject(error);
  },
);
export const message = apiErrorMessage;
