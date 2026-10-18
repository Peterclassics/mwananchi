import { MapPin, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { date } from '../../utils/format';
export default function RequestSummary({ request }) {
  return (
    <section className="panel form-panel">
      <h2>Request details</h2>
      <p className="description pre-line">{request.description}</p>
      <div className="detail-meta">
        <MapPin size={19} />
        <div>
          <strong>
            {request.town_or_area}, {request.county} County
          </strong>
          <p>{request.location_details}</p>
        </div>
      </div>
      <div className="detail-meta">
        <Calendar size={19} />
        <div>
          <p>Submitted: {date(request.created_at)} EAT</p>
          <p>Last updated: {date(request.updated_at)} EAT</p>
          {request.resolved_at && (
            <p>Resolved: {date(request.resolved_at)} EAT</p>
          )}
        </div>
      </div>
      {request.image_storage_key && (
        <img
          className="request-image"
          alt={`Reported ${request.category_name.toLowerCase()} issue`}
          src={`${api.defaults.baseURL}/requests/${request.id}/image`}
        />
      )}
    </section>
  );
}
