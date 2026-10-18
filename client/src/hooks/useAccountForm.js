import { useState } from 'react';
import { api, message } from '../services/api';
export function useAccountForm(validate) {
  const [fields, setFields] = useState({}),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(event, { method, url, onSaved }) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const errors = validate(values);
    setFields(errors);
    setError('');
    setSuccess('');
    if (Object.keys(errors).length) {
      form.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }
    setBusy(true);
    try {
      const response = await api[method](url, values);
      onSaved?.(response.data.data, form);
      setSuccess(response.data.message);
    } catch (error) {
      setError(message(error));
      setFields(error.response?.data?.fields || {});
    } finally {
      setBusy(false);
    }
  }
  return { fields, error, success, busy, submit };
}
