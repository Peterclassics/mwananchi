import { CheckCircle2, Clock, LoaderCircle } from 'lucide-react';
import { labels } from '../../utils/format';
export default function StatusBadge({ status }) {
  const Icon =
    { pending: Clock, in_progress: LoaderCircle, resolved: CheckCircle2 }[
      status
    ] || Clock;
  return (
    <span className={`status ${status}`}>
      <Icon size={13} />
      {labels[status] || status}
    </span>
  );
}
