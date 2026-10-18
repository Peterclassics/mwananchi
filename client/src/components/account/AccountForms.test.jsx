import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import PersonalDetailsForm from './PersonalDetailsForm';
import ChangePasswordForm from './ChangePasswordForm';
const { patch, post, updateUser } = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      full_name: 'Assessment Citizen',
      email: 'citizen@example.com',
      phone: null,
    },
    updateUser,
  }),
}));
vi.mock('../../services/api', () => ({
  api: { patch, post },
  message: () => 'Please check your details.',
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
describe('Personal details and account security forms', () => {
  it('keeps email read-only and updates the shared account after saving', async () => {
    const user = {
      full_name: 'Updated Citizen',
      email: 'citizen@example.com',
      phone: '+254712345678',
    };
    patch.mockResolvedValue({
      data: { data: { user }, message: 'Details saved.' },
    });
    render(<PersonalDetailsForm />);
    expect(screen.getByLabelText('Email address')).toHaveAttribute('readonly');
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: user.full_name },
    });
    fireEvent.change(screen.getByLabelText(/Phone number/), {
      target: { value: user.phone },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith(user));
    expect(patch).toHaveBeenCalledWith('/account/profile', {
      full_name: user.full_name,
      phone: user.phone,
    });
    expect(screen.getByRole('status')).toHaveTextContent('Details saved.');
  });
  it('rejects whitespace-only names and invalid phone numbers without an API call', () => {
    render(<PersonalDetailsForm />);
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: '  ' },
    });
    fireEvent.change(screen.getByLabelText(/Phone number/), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(patch).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Full name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText(/7–15 digits/)).toBeVisible();
  });
  it('requires password confirmation and never sends mismatched passwords', () => {
    render(<ChangePasswordForm />);
    fireEvent.change(
      screen.getByLabelText('Current password', { exact: true }),
      { target: { value: 'current-password' } },
    );
    fireEvent.change(screen.getByLabelText('New password', { exact: true }), {
      target: { value: 'new-password-123' },
    });
    fireEvent.change(
      screen.getByLabelText('Confirm new password', { exact: true }),
      { target: { value: 'different' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(post).not.toHaveBeenCalled();
    expect(screen.getByText('Passwords do not match.')).toBeVisible();
  });
  it('clears password fields after success and shows confirmation', async () => {
    post.mockResolvedValue({
      data: { data: null, message: 'Password changed.' },
    });
    render(<ChangePasswordForm />);
    for (const [label, value] of [
      ['Current password', 'current-password'],
      ['New password', 'new-password-123'],
      ['Confirm new password', 'new-password-123'],
    ])
      fireEvent.change(screen.getByLabelText(label, { exact: true }), {
        target: { value },
      });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Password changed.'),
    );
    expect(
      screen.getByLabelText('Current password', { exact: true }),
    ).toHaveValue('');
  });
});
