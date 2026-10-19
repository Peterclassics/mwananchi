import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequestForm from './RequestForm';
import locations from '../../data/kenya-locations.json';
import { validateRequest } from '../../utils/validation';
vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({
    data: [{ id: 1, name: 'Water supply' }],
    loading: false,
    error: '',
  }),
}));
afterEach(cleanup);
describe('Request form upload feedback', () => {
  it('lists all 47 counties and filters towns when the county changes', () => {
    render(
      <MemoryRouter>
        <RequestForm />
      </MemoryRouter>,
    );
    const county = screen.getByLabelText(/County/);
    const town = screen.getByLabelText(/Town or area/);
    expect(locations).toHaveLength(47);
    expect(new Set(locations.map((entry) => entry.county)).size).toBe(47);
    expect(county.options).toHaveLength(48);
    expect(town).toBeDisabled();
    fireEvent.change(county, { target: { value: 'Nairobi' } });
    expect(town).toBeEnabled();
    expect([...town.options].map((option) => option.value)).toContain(
      'Kilimani',
    );
    expect([...town.options].map((option) => option.value)).not.toContain(
      'Thika',
    );
    fireEvent.change(town, { target: { value: 'Kilimani' } });
    expect(town).toHaveValue('Kilimani');
    fireEvent.change(county, { target: { value: 'Kiambu' } });
    expect(town).toHaveValue('');
    expect([...town.options].map((option) => option.value)).toContain('Thika');
    expect([...town.options].map((option) => option.value)).not.toContain(
      'Kilimani',
    );
    fireEvent.change(county, { target: { value: '' } });
    expect(town).toBeDisabled();
    expect(town).toHaveValue('');
  });
  it('requires a town belonging to the selected county', () => {
    const values = {
      category_id: '1',
      county: 'Kiambu',
      town_or_area: 'Kilimani',
      location_details: 'Near the community library',
      description: 'A broken water pipe has been leaking for two days.',
    };
    const categories = [{ id: 1 }];
    expect(validateRequest(values, categories).town_or_area).toBeTruthy();
    expect(
      validateRequest({ ...values, town_or_area: 'Thika' }, categories),
    ).toEqual({});
    for (const entry of locations) {
      expect(entry.towns.length).toBeGreaterThan(0);
      expect(new Set(entry.towns).size).toBe(entry.towns.length);
    }
  });
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
