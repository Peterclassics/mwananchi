import RequestForm from '../../components/requests/RequestForm';
export default function SubmitRequestPage() {
  return (
    <>
      <div className="breadcrumb-label">
        WORKSPACE <span>/</span> NEW REQUEST
      </div>
      <div className="page-heading">
        <div>
          <h1>Let’s make it better.</h1>
          <p>Report a public service issue in your community.</p>
        </div>
        <span className="text-secondary small">Usually takes 2–3 minutes</span>
      </div>
      <RequestForm />
    </>
  );
}
