import { describe, it, expect } from 'vitest';
import { checkTransition } from '../src/services/requests.js';
import {
  parse,
  registration,
  listing,
  requestInput,
  change,
} from '../src/validators/index.js';
import { csvCell } from '../src/utils/http.js';
describe('Business rules and validation', () => {
  it('permits only forward, single-step transitions', () => {
    expect(() => checkTransition('pending', 'in_progress')).not.toThrow();
    expect(() => checkTransition('in_progress', 'resolved')).not.toThrow();
    for (const pair of [
      ['pending', 'resolved'],
      ['resolved', 'pending'],
      ['in_progress', 'pending'],
      ['resolved', 'resolved'],
    ])
      expect(() => checkTransition(...pair)).toThrow();
  });
  it('normalises emails and discards role escalation', () => {
    const data = parse(registration, {
      full_name: 'Citizen One',
      email: ' CITIZEN@EXAMPLE.COM ',
      password: 'password123',
      confirm_password: 'password123',
      role: 'admin',
    });
    expect(data.email).toBe('citizen@example.com');
    expect(data.role).toBeUndefined();
  });
  it('rejects mismatched passwords and unsafe page sizes', () => {
    expect(() =>
      parse(registration, {
        full_name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'other',
      }),
    ).toThrow();
    expect(() => parse(listing, { page_size: 101 })).toThrow();
    expect(() => parse(listing, { sort: 'DROP TABLE' })).toThrow();
  });
  it('requires a resolution note and useful descriptions', () => {
    expect(() =>
      parse(change, { status: 'resolved', version: 1, note: '' }),
    ).toThrow();
    expect(() =>
      parse(requestInput, {
        category_id: 1,
        county: 'Nairobi',
        town_or_area: 'CBD',
        location_details: 'Main road',
        description: 'short',
      }),
    ).toThrow();
  });
  it('validates combined date and pagination filters', () => {
    expect(
      parse(listing, {
        search: 'water',
        status: 'pending',
        category: '2',
        page: '2',
        page_size: '5',
        from: '2026-01-01',
        to: '2026-02-01',
      }).page,
    ).toBe(2);
    expect(() => parse(listing, { from: '2026-02-30' })).toThrow();
    expect(() =>
      parse(listing, { from: '2026-03-01', to: '2026-02-01' }),
    ).toThrow();
  });
  it('neutralises spreadsheet formulas and quotes', () => {
    expect(csvCell(' =SUM(1,2)')).toBe('"\' =SUM(1,2)"');
    expect(csvCell('a"b')).toBe('"a""b"');
  });
});
