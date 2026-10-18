export const labels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};
export const date = (value) =>
  value
    ? new Intl.DateTimeFormat('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Nairobi',
      }).format(new Date(value))
    : '—';
