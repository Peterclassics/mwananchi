import { Inbox } from 'lucide-react';
export default function EmptyState() {
  return (
    <div className="empty">
      <Inbox size={38} />
      <h3>No requests here yet</h3>
      <p>
        New requests and updates will appear here. Try adjusting your filters.
      </p>
    </div>
  );
}
