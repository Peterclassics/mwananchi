import { useState } from 'react';
import { api, message } from '../services/api';

export function useRequestActions(request, onUpdated) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function save(note, status) {
    if (busy) return false;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      if (status)
        await api.patch(`/admin/requests/${request.id}/status`, {
          status,
          version: request.version,
          note,
        });
      else await api.post(`/admin/requests/${request.id}/updates`, { note });
      setSuccess(
        status ? 'Status updated successfully.' : 'Progress update published.',
      );
      onUpdated();
      return true;
    } catch (error) {
      setError(message(error));
      if (error.response?.status === 409) onUpdated();
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { save, busy, error, success };
}
