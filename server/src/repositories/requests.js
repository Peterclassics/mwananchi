import { pool } from '../config/database.js';
const select =
  'SELECT r.*, c.name AS category_name, u.full_name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone FROM service_requests r JOIN categories c ON c.id=r.category_id JOIN users u ON u.id=r.citizen_id';
export function filters(q, owner) {
  const clauses = [],
    values = [];
  if (owner) {
    clauses.push('r.citizen_id=?');
    values.push(owner);
  }
  if (q.search) {
    clauses.push(
      "(r.reference_number LIKE ? OR r.description LIKE ? OR CONCAT_WS(' ',r.county,r.town_or_area,r.location_details) LIKE ?)",
    );
    const term = `%${q.search.replace(/[\\%_]/g, '\\$&')}%`;
    values.push(term, term, term);
  }
  for (const [key, column] of [
    ['status', 'status'],
    ['category', 'category_id'],
  ])
    if (q[key]) {
      clauses.push(`r.${column}=?`);
      values.push(q[key]);
    }
  if (q.from) {
    clauses.push('r.created_at>=?');
    values.push(q.from);
  }
  if (q.to) {
    clauses.push('r.created_at<DATE_ADD(?,INTERVAL 1 DAY)');
    values.push(q.to);
  }
  return {
    where: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
}
export async function list(q, owner) {
  const { where, values } = filters(q, owner);
  const [[count]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM service_requests r${where}`,
    values,
  );
  const direction = q.sort === 'oldest' ? 'ASC' : 'DESC';
  const [rows] = await pool.execute(
    `${select}${where} ORDER BY r.created_at ${direction},r.id ${direction} LIMIT ? OFFSET ?`,
    [...values, String(q.page_size), String((q.page - 1) * q.page_size)],
  );
  return {
    rows,
    pagination: {
      page: q.page,
      page_size: q.page_size,
      total: count.total,
      total_pages: Math.ceil(count.total / q.page_size),
    },
  };
}
export async function detail(id, user) {
  const [rows] = await pool.execute(
    `${select} WHERE r.id=?${user.role === 'admin' ? '' : ' AND r.citizen_id=?'}`,
    [id, ...(user.role === 'admin' ? [] : [user.id])],
  );
  if (!rows[0]) return null;
  const [updates] = await pool.execute(
    'SELECT x.*,u.full_name AS actor_name FROM request_updates x JOIN users u ON u.id=x.actor_id WHERE x.request_id=? ORDER BY x.created_at,x.id',
    [id],
  );
  const request = rows[0];
  if (user.role !== 'admin') {
    delete request.citizen_email;
    delete request.citizen_phone;
  }
  return { ...request, updates };
}
export async function analytics(owner) {
  const where = owner ? ' WHERE r.citizen_id=?' : '',
    args = owner ? [owner] : [];
  const [[counts]] = await pool.execute(
    `SELECT COUNT(*) AS total,COALESCE(SUM(status='pending'),0) AS pending,COALESCE(SUM(status='in_progress'),0) AS in_progress,COALESCE(SUM(status='resolved'),0) AS resolved FROM service_requests r${where}`,
    args,
  );
  for (const key of Object.keys(counts)) counts[key] = Number(counts[key]);
  counts.open = counts.pending + counts.in_progress;
  const [categories] = await pool.execute(
    `SELECT c.name,COUNT(*) AS total FROM service_requests r JOIN categories c ON c.id=r.category_id${where} GROUP BY c.id,c.name ORDER BY total DESC`,
    args,
  );
  return { ...counts, categories };
}
