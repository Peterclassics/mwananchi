import { Suspense } from 'react';
import AppRoutes from './routes/AppRoutes';
import LoadingState from './components/ui/LoadingState';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense fallback={<LoadingState />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}
