import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'citizen', full_name: 'Navigation Test Citizen' },
    logout: vi.fn(),
  }),
}));
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  // jsdom does not implement modal dialog methods; browser checks cover native focus/inert behaviour.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
  delete HTMLDialogElement.prototype.showModal;
  delete HTMLDialogElement.prototype.close;
});
function renderLayout() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<h1>Dashboard</h1>} />
          <Route path="requests" element={<h1>My service requests</h1>} />
          <Route path="guide" element={<h1>Service guide</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}
describe('Mobile sidebar navigation', () => {
  it('wraps keyboard focus between the first and last menu controls', () => {
    renderLayout();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );
    const dialog = screen.getByRole('dialog');
    const first = within(dialog).getByRole('link', { name: /Mwa\s*nanchi/ });
    const last = within(dialog).getByRole('link', { name: /How it works/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();
  });
  it('starts closed and opens from the menu button with scroll locked', () => {
    renderLayout();
    const button = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('dialog', { name: 'Navigation menu' }),
    ).toBeVisible();
    expect(document.body.style.overflow).toBe('hidden');
  });
  it('closes from its close button and restores scrolling', () => {
    renderLayout();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
  it('navigates and closes when selecting a link', () => {
    renderLayout();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('link', {
        name: /My requests/,
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'My service requests' }),
    ).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('closes for Escape cancellation and backdrop clicks', () => {
    renderLayout();
    const button = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(button);
    fireEvent(
      screen.getByRole('dialog'),
      new Event('cancel', { bubbles: false, cancelable: true }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('also closes when selecting the quick guide', () => {
    renderLayout();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('link', {
        name: /How it works/,
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Service guide' }),
    ).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
