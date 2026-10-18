import { useParams, useLocation, Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import DataState from '../../components/ui/DataState';
import PageHeading from '../../components/ui/PageHeading';
import StatusBadge from '../../components/requests/StatusBadge';
import RequestTimeline from '../../components/requests/RequestTimeline';
import RequestSummary from '../../components/requests/RequestSummary';
import CitizenContactCard from '../../components/requests/CitizenContactCard';
import AdminRequestActions from '../../components/requests/AdminRequestActions';
export default function RequestDetailsScreen({ admin = false }) {
  const { id } = useParams();
  const location = useLocation();
  const {
    data: request,
    loading,
    error,
    reload,
  } = useApi(`${admin ? '/admin' : ''}/requests/${id}`);
  return (
    <>
      <Link className="back-link" to={admin ? '/admin/requests' : '/requests'}>
        <ArrowLeft size={15} />
        Back to requests
      </Link>
      {location.state?.success && (
        <div className="alert alert-success" role="status">
          {location.state.success}
        </div>
      )}
      <DataState loading={loading && !request} error={error}>
        {request && (
          <>
            <PageHeading
              title={request.reference_number}
              description={request.category_name}
            >
              <div className="d-flex gap-3 align-items-center">
                <StatusBadge status={request.status} />
                <button
                  className="btn btn-outline-secondary no-print"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  Print summary
                </button>
              </div>
            </PageHeading>
            <div className="detail-grid">
              <div>
                <RequestSummary request={request} />
                <section className="panel form-panel">
                  <h2>Progress timeline</h2>
                  <p className="text-secondary mb-4">
                    Every step, from your first report to resolution.
                  </p>
                  <RequestTimeline updates={request.updates} />
                </section>
              </div>
              <aside>
                {admin ? (
                  <>
                    <CitizenContactCard request={request} />
                    <AdminRequestActions request={request} onUpdated={reload} />
                  </>
                ) : (
                  <section className="panel form-panel">
                    <span className="eyebrow">YOU’RE IN THE LOOP</span>
                    <h2 className="mt-3">Your report has a home.</h2>
                    <p>
                      Keep this reference number handy. Progress notes and
                      status changes will appear on this page.
                    </p>
                    <p className="text-secondary small">
                      This demonstration does not contact public authorities.
                      For emergencies, use the appropriate official channels.
                    </p>
                  </section>
                )}
              </aside>
            </div>
          </>
        )}
      </DataState>
    </>
  );
}
