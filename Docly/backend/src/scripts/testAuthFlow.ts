import { type Server } from 'node:http';
import { createApp } from '../app';
import { connectDB } from '../config/db';
import { hasMongoUri } from '../config/env';

/**
 * Full authentication integration test.
 *
 * Requires a working MONGODB_URI in backend/.env:
 *   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/docly
 *
 * Run with:  npm run test:auth
 *
 * Covers: registration recovery codes and password reset, patient/doctor
 * registration & login, duplicate + invalid login, protected access, and
 * role-based authorization.
 */
interface JsonBody {
  success?: boolean;
  message?: string;
  token?: string;
  user?: { id?: string; role?: string; password?: string; recoveryCodes?: unknown };
  recoveryCodes?: string[];
  accessedBy?: string;
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
  if (!hasMongoUri()) {
    console.log('\n[Docly] test:auth SKIPPED - set MONGODB_URI in backend/.env first.');
    console.log('  Example: MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/docly');
    return;
  }

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
  const expect = (name: string, condition: boolean, extra = ''): void => {
    checks += 1;
    if (condition) {
      console.log(`  PASS  ${name}${extra ? ` (${extra})` : ''}`);
    } else {
      failures += 1;
      console.log(`  FAIL  ${name}${extra ? ` (${extra})` : ''}`);
    }
  };

  const ts = Date.now();
  const email = (role: string) => `auth.test.${role}.${ts}@docly.dev`;
  const recoveryCodes = ['DOC-ABC123-001122334455', 'DOC-DEF456-66778899AABB', 'DOC-123ABC-CCDDEEFF0011'];

  console.log(`\n[Docly] Auth integration test against ${base}\n`);

  // --- Patient registration ---
  const patientReg = await request('POST', base, '/auth/register', {
    name: 'Test Patient',
    email: email('patient'),
    password: 'secret123',
    role: 'patient',
    recoveryCodes,
  });
  expect('POST /api/auth/register (patient) -> 201', patientReg.status === 201);
  expect('patient role stored', patientReg.json.user?.role === 'patient');
  expect('patient token issued', typeof patientReg.json.token === 'string');
  expect('password not exposed', patientReg.json.user?.password === undefined);
  expect('recovery codes are not echoed by registration', patientReg.json.recoveryCodes === undefined);
  expect('recovery hashes not exposed', patientReg.json.user?.recoveryCodes === undefined);
  const patientToken = patientReg.json.token ?? '';

  // --- Recovery code reset ---
  const returnedRecoveryCodes = recoveryCodes;
  const invalidRecovery = await request('POST', base, '/auth/password-reset', {
    email: email('patient'),
    recoveryCode: 'DOC-INVALID-INVALID',
    password: 'newsecret123',
  });
  expect('invalid recovery code -> 400', invalidRecovery.status === 400);
  const passwordReset = await request('POST', base, '/auth/password-reset', {
    email: email('patient'),
    recoveryCode: returnedRecoveryCodes[0],
    password: 'newsecret123',
  });
  expect('valid recovery code resets password -> 200', passwordReset.status === 200);
  const reusedRecovery = await request('POST', base, '/auth/password-reset', {
    email: email('patient'),
    recoveryCode: returnedRecoveryCodes[0],
    password: 'anothersecret123',
  });
  expect('used recovery code cannot be reused -> 400', reusedRecovery.status === 400);
  const resetLogin = await request('POST', base, '/auth/login', {
    email: email('patient'),
    password: 'newsecret123',
  });
  expect('login with reset password -> 200', resetLogin.status === 200);
// --- Duplicate email rejection ---
  const dup = await request('POST', base, '/auth/register', {
    name: 'Test Patient 2',
    email: email('patient'),
    password: 'secret123',
  });
  expect('duplicate email -> 400', dup.status === 400);

  // --- Admin cannot be created via public register ---
  const adminAttempt = await request('POST', base, '/auth/register', {
    name: 'Fake Admin',
    email: email('fakeadmin'),
    password: 'secret123',
    role: 'admin',
  });
  expect('register with role=admin not granted', adminAttempt.json.user?.role !== 'admin');

  // --- Patient login ---
  const patientLogin = await request('POST', base, '/auth/login', {
    email: email('patient'),
    password: 'newsecret123',
  });
  expect('POST /api/auth/login (patient) -> 200', patientLogin.status === 200);

  // --- Invalid login (wrong password) ---
  const badLogin = await request('POST', base, '/auth/login', {
    email: email('patient'),
    password: 'wrong-password',
  });
  expect('invalid password -> 401', badLogin.status === 401);

  // --- Invalid login (unknown email) ---
  const unknownLogin = await request('POST', base, '/auth/login', {
    email: 'nobody@docly.dev',
    password: 'secret123',
  });
  expect('unknown email -> 401', unknownLogin.status === 401);

  // --- Get current user ---
  const me = await request('GET', base, '/auth/me', undefined, patientToken);
  expect('GET /api/auth/me (patient token) -> 200', me.status === 200);
  expect('me role is patient', me.json.user?.role === 'patient');

  // --- Doctor registration & login ---
  const doctorReg = await request('POST', base, '/auth/register', {
    name: 'Test Doctor',
    email: email('doctor'),
    password: 'secret123',
    role: 'doctor',
    recoveryCodes: ['DOC-AAA111-001122334455', 'DOC-BBB222-66778899AABB', 'DOC-CCC333-CCDDEEFF0011'],
  });
  expect('register (doctor) -> 201', doctorReg.status === 201);
  expect('doctor role stored', doctorReg.json.user?.role === 'doctor');
  const doctorToken = doctorReg.json.token ?? '';
// --- Role-based access: patient on patient route ---
  const p = await request('GET', base, '/protected/patient', undefined, patientToken);
  expect('patient -> /protected/patient -> 200', p.status === 200);
  expect('patient route accessedBy = patient', p.json.accessedBy === 'patient');

  // --- Role-based access: doctor on patient route (denied) ---
  const doctorOnPatient = await request('GET', base, '/protected/patient', undefined, doctorToken);
  expect('doctor -> /protected/patient -> 403', doctorOnPatient.status === 403);

  // --- Role-based access: doctor on doctor route ---
  const d = await request('GET', base, '/protected/doctor', undefined, doctorToken);
  expect('doctor -> /protected/doctor -> 200', d.status === 200);

  // --- Role-based access: patient on doctor route (denied) ---
  const patientOnDoctor = await request('GET', base, '/protected/doctor', undefined, patientToken);
  expect('patient -> /protected/doctor -> 403', patientOnDoctor.status === 403);

  // --- Missing token ---
  const missing = await request('GET', base, '/protected/patient');
  expect('no token -> /protected/patient -> 401', missing.status === 401);

  // --- Invalid token ---
  const invalid = await request('GET', base, '/protected/patient', undefined, 'bad.token.value');
  expect('invalid token -> /protected/patient -> 401', invalid.status === 401);

  // --- Admin route: patient denied (admin tested via seed:admin separately) ---
  const patientOnAdmin = await request('GET', base, '/protected/admin', undefined, patientToken);
  expect('patient -> /protected/admin -> 403', patientOnAdmin.status === 403);

  server.close();
  console.log(`\n[Docly] test:auth result: ${checks - failures}/${checks} passed`);
  if (failures > 0) {
    process.exitCode = 1;
  }
}

void main();