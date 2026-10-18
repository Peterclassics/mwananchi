import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RequestTable from '../requests/RequestTable';
export default function RecentRequests({ requests, admin = false }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Recent requests</h2>
          <p>
            {admin
              ? 'The latest reports from your community'
              : 'Your latest reports, all in one place'}
          </p>
        </div>
        <Link to={admin ? '/admin/requests' : '/requests'}>
          View all requests <ArrowRight size={16} />
        </Link>
      </div>
      <RequestTable requests={requests} admin={admin} />
    </section>
  );
}
