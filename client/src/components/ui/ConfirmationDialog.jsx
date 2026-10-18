import { useEffect, useRef } from 'react';
export default function ConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  busy,
}) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="dialog-card"
      role="alertdialog"
      aria-labelledby="confirm-heading"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="confirm-heading">Confirm status change</h2>
      <p>
        This change becomes part of the public request timeline and cannot be
        reversed.
      </p>
      <div className="d-flex gap-2">
        <button
          autoFocus
          className="btn btn-primary"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? 'Saving…' : 'Confirm change'}
        </button>
        <button className="btn btn-light" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}
