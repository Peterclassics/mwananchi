import { CheckCircle2 } from 'lucide-react';
import { labels, date } from '../../utils/format';
export default function RequestTimeline({ updates }) {
  return (
    <ol className="timeline">
      {updates.map((u) => (
        <li key={u.id}>
          <span className="timeline-dot">
            <CheckCircle2 size={15} />
          </span>
          <div>
            <strong>
              {u.event_type === 'created'
                ? 'Request submitted'
                : u.event_type === 'comment'
                  ? 'Progress update'
                  : `${labels[u.previous_status]} → ${labels[u.new_status]}`}
            </strong>
            <p className="pre-line">{u.note || 'Status updated'}</p>
            <small>
              {u.actor_name} · {date(u.created_at)} EAT
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}
