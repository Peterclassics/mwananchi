import { User } from 'lucide-react';
export default function CitizenContactCard({ request }) {
  return (
    <section className="panel form-panel">
      <h2>
        <User size={18} />
        Reporting citizen
      </h2>
      <strong>{request.citizen_name}</strong>
      <p className="mt-2 mb-1">
        <a href={`mailto:${request.citizen_email}`}>{request.citizen_email}</a>
      </p>
      <p>{request.citizen_phone || 'No phone number provided'}</p>
    </section>
  );
}
