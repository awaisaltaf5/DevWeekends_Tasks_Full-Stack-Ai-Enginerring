import { type Server } from 'node:http';
import { createApp } from '../app';
import { connectDB } from '../config/db';

/**
 * Smoke test — boots the API on an ephemeral port and exercises the
 * authentication paths that do NOT require a live MongoDB connection:
 *   - GET  /api/health
 *   - validation rejections (missing/invalid fields) -> 400
 *   - JWT guard rejections (missing/invalid token)     -> 401
 *
 * Run with:  npm run smoke
 *
 * For full register/login/role flows, configure MONGODB_URI and run
 * `npm run test:auth`.
 */
interface JsonBody {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

async function request(
  method: string,
  base: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<{ status: number; json: JsonBody }> {
  const response = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = (await response.json()) as JsonBody;
  return { status: response.status, json };
}

async function main(): Promise<void> {
  await connectDB();
  const app = createApp();
  const server: Server = app.listen(0);

  const addr = server.address();
  const port =
    typeof addr === 'object' && addr !== null
      ? Array.isArray(addr)
        ? addr[0].port
        : addr.port
      : 0;
  const base = `http://127.0.0.1:${port}/api`;

  let checks = 0;
  let failures = 0;
  const expect = (name: string, condition: boolean): void => {
    checks += 1;
    if (condition) {
      console.log(`  PASS  ${name}`);
    } else {
      failures += 1;
      console.log(`  FAIL  ${name}`);
    }
  };

  console.log(`\n[Docly] Smoke test against ${base}\n`);

  // 1. Health (no DB needed).
  const health = await request('GET', base, '/health');
  expect('GET /api/health -> 200 ok', health.status === 200 && !!health.json.success);

  // 2. Login validation: missing credentials -> 400.
  const loginEmpty = await request('POST', base, '/auth/login', {});
  expect('POST /api/auth/login (missing fields) -> 400', loginEmpty.status === 400);

  // 3. Register validation: invalid email -> 400.
  const registerBadEmail = await request('POST', base, '/auth/register', {
    name: 'Alice',
    email: 'not-an-email',
    password: 'secret123',
  });
  expect('POST /api/auth/register (invalid email) -> 400', registerBadEmail.status === 400);

  // 4. Register validation: short password -> 400.
  const registerShortPass = await request('POST', base, '/auth/register', {
    name: 'Alice',
    email: 'alice@example.com',
    password: '123',
  });
  expect('POST /api/auth/register (short password) -> 400', registerShortPass.status === 400);

  // 5. Protected route: missing token -> 401.
  const noToken = await request('GET', base, '/protected/patient');
  expect('GET /api/protected/patient (no token) -> 401', noToken.status === 401);

  // 6. Protected route: invalid token -> 401.
  const badToken = await request('GET', base, '/protected/patient', undefined, 'not.a.real.token');
  expect('GET /api/protected/patient (invalid token) -> 401', badToken.status === 401);

  // 7. Get me: missing token -> 401.
  const meNoToken = await request('GET', base, '/auth/me');
  expect('GET /api/auth/me (no token) -> 401', meNoToken.status === 401);

  server.close();
  console.log(`\n[Docly] smoke result: ${checks - failures}/${checks} passed`);
  if (failures > 0) {
    process.exitCode = 1;
  } else {
    console.log('[Docly] Run `npm run test:auth` after configuring MONGODB_URI for full flows.');
  }
}

void main();