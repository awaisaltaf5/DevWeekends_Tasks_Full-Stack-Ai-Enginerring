// StayNest account (profile + password) API test suite (Node.js native fetch).
// Run from the backend directory with the backend running:
//   node tests/account.test.mjs
import 'dotenv/config'

const base = 'http://127.0.0.1:5000'
const ts = Date.now()
const email = `account_${ts}@example.com`
const originalPassword = 'password123'
const newPassword = 'newpass456'

let pass = 0
let fail = 0
const check = (label, cond, extra = '') => {
  if (cond) {
    pass += 1
    console.log(`  OK    ${label} ${extra}`)
  } else {
    fail += 1
    console.log(`  FAIL  ${label} ${extra}`)
  }
}

async function api(method, path, { body, token } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data }
}

console.log('===== STAYNEST ACCOUNT TEST SUITE =====\n')

// -- Setup ----------------------------------------------------------------
let r = await api('POST', '/api/auth/register', {
  body: { name: 'Account User', email, password: originalPassword },
})
const token = r.data?.token
check('Setup register', r.status === 201 && !!token, `-> HTTP ${r.status}`)

// -- Update profile -------------------------------------------------------
// 1. Update name + preferences
r = await api('PUT', '/api/auth/profile', {
  token,
  body: {
    name: 'Updated Name',
    preferences: { currency: 'USD', emailNotifications: false },
  },
})
check(
  '1 Update profile (name + preferences)',
  r.status === 200 &&
    r.data?.user?.name === 'Updated Name' &&
    r.data?.user?.preferences?.currency === 'USD' &&
    r.data?.user?.preferences?.emailNotifications === false &&
    r.data?.user?.password === undefined,
  `-> HTTP ${r.status} name=${r.data?.user?.name} cur=${r.data?.user?.preferences?.currency} pwLeaked=${r.data?.user?.password !== undefined}`
)

// 2. Update email
r = await api('PUT', '/api/auth/profile', {
  token,
  body: { email: `renamed_${ts}@example.com` },
})
check(
  '2 Update email',
  r.status === 200 && r.data?.user?.email === `renamed_${ts}@example.com`,
  `-> HTTP ${r.status} email=${r.data?.user?.email}`
)

// 3. Profile without auth -> 401
r = await api('PUT', '/api/auth/profile', { body: { name: 'No Auth' } })
check('3 Profile without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// -- Change password ------------------------------------------------------
// 4. Wrong current password -> 400
r = await api('PUT', '/api/auth/change-password', {
  token,
  body: { currentPassword: 'wrongpassword', newPassword },
})
check('4 Wrong current password -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

// 5. Missing fields -> 400
r = await api('PUT', '/api/auth/change-password', {
  token,
  body: { currentPassword: originalPassword },
})
check('5 Missing new password -> 400', r.status === 400, `-> HTTP ${r.status}`)

// 6. Change password (valid) -> 200, no password returned
r = await api('PUT', '/api/auth/change-password', {
  token,
  body: { currentPassword: originalPassword, newPassword },
})
check(
  '6 Change password (valid)',
  r.status === 200 && r.data?.user?.password === undefined,
  `-> HTTP ${r.status} msg="${r.data?.message}" pwLeaked=${r.data?.user?.password !== undefined}`
)

// 7. Login with the NEW password -> 200
r = await api('POST', '/api/auth/login', {
  body: { email: `renamed_${ts}@example.com`, password: newPassword },
})
check('7 Login with new password', r.status === 200 && !!r.data?.token, `-> HTTP ${r.status}`)
const newToken = r.data?.token

// 8. Login with the OLD password -> 401
r = await api('POST', '/api/auth/login', {
  body: { email: `renamed_${ts}@example.com`, password: originalPassword },
})
check('8 Login with old password -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 9. Change-password without login -> 401
r = await api('PUT', '/api/auth/change-password', {
  body: { currentPassword: newPassword, newPassword: 'another123' },
})
check('9 Change password without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 10. me returns updated profile (no password)
r = await api('GET', '/api/auth/me', { token: newToken })
check(
  '10 me reflects updated profile',
  r.status === 200 &&
    r.data?.user?.name === 'Updated Name' &&
    r.data?.user?.password === undefined,
  `-> HTTP ${r.status} name=${r.data?.user?.name}`
)

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`)
process.exit(fail ? 1 : 0)
