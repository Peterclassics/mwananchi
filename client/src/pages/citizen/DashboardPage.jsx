import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import PageHeading from '../../components/ui/PageHeading';
import DataState from '../../components/ui/DataState';
import RequestStats from '../../components/dashboard/RequestStats';
import RecentRequests from '../../components/dashboard/RecentRequests';
import CommunityBanner from '../../components/dashboard/CommunityBanner';
import StatusGuide from '../../components/dashboard/StatusGuide';
export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useApi('/dashboard/citizen');
  return (
    <>
      <PageHeading
        breadcrumb="OVERVIEW"
        title={`Hello, ${user.full_name.split(' ')[0]}. 👋`}
        description="Here’s what’s happening with your service requests."
      >
        <Link className="btn btn-primary" to="/submit">
          <Plus size={18} />
          Submit request
        </Link>
      </PageHeading>
      <DataState loading={loading} error={error}>
        {data && (
          <>
            <RequestStats data={data} />
            <CommunityBanner />
            <RecentRequests requests={data.recent} />
            <StatusGuide />
          </>
        )}
      </DataState>
    </>
  );
}
