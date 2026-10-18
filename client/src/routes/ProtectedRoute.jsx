import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/ui/LoadingState';
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== user.role)
    return <Navigate to="/access-denied" replace />;
  return <Outlet />;
}
