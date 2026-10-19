# Mwananchi frontend guide

The frontend uses React and JavaScript. Each route points to a named page, each page composes reusable components, and hooks contain reusable state and API behaviour.

```text
client/src/
  App.jsx                     Skip link and lazy-screen loading boundary
  routes/
    AppRoutes.jsx             All URLs and their page components
    ProtectedRoute.jsx        Session and role checks for navigation
  layouts/
    AppLayout.jsx             Authenticated page composition
    Sidebar.jsx               Workspace navigation
    Navbar.jsx                Current account and sign out
                              Mobile menu button controls the sidebar drawer
    Footer.jsx                Copyright and demonstration notice
  pages/
    public/                   Landing, guide and error screens
    auth/                     Login, registration and shared authentication form
    citizen/                  Dashboard, request list/details and submission
    admin/                    Dashboard and request management screens
    account/                  Profile
    shared/                   Request screens reused by both roles
  components/
    branding/                 Mwananchi brand
    auth/                     Labelled authentication field and password toggle
    ui/                       Loading, alerts, empty state, pagination, dialog, heading
    dashboard/                Statistics, recent requests, charts and status guide
    requests/                 Form, filters, table, timeline, summary and admin actions
  hooks/
    useApi.js                 Cancellable loading, errors and refresh
    useMediaQuery.js          Responsive breakpoint changes for mobile navigation
    useRequestActions.js      Admin updates, concurrency errors and success feedback
  context/                    Authentication state and session restoration
  services/                   Axios configuration and CSRF handling
  utils/                      Date formatting and status labels
  styles/
    main.css                  Stylesheet entry point
    base.css                  Colours, typography and shared controls
    layout.css                Workspace layout, navigation and dashboard layout
    components.css            Forms, tables, timelines, charts and dialogs
    auth.css                  Login and registration layout
    landing.css               Public landing page
    responsive.css            Breakpoints, printing and reduced motion
```

## How to follow the code

Start with `routes/AppRoutes.jsx` to find a screen. Citizen and admin dashboards have separate page files because they display different information. Their statistics and recent-request components are shared. Recharts loads with the admin dashboard rather than the public landing page or citizen dashboard.

The request list and details share most of their layout between roles. Small named role pages select the appropriate shared screen. The shared details screen composes `RequestSummary`, `RequestTimeline`, `CitizenContactCard` and `AdminRequestActions`. The admin action component owns its note/dialog fields; `useRequestActions` owns HTTP mutation state and requests a data refresh after a successful change or version conflict.

`useApi` associates results with the requested URL so navigating between records cannot display the preceding record as the new one. A refresh can retain the current record while it loads. Details keep the admin form mounted during that refresh so success/conflict feedback and unsent notes remain visible.

`components/ui` contains small generic controls. `components/requests` contains components that understand a service request. Imports point directly to the component file, making dependencies easy to trace. Avoid putting unrelated components back into a single Common file.

## Working on a screen

### Backend domain by environment

Vercel routing configuration is included for both supported project roots: repository root (`vercel.json`, output `client/dist`) and `client` (`client/vercel.json`, output `dist`). Keep the Vercel Root Directory set to one of those, not the unused `mwananchi` starter folder. Both configurations proxy `/api/:path*` to `https://hudumaserver-production.up.railway.app/api/:path*` before serving `index.html` for React Router paths. Push the files and redeploy to apply these rules. If the backend domain changes, update both proxy destinations.

All Axios calls and protected request images use the API URL selected in `services/apiConfig.js`.

- Development (`npm run dev`): always uses `/api`, forwarded by Vite to `http://127.0.0.1:4000`.
- Production (`npm run build`): set `VITE_API_BASE_URL=/api` in Vercel for Production. Requests go to the frontend origin, and Vercel forwards them to Railway. This keeps authentication and CSRF cookies on the same origin as the page. Remove any previous direct Railway URL from this variable. Preview origins also need explicit backend authorisation before login can work.
- Without a configured production URL, the default is `/api`, which uses the included Vercel proxy. Other hosting platforms need an equivalent proxy.

Vite embeds public variables at build time. Redeploy after changing them. Never put database credentials or JWT secrets in a `VITE_` variable.

Set Railway's `FRONTEND_ORIGIN=https://mwananchi-kappa.vercel.app` (no trailing slash) and `NODE_ENV=production`. The backend retains HTTP-only, Secure, SameSite=Lax cookies and its CSRF token and Origin checks. The proxy forwards browser requests to Railway without making the browser contact another site. Do not disable CSRF validation to fix a missing-cookie error.

After deployment, open `https://mwananchi-kappa.vercel.app/api/health`; it must return JSON showing API and database readiness. Reload the login page to acquire a fresh CSRF token. In browser Network tools, authentication requests should target the Vercel domain under `/api`, and protected requests after login should include the session cookie. Local checks do not verify Vercel's live proxy; verify this after redeployment.

Mobile navigation is composed in AppLayout using `useMediaQuery`. `MobileSidebar` uses a native modal dialog for background isolation and focus return, plus keyboard focus wrapping, Escape/backdrop dismissal and body scroll locking. Sidebar contains the same role-aware navigation links on desktop and mobile. Route changes and link selection close the drawer automatically. Styling lives in `styles/navigation.css`.

1. Find its page in `routes/AppRoutes.jsx`.
2. Change page-specific layout in the page; change reusable UI in the corresponding component.
3. Put shared API/state behaviour in a hook, using the Axios client in `services/api.js`.
4. Keep permission enforcement in Express; React route guards only guide navigation.
5. Run `npm run lint`, `npm run test -w client` and `npm run build` from the root.

For a frontend-only preview, run `npm run dev -w client`. If the original starter already occupies port 5173, use `npm run dev -w client -- --port 5174`. When connecting Express on that port, configure `FRONTEND_ORIGIN=http://localhost:5174`. Normal full setup is described in the root README.

The visible product is named Mwananchi. Existing configurable database names and authentication identifiers are retained so the frontend rename does not invalidate stored data or sessions.
