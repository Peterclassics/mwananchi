import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import StatusBadge from '../requests/StatusBadge';
import Pagination from './Pagination';
import RequestTimeline from '../requests/RequestTimeline';
afterEach(cleanup);
describe('Citizen tracking components', () => {
  it('uses text as well as colour for statuses', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeVisible();
  });
  it('disables previous on the first page and navigates next', () => {
    const onPage = vi.fn();
    render(
      <Pagination
        meta={{ page: 1, total: 21, total_pages: 3 }}
        onPage={onPage}
      />,
    );
    expect(screen.getByText('Previous')).toBeDisabled();
    fireEvent.click(screen.getByText('Next'));
    expect(onPage).toHaveBeenCalledWith(2);
  });
  it('renders citizen input as text', () => {
    render(
      <RequestTimeline
        updates={[
          {
            id: 1,
            event_type: 'comment',
            note: '<script>alert(1)</script>',
            actor_name: 'Admin',
            created_at: '2026-01-01T00:00:00Z',
          },
        ]}
      />,
    );
    expect(screen.getByText('<script>alert(1)</script>')).toBeVisible();
    expect(document.querySelector('script')).toBeNull();
  });
});
