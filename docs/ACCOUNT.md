# Profile and password management

Both citizens and administrators manage their own account from **My profile**. The page has an account summary, a personal-details card and a separate password/security card.

## Personal details

PATCH `/api/account/profile` requires authentication and CSRF protection. Send `full_name` (2–100 trimmed characters) and `phone` (optional; blank clears it). Phone numbers may contain a leading +, digits, spaces, parentheses and hyphens, with 7–15 digits and at most 25 characters. The API rejects extra fields, including email, role and user IDs. It always edits the authenticated account. Responses include the updated public user, and React updates the shared auth context so the navbar/profile summary show the saved name immediately.

## Password changes

POST `/api/account/password` requires authentication, CSRF and authentication rate limiting:

```json
{
  "current_password": "your-current-password",
  "new_password": "your-new-password",
  "confirm_password": "your-new-password"
}
```

The new password must be at least 8 characters, fit within bcrypt's 72 UTF-8 byte limit, differ from the current password and match confirmation. The server verifies the current password using bcrypt. The password hash update uses a conditional SQL update to avoid overwriting another concurrent password change.

Migration `002_user_sessions.sql` adds `users.session_version`. JWTs carry this value, and authentication compares it with MySQL on every request. A password change atomically increments it and gives the current browser a fresh cookie. Other sessions receive 401 and must sign in again. Session versions and password hashes are excluded from public user responses. Password inputs are cleared after a successful change.

Run `npm run migrate` when upgrading an existing installation. Sessions created before this security update must sign in once again. No existing user details or request records are reset.

## Request validation

Request forms validate category availability, trimmed location fields and descriptions of 20–2,000 characters. They show inline messages on blur and submission, move focus to the first invalid field, and display a live character count. Server-side validation enforces the same rules. Image type/size checks and server-side content validation remain in place.

## Responsive behaviour and verification

On screens up to 800px, a menu button opens the navigation in a modal sidebar drawer. Selecting a link, the close button, Escape or the backdrop dismisses it. Keyboard focus stays inside the drawer, returns to the opener on close, and background scrolling is locked while it is open. Desktop navigation remains fixed and visible. Statistics adapt to one/two columns on phones, charts stack, long account names truncate, profile forms stack, and request tables scroll within their own card. A positioned table wrapper prevents hidden accessibility labels from widening the whole page.

Frontend tests cover profile saves, read-only email, password confirmation/reset and request validation. MySQL integration tests cover immutable email/role, profile persistence, incorrect current passwords, new-password confirmation/reuse and revocation of older sessions. Layout checks use isolated frontend fixtures rather than creating privileged users in development. The application itself continues to use real API/MySQL data.
