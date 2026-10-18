import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/public/LandingPage';
import GuidePage from '../pages/public/GuidePage';
import ErrorPage from '../pages/public/ErrorPage';
import ProfilePage from '../pages/account/ProfilePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import SubmitRequestPage from '../pages/citizen/SubmitRequestPage';
import CitizenRequestsPage from '../pages/citizen/RequestsPage';
import CitizenRequestDetailsPage from '../pages/citizen/RequestDetailsPage';
import AdminRequestsPage from '../pages/admin/RequestsPage';
import AdminRequestDetailsPage from '../pages/admin/RequestDetailsPage';
const CitizenDashboardPage = lazy(
  () => import('../pages/citizen/DashboardPage'),
);
const AdminDashboardPage = lazy(() => import('../pages/admin/DashboardPage'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route element={<ProtectedRoute role="citizen" />}>
            <Route path="dashboard" element={<CitizenDashboardPage />} />
            <Route path="submit" element={<SubmitRequestPage />} />
            <Route path="requests" element={<CitizenRequestsPage />} />
            <Route
              path="requests/:id"
              element={<CitizenRequestDetailsPage />}
            />
          </Route>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/requests" element={<AdminRequestsPage />} />
            <Route
              path="admin/requests/:id"
              element={<AdminRequestDetailsPage />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="access-denied" element={<ErrorPage denied />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
