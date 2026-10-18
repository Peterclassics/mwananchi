import { randomUUID } from 'node:crypto';
import { transaction } from '../config/database.js';
import { HttpError } from '../utils/http.js';
export function checkTransition(current, next) {
  if ({ pending: 'in_progress', in_progress: 'resolved' }[current] !== next)
    throw new HttpError(
      409,
      'Status changed or transition is not permitted. Refresh the request.',
    );
}
export async function createRequest(data, owner, key) {
  return transaction(async (c) => {
    const [categories] = await c.execute(
      'SELECT id FROM categories WHERE id=? AND is_active=1 FOR SHARE',
      [data.category_id],
    );
    if (!categories.length)
      throw new HttpError(400, 'Choose an active category.', {
        category_id: 'Category is unavailable',
      });
    const [result] = await c.execute(
      'INSERT INTO service_requests(reference_number,citizen_id,category_id,county,town_or_area,location_details,description,image_storage_key) VALUES (?,?,?,?,?,?,?,?)',
      [
        randomUUID(),
        owner,
        data.category_id,
        data.county,
        data.town_or_area,
        data.location_details,
        data.description,
        key,
      ],
    );
    const reference = `HT-${new Date().getUTCFullYear()}-${String(result.insertId).padStart(6, '0')}`;
    await c.execute(
      'UPDATE service_requests SET reference_number=? WHERE id=?',
      [reference, result.insertId],
    );
    await c.execute(
      "INSERT INTO request_updates(request_id,actor_id,event_type,new_status,note) VALUES (?,?,'created','pending','Request submitted')",
      [result.insertId, owner],
    );
    return result.insertId;
  });
}
export async function updateStatus(id, data, actor) {
  return transaction(async (c) => {
    const [rows] = await c.execute(
      'SELECT status,version FROM service_requests WHERE id=? FOR UPDATE',
      [id],
    );
    if (!rows.length) throw new HttpError(404, 'Request not found');
    const current = rows[0];
    if (current.version !== data.version)
      throw new HttpError(
        409,
        'Another administrator updated this request. Refresh before trying again.',
      );
    checkTransition(current.status, data.status);
    await c.execute(
      "UPDATE service_requests SET status=?,version=version+1,resolved_at=IF(?='resolved',UTC_TIMESTAMP(3),NULL),updated_at=UTC_TIMESTAMP(3) WHERE id=?",
      [data.status, data.status, id],
    );
    await c.execute(
      "INSERT INTO request_updates(request_id,actor_id,event_type,previous_status,new_status,note) VALUES (?,?,'status_changed',?,?,?)",
      [id, actor, current.status, data.status, data.note || null],
    );
  });
}
export async function addComment(id, note, actor) {
  return transaction(async (c) => {
    const [rows] = await c.execute(
      'SELECT id FROM service_requests WHERE id=? FOR UPDATE',
      [id],
    );
    if (!rows.length) throw new HttpError(404, 'Request not found');
    await c.execute(
      "INSERT INTO request_updates(request_id,actor_id,event_type,note) VALUES (?,?,'comment',?)",
      [id, actor, note],
    );
    await c.execute(
      'UPDATE service_requests SET version=version+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?',
      [id],
    );
  });
}
