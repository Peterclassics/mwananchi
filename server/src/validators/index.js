import { z } from 'zod';
import { HttpError } from '../utils/http.js';
const email = z.string().trim().toLowerCase().email().max(254);
const fullName = z
  .string()
  .trim()
  .min(2, 'Enter at least 2 characters.')
  .max(100, 'Use 100 characters or fewer.');
const phone = z
  .string()
  .trim()
  .max(25)
  .refine(
    (value) =>
      !value ||
      (/^[+\d\s()-]+$/.test(value) &&
        /^\+?[\d\s()-]+$/.test(value) &&
        value.replace(/\D/g, '').length >= 7 &&
        value.replace(/\D/g, '').length <= 15),
    'Enter a valid phone number with 7–15 digits.',
  )
  .optional();
const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must fit within 72 UTF-8 bytes.',
  );
export const profileInput = z.object({ full_name: fullName, phone }).strict();
export const passwordInput = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.').max(72),
    new_password: password,
    confirm_password: z.string(),
  })
  .strict()
  .refine((value) => value.new_password === value.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match.',
  });
export const registration = z
  .object({
    full_name: fullName,
    email,
    phone: z
      .string()
      .trim()
      .max(25)
      .regex(/^[+\d\s()-]*$/)
      .optional(),
    password: z
      .string()
      .min(8)
      .max(72)
      .refine(
        (value) => Buffer.byteLength(value, 'utf8') <= 72,
        'Password must fit within 72 UTF-8 bytes.',
      ),
    confirm_password: z.string(),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });
export const login = z.object({ email, password: z.string().min(1).max(72) });
export const requestInput = z.object({
  category_id: z.coerce.number().int().positive('Choose a service category.'),
  county: z
    .string()
    .trim()
    .min(2, 'Enter a county with at least 2 characters.')
    .max(100),
  town_or_area: z
    .string()
    .trim()
    .min(2, 'Enter a town or area with at least 2 characters.')
    .max(100),
  location_details: z
    .string()
    .trim()
    .min(2, 'Enter a street or nearby landmark.')
    .max(255),
  description: z
    .string()
    .trim()
    .min(20, 'Describe the issue in at least 20 characters.')
    .max(2000, 'Use 2,000 characters or fewer.'),
});
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    'Invalid date',
  )
  .optional();
export const listing = z
  .object({
    search: z.string().trim().max(200).default(''),
    status: z.enum(['pending', 'in_progress', 'resolved']).optional(),
    category: z.coerce.number().int().positive().optional(),
    from: date,
    to: date,
    page: z.coerce.number().int().min(1).max(100000).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(['newest', 'oldest']).default('newest'),
  })
  .refine((v) => !v.from || !v.to || v.from <= v.to, {
    path: ['to'],
    message: 'End date must follow start date',
  });
export const change = z
  .object({
    status: z.enum(['in_progress', 'resolved']),
    version: z.coerce.number().int().positive(),
    note: z.string().trim().max(2000).default(''),
  })
  .refine((v) => v.status !== 'resolved' || v.note.length >= 5, {
    path: ['note'],
    message: 'Add a resolution note of at least 5 characters',
  });
export const comment = z.object({ note: z.string().trim().min(5).max(2000) });
export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues)
      fields[issue.path[0] || 'form'] = issue.message;
    throw new HttpError(400, 'Please check the highlighted fields.', fields);
  }
  return result.data;
}
export function id(value) {
  const result = z.coerce.number().int().positive().safeParse(value);
  if (!result.success) throw new HttpError(400, 'Invalid request ID');
  return result.data;
}
