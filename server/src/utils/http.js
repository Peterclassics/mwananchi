export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export const ok = (res, data, message = 'Success', status = 200, pagination) =>
  res.status(status).json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
export function csvCell(value) {
  const text = String(value ?? '');
  return `"${(/^[\s]*[=+@-]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
}
