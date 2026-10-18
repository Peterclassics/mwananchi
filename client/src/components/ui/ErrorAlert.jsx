import { AlertCircle } from 'lucide-react';
export default function ErrorAlert({ message }) {
  return message ? (
    <div className="alert alert-danger d-flex gap-2" role="alert">
      <AlertCircle size={20} />
      <span>{message}</span>
    </div>
  ) : null;
}
