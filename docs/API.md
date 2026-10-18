# Mwananchi API

Base URL: `/api`. JSON requests use `Content-Type: application/json`. Image requests use multipart FormData; let the HTTP client set its boundary. Authentication uses cookies, not Authorization headers.

## Response contract

```json
{ "success": true, "message": "Success", "data": {} }
```

Lists return a data array plus `pagination: {page,page_size,total,total_pages}`. Errors use `success:false`, `data:null`, a safe `message`, and optional `fields: {field_name: "validation message"}`. HTTP codes: 200 success, 201 created, 400 validation, 401 missing/expired/invalid session, 403 wrong role/CSRF/origin, 404 inaccessible/missing resource, 409 duplicate email/stale version/invalid transition, 429 too many auth attempts, 500 unexpected service failure. Empty lists are successful with `data:[]`.

## CSRF and sessions

GET `/health` checks API/database readiness without authentication. It returns 200 with `{api:"ready",database:"ready"}` when MySQL responds, or 503 with `database:"unavailable"` when the connection fails. It never returns database credentials or driver error details.

1. GET `/auth/csrf` with cookie credentials enabled. Save `data.csrfToken` in memory and retain cookies.
2. Include `X-CSRF-Token` with that value on every POST and PATCH, including login and logout.
3. Registration and login set `ht_session`, an HttpOnly cookie. GET `/auth/me` returns `{user,csrfToken}`. Password hashes are never included.
4. POST `/auth/logout` clears the session cookie. A 401 from an authenticated screen causes the client to return to login. A 403 requires checking token, origin or role.

For command-line testing, GET `/auth/csrf` with a cookie jar, then use both the cookie jar and the returned CSRF header for writes. Browser clients must use the configured origin; production uses HTTPS and a same-origin API.

## Authentication inputs

Account updates use authenticated `PATCH /account/profile` and `POST /account/password` endpoints with CSRF protection. See [profile and password API details](ACCOUNT.md) for fields, validation and session revocation rules. Email and role cannot be edited.

POST `/auth/register`:

```json
{
  "full_name": "Amina Citizen",
  "email": "amina@example.com",
  "phone": "+254700000000",
  "password": "a-strong-password",
  "confirm_password": "a-strong-password"
}
```

Full name: 2–100 trimmed characters; email: valid, normalised to lowercase, maximum 254; phone: optional, maximum 25 characters (digits, spaces, +, parentheses, hyphens); password: 8–72 characters; matching confirmation. Creates only a citizen. Unknown properties, including role, are discarded. Returns `{user}` and 201. POST `/auth/login` accepts `email` and `password`, returns `{user}`. Incorrect credentials return the same generic 401.

## Categories

GET `/categories`: signed-in users receive active `{id,name,description}` records. Existing requests retain their category even if a category is later inactive.

## Citizen requests

POST `/requests`: JSON or multipart fields:

| Field              | Rule                                                  |
| ------------------ | ----------------------------------------------------- |
| `category_id`      | Existing active positive integer ID                   |
| `county`           | Required, 2–100 characters                            |
| `town_or_area`     | Required, 2–100 characters                            |
| `location_details` | Required, 2–255 characters                            |
| `description`      | Required, 20–2,000 trimmed characters                 |
| `image`            | Optional multipart file, JPEG/PNG/WebP, maximum 5 MiB |

Returns the new request with timeline and 201. Owner, initial Pending status and `HT-year-id` reference come from the server. Extra owner/status/reference inputs are discarded.

GET `/requests`: always the current user's records. GET `/requests/:id`: request and updates in chronological order. GET `/requests/:id/image`: private WebP image. Both details and images return 404 for another citizen's records. Admins may access any request via either details/image endpoint.

GET `/dashboard/citizen`: current user's `{total,pending,in_progress,resolved,open,categories,recent}`. Recent contains up to five requests. All totals aggregate the full owned dataset.

## Listing parameters

GET `/requests` and `/admin/requests` accept:

| Query        | Default / allowed values                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| `search`     | Empty; maximum 200 trimmed characters; reference, description or combined location |
| `status`     | Omitted or `pending`, `in_progress`, `resolved`                                    |
| `category`   | Omitted or positive category ID                                                    |
| `from`, `to` | Omitted or valid YYYY-MM-DD; inclusive UTC dates; from ≤ to                        |
| `page`       | 1; positive integer up to 100,000                                                  |
| `page_size`  | 10; integer 1–100; values above 100 are rejected                                   |
| `sort`       | `newest` or `oldest`; sorts submission timestamp then ID                           |

Example: `/admin/requests?search=Kilimani&status=pending&category=1&from=2026-01-01&to=2026-12-31&page=1&page_size=10&sort=newest`. Filters combine with AND; search fields combine with OR. Wildcards in search input are treated literally. No raw SQL sort expression is accepted.

## Administrator actions

All `/admin/*` endpoints require a database-backed admin role. Citizens receive 403 even if they know a URL.

- GET `/admin/requests`: all citizens' requests, with the listing parameters above.
- GET `/admin/requests/:id`: complete details, citizen name, email and optional phone, and timeline.
- PATCH `/admin/requests/:id/status`: `{ "status":"in_progress", "version":1, "note":"A crew has been assigned." }`. `status` is `in_progress` or `resolved`; only one forward step is permitted. When resolving, a trimmed note of 5–2,000 characters is required. Other transition notes are optional, maximum 2,000. Version must match the latest details response. A row lock, version check and one transaction protect both request and history. Returns updated details. A stale version or prohibited transition returns 409 with no partial history.
- POST `/admin/requests/:id/updates`: `{ "note":"The service team will visit tomorrow." }`. Trimmed note: 5–2,000 characters. Records an actor and timestamp, increments version, and returns details.
- GET `/admin/analytics`: `{total,pending,in_progress,resolved,open,categories:[{name,total}],recent:[]}`. Open is Pending + In Progress. Aggregates all rows in MySQL.
- GET `/admin/requests/export`: same filters/sort; exports all matching records regardless of page/page_size. Returns UTF-8 CSV download, with quoted fields and formula-prefix protection. Citizen contact email and phone are deliberately excluded from export.

All timestamps in JSON are UTC ISO strings. Status values in JSON use snake_case; the client displays readable labels. `version` is a concurrency field for administrator writes, not a status number.
