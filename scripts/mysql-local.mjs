import { mkdir, readFile, writeFile, access, unlink } from 'node:fs/promises';
import { openSync, closeSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Windows development helper. All state is private to this checkout's ignored .local folder.
const root = fileURLToPath(new URL('../', import.meta.url));
const local = path.join(root, '.local');
const base = path.join(local, 'mysql-8.4.11-winx64');
const data = path.join(local, 'mysql-data');
const binary = path.join(base, 'bin', 'mysqld.exe');
const ini = path.join(local, 'mysql.ini');
const credentialsFile = path.join(local, 'mysql-credentials.json');
const exists = async (file) =>
  access(file).then(
    () => true,
    () => false,
  );
const secret = () => randomBytes(24).toString('hex');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mysqlPath = (value) => value.replaceAll('\\', '/');
async function connection(credentials) {
  return mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: credentials.rootPassword,
    connectTimeout: 2000,
  });
}
async function launch(credentials, initial = false) {
  try {
    const c = await connection(credentials);
    await c.end();
    console.log('Project MySQL is already running on 127.0.0.1:3306.');
    return;
  } catch (error) {
    if (!['ECONNREFUSED', 'ETIMEDOUT'].includes(error.code)) throw error;
  }
  const initFile = path.join(local, 'mysql-first-start.sql');
  const args = [`--defaults-file=${ini}`];
  if (initial) {
    await writeFile(
      initFile,
      `ALTER USER 'root'@'localhost' IDENTIFIED BY '${credentials.rootPassword}';\n`,
      { flag: 'wx' },
    );
    args.push(`--init-file=${mysqlPath(initFile)}`);
  }
  const output = openSync(path.join(local, 'mysql-process.log'), 'a');
  const child = spawn(binary, args, {
    detached: true,
    windowsHide: true,
    stdio: ['ignore', output, output],
  });
  child.unref();
  closeSync(output);
  let spawnError;
  child.once('error', (error) => {
    spawnError = error;
  });
  await writeFile(path.join(local, 'mysql.pid'), String(child.pid));
  let lastError;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null)
      throw new Error(
        `MySQL exited (${child.exitCode}); check .local/mysql-error.log.`,
      );
    try {
      const c = await connection(credentials);
      await c.end();
      if (initial) await unlink(initFile);
      console.log('Project MySQL is ready on 127.0.0.1:3306.');
      return;
    } catch (error) {
      lastError = error;
      await delay(1000);
    }
  }
  throw new Error(
    `MySQL did not start (${lastError?.code}). Check .local/mysql-error.log.`,
  );
}
async function initialise(credentials) {
  await access(binary);
  await writeFile(
    ini,
    `[mysqld]\nbasedir=${mysqlPath(base)}\ndatadir=${mysqlPath(data)}\nbind-address=127.0.0.1\nport=3306\nmysqlx=OFF\nlocal-infile=OFF\nsecure-file-priv=NULL\ndefault-time-zone=+00:00\nlog-error=${mysqlPath(path.join(local, 'mysql-error.log'))}\npid-file=${mysqlPath(path.join(local, 'mysql-server.pid'))}\n`,
  );
  if (!(await exists(path.join(data, 'mysql')))) {
    console.log('Initialising the project MySQL data directory…');
    await new Promise((resolve, reject) => {
      const child = spawn(
        binary,
        [`--defaults-file=${ini}`, '--initialize-insecure'],
        { windowsHide: true, stdio: 'ignore' },
      );
      child.once('error', reject);
      child.once('exit', (code) =>
        code === 0
          ? resolve()
          : reject(
              new Error(
                `MySQL initialisation failed (${code}); inspect .local/mysql-error.log.`,
              ),
            ),
      );
    });
    await launch(credentials, true);
  } else await launch(credentials);
}
async function environment(credentials) {
  const files = [
    ['server/.env', 'hudumatrack', 'huduma', credentials.appPassword],
    [
      'server/.env.test',
      'hudumatrack_test',
      'huduma_test',
      credentials.testPassword,
    ],
  ];
  const configs = [];
  for (const [relative, database, user, password] of files) {
    const file = path.join(root, relative);
    if (!(await exists(file))) {
      const example = await readFile(
        path.join(
          root,
          relative === 'server/.env'
            ? 'server/.env.example'
            : 'server/.env.test.example',
        ),
        'utf8',
      );
      const values = {
        DB_HOST: '127.0.0.1',
        DB_PORT: '3306',
        DB_NAME: database,
        DB_USER: user,
        DB_PASSWORD: password,
        JWT_SECRET: secret(),
        FRONTEND_ORIGIN: 'http://localhost:5174',
        SEED_ADMIN_PASSWORD: secret(),
      };
      const content = example.replace(/^([A-Z_]+)=(.*)$/gm, (line, key) =>
        key in values ? `${key}=${values[key]}` : line,
      );
      await writeFile(file, content, { flag: 'wx' });
      console.log(
        `Created ${relative}; credentials are stored there, not in source code.`,
      );
    }
    configs.push(dotenv.parse(await readFile(file)));
  }
  return configs;
}
async function provision(credentials, configs) {
  const c = await connection(credentials);
  try {
    for (const config of configs) {
      if (
        !/^[a-zA-Z0-9_]+$/.test(config.DB_NAME) ||
        !/^[a-zA-Z0-9_]+$/.test(config.DB_USER)
      )
        throw new Error(
          'Local setup supports simple database and user names only.',
        );
      await c.query(
        `CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(config.DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
      );
      await c.query(
        `CREATE USER IF NOT EXISTS ${mysql.escape(config.DB_USER)}@'localhost' IDENTIFIED BY ${mysql.escape(config.DB_PASSWORD)}`,
      );
      await c.query(
        `GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES ON ${mysql.escapeId(config.DB_NAME)}.* TO ${mysql.escape(config.DB_USER)}@'localhost'`,
      );
    }
  } finally {
    await c.end();
  }
  console.log('Development and separate test databases are configured.');
}
try {
  if (process.platform !== 'win32')
    throw new Error(
      'This portable helper supports Windows only; use the README for other platforms.',
    );
  await mkdir(local, { recursive: true });
  const command = process.argv[2] || 'start';
  let credentials;
  if (await exists(credentialsFile))
    credentials = JSON.parse(await readFile(credentialsFile, 'utf8'));
  else if (command === 'setup') {
    credentials = {
      rootPassword: secret(),
      appPassword: secret(),
      testPassword: secret(),
    };
    await writeFile(credentialsFile, JSON.stringify(credentials, null, 2), {
      flag: 'wx',
    });
  } else
    throw new Error(
      'Run npm run mysql:setup once after extracting the official archive.',
    );
  if (command === 'setup') {
    await initialise(credentials);
    await provision(credentials, await environment(credentials));
  } else if (command === 'start') await launch(credentials);
  else if (command === 'stop') {
    const pid = Number(await readFile(path.join(local, 'mysql.pid'), 'utf8'));
    const c = await connection(credentials);
    try {
      await c.query('SHUTDOWN');
    } finally {
      await c.end();
    }
    // SHUTDOWN returns before InnoDB has released its files. Wait for the process,
    // so an immediate start cannot collide with the old database's file locks.
    for (let attempt = 0; attempt < 60; attempt++) {
      let running = true;
      try {
        process.kill(pid, 0);
      } catch (error) {
        if (error.code === 'ESRCH') running = false;
        else throw error;
      }
      if (!running) break;
      if (attempt === 59)
        throw new Error(
          'MySQL is still shutting down; inspect .local/mysql-error.log before restarting.',
        );
      await delay(500);
    }
    console.log('Project MySQL stopped.');
  } else throw new Error('Use setup, start or stop.');
} catch (error) {
  console.error(`Local MySQL: ${error.code || error.message}`);
  process.exitCode = 1;
}
