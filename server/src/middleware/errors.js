import { ZodError } from 'zod';
export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500,
    message = error.message;
  if (error.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'Image must be 5 MB or smaller.';
  } else if (error.name === 'MulterError') {
    status = 400;
    message = 'Upload one image using the image field.';
  } else if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That email address is already registered.';
  } else if (error instanceof ZodError) {
    status = 400;
    message = 'Invalid input';
  }
  if (status >= 500) {
    console.error('Request failed:', error.code || error.name);
    message = 'The service is temporarily unavailable. Please try again.';
  }
  res.status(status).json({
    success: false,
    message,
    data: null,
    ...(error.fields ? { fields: error.fields } : {}),
  });
}
