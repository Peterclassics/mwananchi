export function getApiBaseUrl(env) {
  // Vite forwards /api to the local Express server during development.
  if (env.DEV) return '/api';

  // A relative URL also supports production deployments with an API proxy.
  const configured = env.VITE_API_BASE_URL?.trim() || '/api';
  return configured.replace(/\/+$/, '');
}
