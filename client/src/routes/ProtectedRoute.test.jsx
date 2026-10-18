import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
const { session } = vi.hoisted(() => ({
  session: { user: null, loading: false },
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => session }));
afterEach(cleanup);
function renderRoute() {
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="admin" element={<h1>Administration</h1>} />
        </Route>
        <Route path="login" element={<h1>Sign in</h1>} />
        <Route path="access-denied" element={<h1>Access denied</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}
describe('Protected screen navigation', () => {
  it('redirects anonymous visitors to login', () => {
    session.user = null;
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
  it('prevents a citizen from opening an administrator screen', () => {
    session.user = { role: 'citizen' };
    renderRoute();
    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeVisible();
  });
  it('allows an administrator to open their screen', () => {
    session.user = { role: 'admin' };
    renderRoute();
    expect(
      screen.getByRole('heading', { name: 'Administration' }),
    ).toBeVisible();
  });
});
