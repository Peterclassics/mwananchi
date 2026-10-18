import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { date } from '../../utils/format';
import EmptyState from '../ui/EmptyState';
import StatusBadge from './StatusBadge';
export default function RequestTable({ requests, admin = false }) {
  if (!requests?.length) return <EmptyState />;
  return (
    <div className="table-responsive">
      <table className="table request-table align-middle">
        <thead>
          <tr>
            <th>Reference & category</th>
            {admin && <th>Citizen</th>}
            <th>Location</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>
              <span className="visually-hidden">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>
                <Link
                  className="reference"
                  to={`${admin ? '/admin' : ''}/requests/${r.id}`}
                >
                  {r.reference_number}
                </Link>
                <small>{r.category_name}</small>
              </td>
              {admin && <td>{r.citizen_name}</td>}
              <td>
                {r.town_or_area}
                <small>{r.county} County</small>
              </td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td className="date-cell">{date(r.created_at)}</td>
              <td>
                <Link
                  className="details-link"
                  aria-label={`View ${r.reference_number}`}
                  to={`${admin ? '/admin' : ''}/requests/${r.id}`}
                >
                  <ArrowRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
