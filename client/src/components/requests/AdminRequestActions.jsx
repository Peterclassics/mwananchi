import { useState } from 'react';
import { useRequestActions } from '../../hooks/useRequestActions';
import { labels } from '../../utils/format';
import ErrorAlert from '../ui/ErrorAlert';
import ConfirmationDialog from '../ui/ConfirmationDialog';
export default function AdminRequestActions({ request, onUpdated }) {
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(false);
  const { save, busy, error, success } = useRequestActions(request, onUpdated);
  const nextStatus = request.status === 'pending' ? 'in_progress' : 'resolved';
  async function submit(status) {
    const saved = await save(note, status);
    if (saved) setNote('');
    setConfirm(false);
  }
  return (
    <section className="panel form-panel no-print">
      <h2>Manage progress</h2>
      <p className="text-secondary">
        Updates are visible to the reporting citizen.
      </p>
      <ErrorAlert message={error} />
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}
      <label className="form-label" htmlFor="note">
        Public note{' '}
        {request.status === 'in_progress' ? '(required to resolve)' : ''}
      </label>
      <textarea
        id="note"
        className="form-control mb-3"
        rows={5}
        maxLength={2000}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <button
        className="btn btn-outline-secondary w-100 mb-3"
        disabled={busy || note.trim().length < 5}
        onClick={() => submit()}
      >
        Publish progress update
      </button>
      {request.status !== 'resolved' && (
        <button
          className="btn btn-primary w-100"
          disabled={
            busy || (nextStatus === 'resolved' && note.trim().length < 5)
          }
          onClick={() => setConfirm(true)}
        >
          Mark as {labels[nextStatus]}
        </button>
      )}
      <ConfirmationDialog
        open={confirm}
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => submit(nextStatus)}
      />
    </section>
  );
}
