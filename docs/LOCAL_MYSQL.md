# Local MySQL on Windows

This checkout can run an official MySQL 8.4.11 server from its ignored `.local` directory. It binds only to `127.0.0.1:3306`. The helper does not install a global Windows service or change another MySQL installation.

## First setup

Download the Windows x64 ZIP from the [official MySQL 8.4 download page](https://dev.mysql.com/downloads/mysql/8.4.html). Extract it so `.local/mysql-8.4.11-winx64/bin/mysqld.exe` exists, then run from the project root:

```sh
npm run mysql:setup
npm run migrate
npm run seed
```

The setup helper generates a private root password and stores it in `.local/mysql-credentials.json`. It creates `server/.env` and `server/.env.test` only when they do not already exist. Passwords and JWT secrets are generated independently. Existing environment files and passwords are preserved.

The development database is `hudumatrack` and its user is `huduma`. The separate test database is `hudumatrack_test`, with its own `huduma_test` user and password. Each application user receives privileges only on its own database. Existing database names are retained from the original schema setup; the application is branded Mwananchi.

For the initial admin login, use `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from your local `server/.env` after running the seed command. Do not commit this file or the `.local` directory.

## Start after a computer restart

```sh
npm run mysql:start
npm run dev
```

Frontend: http://localhost:5174. API: http://localhost:4000. If the frontend is already running, start only Express with `npm run dev -w server`.

Check [API and database readiness](http://localhost:4000/api/health). A 200 response reports both `api: ready` and `database: ready`; a database failure returns 503 if Express is still running.

## Stop MySQL

```sh
npm run mysql:stop
```

This performs a normal database shutdown. Persistent records stay in `.local/mysql-data`. Do not delete that directory to restart the application. Back it up together with `server/uploads` when you need to preserve project data.

## Run database tests

```sh
npm run test:integration
```

The test runner requires a database name ending in `_test` and removes only its own test fixtures. The development database is not reset.

## Troubleshooting

- MySQL cannot start: inspect `.local/mysql-error.log`. Check that port 3306 is not occupied by another database.
- Authentication failure: check that environment passwords match the accounts created during setup. The helper does not overwrite existing user passwords.
- Missing Windows runtime DLL: install the Microsoft Visual C++ x64 redistributable required by the official MySQL Windows package.
- Initialization fails: inspect the error log before retrying; never overwrite or delete an existing database directory.
- API unavailable: start Express and check its terminal output. MySQL must be running before the API starts.
- CSRF/origin failure: use `http://localhost:5174` consistently and set `FRONTEND_ORIGIN` to that exact origin.

This helper is for the local assessment environment. Follow the main README's restricted-account and HTTPS deployment instructions for production.
