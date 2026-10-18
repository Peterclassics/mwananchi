# Assessment walkthrough

## Explain the architecture (one minute)

“Mwananchi is a demonstration public service reporting system. React handles the interface, Express enforces permissions and business rules, and MySQL stores users, categories, requests and history. The browser never decides who owns a report. The API derives that from the signed-in account.”

Show the four-table ER diagram in the README, then the route → controller → service → repository flow. Explain that a foreign key links each request to its citizen and category, while timeline rows link to both the request and the person who made the update.

## End-to-end manual acceptance check

Start MySQL, run migrations and seed, then start both apps.

1. Open the landing page and point out the demonstration disclaimer.
2. Register a new citizen, including confirmation password. Show that duplicate registration is rejected.
3. Sign out and sign back in. Refresh the dashboard to demonstrate session restoration.
4. Submit a request: select Street lighting, enter county/area/landmark and a description of at least 20 characters, attach a real JPEG/PNG/WebP under 5 MiB. Remove and reselect the preview before submitting.
5. Confirm the success message, unique reference and Pending badge. View the image and initial timeline event.
6. Return to My Requests; combine reference search, category and status filters. Check pagination using more than ten reports if needed.
7. Sign out, then sign in with the administrator created by the seed command.
8. Open the request and show citizen name, email, location and timeline. Attempting direct Pending → Resolved through the API must return 409.
9. Add a note and mark In Progress. Show the timestamp and administrator recorded in the timeline.
10. Add a public progress note. Resolve with a meaningful resolution note. Confirm a resolution timestamp appears. An empty resolution note must fail.
11. Sign back in as the citizen. Verify Resolved, all timeline entries, and counts. Print the request summary.
12. Compare admin open + resolved with total and category chart counts. Export a filtered CSV and inspect its rows.
13. Refresh both dashboards, stop the apps, start them again, and verify the request, image and history persist.

## Permission and concurrency checks

- Register another citizen. Copy the first citizen's request ID into a details API call and image URL: both must return 404, and the second citizen's list must not contain it.
- Call an admin endpoint with a citizen cookie: expect 403. Call a protected endpoint without a session: expect 401.
- Send a write without X-CSRF-Token: expect 403.
- Select a fake .png text file, corrupt image, or a file over 5 MiB: expect rejection.
- Open the same pending request in two admin browser sessions. Update in one; submit the stale version in the other: expect 409 and no overwritten status/history.
- Use keyboard navigation, visible focus indicators, labelled fields and the skip link. Check at approximately 390px, 768px and 1440px widths. Tables can scroll horizontally on narrow screens.

## Marking criteria

| Criterion           | Evidence to present                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Code quality (25%)  | Routes/controllers/services/repositories; shared React components, API hook, auth context; named validators; lockfile and lint      |
| Functionality (35%) | Real MySQL creation/restart, ownership checks, uploads, transaction history, permitted transitions, analytics                       |
| UI/UX (20%)         | Navy/teal design, responsive navigation and tables, labelled forms, field errors, loading/empty/error states, status icons and text |
| Documentation (10%) | Fresh setup, SQL users, environment examples, migrations/seed, API reference, ER diagram, test and walkthrough instructions         |
| Bonus (10%)         | Complete timeline, combined filters and pagination, safe filtered CSV, printable request summary                                    |

## Answers to likely presentation questions

**Why a transaction?** The request and its history must agree. If either write fails, both are rolled back.

**Why both a row lock and a version?** The lock serialises concurrent database writes. The version tells an administrator their browser was displaying an older record and prevents silently applying an outdated decision.

**Why enforce ownership in the backend?** Anyone can change a URL or call an API outside React. Database queries must restrict access using the authenticated citizen's ID.

**Why an HttpOnly cookie plus CSRF token?** HttpOnly prevents browser JavaScript from reading the session token. Browsers send cookies automatically, so a separate CSRF token and origin checks protect writes.

**Why not put images in MySQL?** The database stores a safe storage key; files stay in private storage and are served after permission checks. Both need backups.

**How are analytics calculated?** SQL COUNT and conditional SUM queries aggregate the whole permitted dataset. The visible table page does not determine the dashboard totals.
