import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api, message } from '../../services/api';
import DataState from '../../components/ui/DataState';
import RequestTable from '../../components/requests/RequestTable';
import Pagination from '../../components/ui/Pagination';
import ErrorAlert from '../../components/ui/ErrorAlert';
import FilterBar from '../../components/requests/FilterBar';
export default function RequestsScreen({ admin = false }) {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(params);
  const query = params.toString();
  const { data, pagination, loading, error } = useApi(
      `${admin ? '/admin' : ''}/requests?${query}`,
    ),
    categories = useApi('/categories');
  const [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState('');
  function setFilters(value) {
    setParams(
      Object.fromEntries(Object.entries(value).filter(([, v]) => v !== '')),
      { replace: true },
    );
  }
  async function download() {
    setExporting(true);
    setExportError('');
    try {
      const r = await api.get(`/admin/requests/export?${query}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(r.data),
        a = document.createElement('a');
      a.href = url;
      a.download = 'mwananchi-requests.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(message(e));
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      <div className="breadcrumb-label">
        WORKSPACE <span>/</span> REQUESTS
      </div>
      <div className="page-heading">
        <div>
          <h1>{admin ? 'Manage requests' : 'My requests'}</h1>
          <p>
            {admin
              ? 'Turn community reports into meaningful progress.'
              : 'Every report, every update, every step forward.'}
          </p>
        </div>
        {admin ? (
          <button
            className="btn btn-outline-secondary"
            disabled={exporting}
            onClick={download}
          >
            <Download size={17} />
            {exporting ? 'Exporting…' : 'Export filtered CSV'}
          </button>
        ) : (
          <Link className="btn btn-primary" to="/submit">
            <Plus size={18} />
            Submit request
          </Link>
        )}
      </div>
      <ErrorAlert message={exportError || categories.error} />
      <section className="panel">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          categories={categories.data}
          admin={admin}
        />
        <DataState loading={loading} error={error}>
          <RequestTable requests={data} admin={admin} />
          <Pagination
            meta={pagination}
            onPage={(page) => setFilters({ ...filters, page })}
          />
        </DataState>
      </section>
    </>
  );
}
