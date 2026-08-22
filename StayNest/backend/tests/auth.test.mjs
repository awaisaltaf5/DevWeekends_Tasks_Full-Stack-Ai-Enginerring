// StayNest backend auth test suite (Node.js native fetch — no shell quoting issues).
// Run from the backend directory:  node tests/auth.test.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const base = 'http://127.0.0.1:5000';
const email = `auto_${Date.now()}@example.com`;
const pw = 'password123';

let pass = 0;
let fail = 0;
const check = (label, cond, extra = '') => {
  if (cond) {
    pass += 1;
    console.log(`  OK    ${label} ${extra}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${label} ${extra}`);
  }
};

async function api(method, path, { body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, data };
}

console.log('===== STAYNEST AUTH TEST SUITE (Node fetch) =====');
console.log(`email under test: ${email}\n`);

// 1. Register (valid)
let r = await api('POST', '/api/auth/register', {
  body: { name: 'Jane Doe', email, password: pw },
});
check(
  '1 Register (valid)',
  r.status === 201 && !!r.data?.token && !r.data?.user?.password,
  `-> HTTP ${r.status} token=${!!r.data?.token} pwLeaked=${!!r.data?.user?.password}`
);

// 2. Duplicate email
r = await api('POST', '/api/auth/register', {
  body: { name: 'Jane Two', email, password: pw },
});
check('2 Duplicate email', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`);

// 3. Login (correct)
r = await api('POST', '/api/auth/login', {
  body: { email, password: pw },
});
const token = r.data?.token;
check(
  '3 Login (correct)',
  r.status === 200 && !!token && r.data?.user?.role === 'user' && !r.data?.user?.password,
  `-> HTTP ${r.status} token=${!!token} role=${r.data?.user?.role} pwLeaked=${!!r.data?.user?.password}`
);

// 4. Wrong password
r = await api('POST', '/api/auth/login', {
  body: { email, password: 'wrongpassword' },
});
check('4 Wrong password', r.status === 401, `-> HTTP ${r.status} "${r.data?.message}"`);

// 5a. Protected route (me) without token
r = await api('GET', '/api/auth/me');
check('5a Protected (no token)', r.status === 401, `-> HTTP ${r.status} "${r.data?.message}"`);

// 5b. Protected route (me) with token
r = await api('GET', '/api/auth/me', { token });
check(
  '5b Protected (with token)',
  r.status === 200 && r.data?.user?.email === email,
  `-> HTTP ${r.status} email=${r.data?.user?.email}`
);

// 6a. Admin route without token
r = await api('GET', '/api/admin/users');
check('6a Admin (no token)', r.status === 401, `-> HTTP ${r.status} "${r.data?.message}"`);

// 6b. Admin route with non-admin token -> 403
r = await api('GET', '/api/admin/users', { token });
check('6b Admin (user token) -> 403', r.status === 403, `-> HTTP ${r.status} "${r.data?.message}"`);

// 6c. Promote to admin, re-login, admin route -> 200
await mongoose.connect(process.env.MONGODB_URI);
const promoted = await User.findOneAndUpdate(
  { email },
  { role: 'admin' },
  { returnDocument: 'after' }
);
await mongoose.disconnect();
check('6c-1 promote to admin', !!promoted && promoted.role === 'admin', `role=${promoted?.role}`);
r = await api('POST', '/api/auth/login', { body: { email, password: pw } });
const adminToken = r.data?.token;
r = await api('GET', '/api/admin/users', { token: adminToken });
check(
  '6c-2 Admin (admin token) -> 200',
  r.status === 200 && Array.isArray(r.data?.users),
  `-> HTTP ${r.status} count=${r.data?.count}`
);
r = await api('GET', '/api/auth/me', { token: adminToken });
check('6c-3 me role admin', r.data?.user?.role === 'admin', `role=${r.data?.user?.role}`);

// 7. Logout
r = await api('POST', '/api/auth/logout', { token });
check('7 Logout', r.status === 200, `-> HTTP ${r.status} "${r.data?.message}"`);

// 8. Validation (bad name/email/password)
r = await api('POST', '/api/auth/register', {
  body: { name: 'ab', email: 'not-an-email', password: '123' },
});
check('8 Validation (bad input)', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`);

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
