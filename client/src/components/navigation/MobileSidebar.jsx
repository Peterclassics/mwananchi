import { useEffect, useRef } from 'react';
import Sidebar from '../../layouts/Sidebar';

export default function MobileSidebar({ open, onClose, admin }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) {
      element.showModal();
      element.querySelector('button')?.focus();
    }
    if (!open && element.open) element.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      id="mobile-navigation"
      className="mobile-navigation"
      aria-label="Navigation menu"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = dialog.current.querySelectorAll(
          'a[href],button:not(:disabled)',
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <Sidebar admin={admin} mobile onNavigate={onClose} onClose={onClose} />
    </dialog>
  );
}
