export function apiErrorMessage(error) {
  const serverMessage = error.response?.data?.message;
  if (typeof serverMessage === 'string' && serverMessage.trim())
    return serverMessage;

  const status = error.response?.status;
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403)
    return 'This request was denied. Refresh the page and try again.';
  if (status === 429)
    return 'Too many requests. Please wait before trying again.';
  if (status >= 500)
    return `The server is temporarily unavailable (HTTP ${status}). Please try again shortly.`;
  if (status)
    return `The request failed (HTTP ${status}). Please refresh and try again.`;
  if (['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)) {
    if (['post', 'put', 'patch', 'delete'].includes(error.config?.method))
      return 'The server took too long to respond. Check whether your changes were saved before submitting again.';
    return 'The server took too long to respond. Please try again shortly.';
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false)
    return 'You appear to be offline. Check your internet connection and try again.';
  return 'Unable to reach the service. Check your connection and try again. If this continues, the server may be unavailable.';
}
