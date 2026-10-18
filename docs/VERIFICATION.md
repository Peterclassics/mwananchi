# Verification record

Checked on 18 October 2026 using Windows, Node.js 24.22.0, npm 11.19.1 and MySQL Community Server 8.4.11.

| Check                      | Observed result                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Dependency installation    | Completed; root package-lock.json includes both workspaces                                  |
| `npm run build`            | Passed; production assets emitted to client/dist, admin charts loaded in a separate bundle  |
| `npm run lint`             | Passed for frontend, backend and local development scripts                                  |
| `npm test`                 | Backend: 13 tests passed; frontend latest run: 24 tests passed                              |
| `npm run test:integration` | Passed: all 19 tests against the separate MySQL test database                               |
| `npm run test:smoke`       | Passed through the live Vite proxy on port 5174; also passed after restarting MySQL         |
| Database migration         | 001_initial.sql and 002_user_sessions.sql applied to development and test databases         |
| Essential seed             | Six categories and one initial administrator created in development                         |
| Database restart           | Normal stop/start verified; categories, administrator and schema persisted                  |
| `/api/health`              | HTTP 200 directly on port 4000 and through port 5174; API and database both ready           |
| Dependency audit           | Zero reported vulnerabilities in the last dependency audit                                  |
| Browser inspection         | Landing inspected at 390px and 1440px; registration inspected at 390px during frontend work |

## Live workflow evidence

The smoke test uses real HTTP requests through `http://localhost:5174/api`, the same proxy used by React. It creates a uniquely named disposable citizen and request, verifies registration and session restoration, uploads a real PNG image, logs in with the seeded admin, moves Pending → In Progress → Resolved with notes, logs the citizen out and back in, and verifies the resolved request, three timeline events, resolution timestamp and dashboard counts. Its own citizen, request, timeline and image fixtures are removed afterward.

The integration suite additionally verifies duplicate normalised email, registration role escalation prevention, incorrect login, anonymous access, CSRF, object ownership including images, invalid/oversized uploads, combined filtering/pagination, invalid transitions, stale versions, public notes, analytics and CSV export. It uses a separate account restricted to `hudumatrack_test`; development records are not reset.

The first integration execution exposed a removed `describe.sequential` API in the installed Vitest release. The suite now uses normal ordered suite execution. The expanded suite passes all 19 cases.

## Connection issue fixed

The registration error occurred because Express and MySQL were not running, server/.env was missing, and the backend's default frontend origin pointed to port 5173. Local MySQL was installed from Oracle's official Windows ZIP, its published checksum matched, and the server executable had a valid Oracle America signature. Generated secrets are stored in ignored local files.

The frontend now defaults to 5174 and proxies to 127.0.0.1:4000. The development/test environment examples and backend origin agree on http://localhost:5174. The database helper waits for MySQL to finish shutting down before restarting, avoiding an InnoDB file-lock race observed during verification. The live API is running without the development file watcher for stable manual testing.

See docs/LOCAL_MYSQL.md for startup/shutdown commands and docs/DEMONSTRATION.md for the full manual presentation walkthrough. After a computer restart, start MySQL and the application again.

## Profile, password and responsive update

The profile redesign adds editable name/phone details, immutable email, and current-password-protected password changes. MySQL tests verify persistence, immutable role/email, incorrect current passwords, confirmation/reuse errors, a working replacement session and rejection of older sessions. Frontend tests verify inline request validation, focus handling, trimmed description counts, account saves and cleared password fields. The development database has migration 002_user_sessions applied, and Express was restarted to activate the endpoints.

Isolated layout fixtures were inspected in a browser: profile at 1440px, 768px and 390px; citizen dashboard at 390px and 320px; admin dashboard at 768px, 390px and 320px. Mobile document scroll width matched the viewport after fixing a table accessibility-label overflow. Charts and stacked navigation/profile layouts were visually checked. Fixture preview was stopped after review. These fixture checks did not create or modify development accounts, and the live application uses real API data.

The live smoke workflow passed after the backend update, and API/database health returned ready through port 5174. See docs/ACCOUNT.md for the account API and upgrade behaviour. Existing pre-upgrade sessions must sign in again.

## Remaining manual review

Authenticated screens still need a complete human browser walkthrough on mobile and desktop, including print layout and accessibility. The live workflow has been verified over real HTTP; it has not been driven end to end through browser clicks. No mock data is used by application screens, and the preserved original mwananchi starter is not the active application.
