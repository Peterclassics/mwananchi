import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequestForm from './RequestForm';
vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({
    data: [{ id: 1, name: 'Water supply' }],
    loading: false,
    error: '',
  }),
}));
afterEach(cleanup);
describe('Request form upload feedback', () => {
  it('shows inline errors and focuses the first invalid input on submission', () => {
    render(
      <MemoryRouter>
        <RequestForm />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/County/), {
      target: { value: '  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));
    expect(
      screen.getByText('Choose an available service category.'),
    ).toBeVisible();
    expect(screen.getByLabelText(/Service category/)).toHaveFocus();
    expect(screen.getByLabelText(/County/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(
      screen.getByText('Describe the issue in at least 20 characters.'),
    ).toBeVisible();
  });
  it('validates trimmed descriptions on blur and displays the character count', () => {
    render(
      <MemoryRouter>
        <RequestForm />
      </MemoryRouter>,
    );
    const input = screen.getByLabelText(/What’s happening/);
    fireEvent.change(input, { target: { value: '   too short   ' } });
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('9 / 2,000 characters')).toBeVisible();
    fireEvent.change(input, {
      target: { value: 'A broken water pipe has been leaking for two days.' },
    });
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
  it('rejects an unsupported file before submission', () => {
    render(
      <MemoryRouter>
        <RequestForm />
      </MemoryRouter>,
    );
    const input = screen.getByLabelText(/Choose a photo/);
    fireEvent.change(input, {
      target: {
        files: [new File(['text'], 'report.txt', { type: 'text/plain' })],
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose a JPEG, PNG or WebP image up to 5 MB.',
    );
  });
  it('labels required location fields and explains description limits', () => {
    render(
      <MemoryRouter>
        <RequestForm />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/County/)).toBeRequired();
    expect(screen.getByLabelText(/Town or area/)).toBeRequired();
    expect(screen.getByLabelText(/What’s happening/)).toHaveAttribute(
      'minlength',
      '20',
    );
  });
});
