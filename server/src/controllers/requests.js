import path from 'node:path';
import { pool } from '../config/database.js';
import { config } from '../config/env.js';
import * as repository from '../repositories/requests.js';
import * as service from '../services/requests.js';
import {
  parse,
  listing,
  requestInput,
  change,
  comment,
  id,
} from '../validators/index.js';
import { ok, HttpError, csvCell } from '../utils/http.js';
import { storeImage, removeImage } from '../middleware/upload.js';
export async function categories(_req, res) {
  const [rows] = await pool.execute(
    'SELECT id,name,description FROM categories WHERE is_active=1 ORDER BY id',
  );
  ok(res, rows);
}
export async function create(req, res) {
  const data = parse(requestInput, req.body);
  let key;
  let requestId;
  try {
    key = await storeImage(req.file);
    requestId = await service.createRequest(data, req.user.id, key);
  } catch (error) {
    await removeImage(key);
    throw error;
  }
  ok(
    res,
    await repository.detail(requestId, req.user),
    'Request submitted',
    201,
  );
}
export async function list(req, res) {
  const q = parse(listing, req.query);
  const result = await repository.list(
    q,
    req.path.startsWith('/admin') ? null : req.user.id,
  );
  ok(res, result.rows, 'Requests loaded', 200, result.pagination);
}
export async function get(req, res) {
  const request = await repository.detail(id(req.params.id), req.user);
  if (!request) throw new HttpError(404, 'Request not found');
  ok(res, request);
}
export async function image(req, res) {
  const request = await repository.detail(id(req.params.id), req.user);
  if (!request?.image_storage_key) throw new HttpError(404, 'Image not found');
  if (!/^[a-f0-9-]{36}\.webp$/.test(request.image_storage_key))
    throw new HttpError(404, 'Image not found');
  res.set({
    'Cache-Control': 'private, no-store',
    'Content-Type': 'image/webp',
    'Content-Security-Policy': "default-src 'none'",
  });
  res.sendFile(
    path.join(config.uploads, request.image_storage_key),
    (error) => {
      if (error && !res.headersSent)
        res
          .status(404)
          .json({ success: false, message: 'Image not found', data: null });
    },
  );
}
export async function dashboard(req, res) {
  const owner = req.path.includes('/citizen') ? req.user.id : null;
  ok(res, {
    ...(await repository.analytics(owner)),
    recent: (
      await repository.list(
        { page: 1, page_size: 5, sort: 'newest', search: '' },
        owner,
      )
    ).rows,
  });
}
export async function status(req, res) {
  await service.updateStatus(
    id(req.params.id),
    parse(change, req.body),
    req.user.id,
  );
  return get(req, res);
}
export async function update(req, res) {
  await service.addComment(
    id(req.params.id),
    parse(comment, req.body).note,
    req.user.id,
  );
  return get(req, res);
}
export async function exportCsv(req, res) {
  const q = parse(listing, req.query);
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="hudumatrack-requests.csv"',
    'Cache-Control': 'no-store',
  });
  res.write(
    '\uFEFFReference,Citizen,Category,County,Area,Location,Status,Submitted\r\n',
  );
  let page = 1;
  while (true) {
    const result = await repository.list({ ...q, page, page_size: 100 }, null);
    for (const r of result.rows)
      res.write(
        [
          r.reference_number,
          r.citizen_name,
          r.category_name,
          r.county,
          r.town_or_area,
          r.location_details,
          r.status,
          r.created_at.toISOString(),
        ]
          .map(csvCell)
          .join(',') + '\r\n',
      );
    if (page >= result.pagination.total_pages || res.destroyed) break;
    page++;
  }
  res.end();
}
