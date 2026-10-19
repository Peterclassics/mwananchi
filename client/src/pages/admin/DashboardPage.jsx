import { useApi } from '../../hooks/useApi';
import PageHeading from '../../components/ui/PageHeading';
import DataState from '../../components/ui/DataState';
import RequestStats from '../../components/dashboard/RequestStats';
import RecentRequests from '../../components/dashboard/RecentRequests';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';
import StatusGuide from '../../components/dashboard/StatusGuide';
export default function AdminDashboardPage() {
  const { data, loading, error } = useApi('/admin/analytics');
  return (
    <>
      <PageHeading
        title="Service delivery overview"
        description="A clear view of community needs and the progress you’re making."
      />
      <DataState loading={loading} error={error}>
        {data && (
          <>
            <RequestStats data={data} showOpen />
            <AnalyticsCharts data={data} />
            <RecentRequests requests={data.recent} admin />
            <StatusGuide />
          </>
        )}
      </DataState>
    </>
  );
}
