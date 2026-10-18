import LoadingState from './LoadingState';
import ErrorAlert from './ErrorAlert';
export default function DataState({ loading, error, children }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorAlert message={error} />;
  return children;
}
