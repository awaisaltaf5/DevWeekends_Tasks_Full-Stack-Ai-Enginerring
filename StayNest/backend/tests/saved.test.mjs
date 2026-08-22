// StayNest saved-hotels API test suite (Node.js native fetch).
// Run from the backend directory with the backend running:
//   node tests/saved.test.mjs
import 'dotenv/config'
import mongoose from 'mongoose'

const base = 'http://127.0.0.1:5000'
const ts = Date.now()
const userA = { name: 'Alice Save', email: `alice_save_${ts}@example.com`, password: 'password123' }

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

console.log('===== STAYNEST SAVED HOTELS TEST SUITE =====\n')

let r = await api('POST', '/api/auth/register', { body: userA })
const token = r.data?.token
check('Setup register user', r.status === 201 && !!token, `-> HTTP ${r.status}`)

r = await api('GET', '/api/hotels')
const hotels = r.data?.hotels || []
const hotel1 = hotels[0]
const hotel2 = hotels[1]
check('Setup hotels available', !!hotel1?.id && !!hotel2?.id, `h1=${hotel1?.id} h2=${hotel2?.id}`)

// 1. Save hotel (authenticated)
r = await api('POST', '/api/saved', { token, body: { hotel: hotel1.id } })
check(
  '1 Save hotel',
  r.status === 201 && r.data?.saved?.hotel?.id === hotel1.id,
  `-> HTTP ${r.status} saved=${r.data?.saved?.id}`
)

// 2. Duplicate save -> idempotent (200, same saved row, no new row)
r = await api('POST', '/api/saved', { token, body: { hotel: hotel1.id } })
check(
  '2 Duplicate save is idempotent',
  r.status === 200 && r.data?.saved?.hotel?.id === hotel1.id,
  `-> HTTP ${r.status}`
)

// 3. Save a second hotel
r = await api('POST', '/api/saved', { token, body: { hotel: hotel2.id } })
check('3 Save second hotel', r.status === 201 && r.data?.saved?.hotel?.id === hotel2.id, `-> HTTP ${r.status}`)

// 4. Save without login -> 401
r = await api('POST', '/api/saved', { body: { hotel: hotel1.id } })
check('4 Save without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 5. GET saved -> includes both, no duplicates
r = await api('GET', '/api/saved', { token })
const ids = (r.data?.saved || []).map((s) => s.hotel?.id)
const unique = new Set(ids).size === ids.length
check(
  '5 List saved hotels',
  r.status === 200 && ids.includes(hotel1.id) && ids.includes(hotel2.id) && unique,
  `-> HTTP ${r.status} count=${r.data?.count} unique=${unique}`
)

// 6. Remove hotel 1
r = await api('DELETE', `/api/saved/${hotel1.id}`, { token })
check('6 Remove saved hotel', r.status === 200, `-> HTTP ${r.status} "${r.data?.message}"`)

// 7. Verify removal persisted
r = await api('GET', '/api/saved', { token })
ids.length = 0
;(r.data?.saved || []).forEach((s) => ids.push(s.hotel?.id))
check(
  '7 Removal persisted',
  r.status === 200 && !ids.includes(hotel1.id) && ids.includes(hotel2.id),
  `-> HTTP ${r.status} ids=${JSON.stringify(ids)}`
)

// 8. Removing an unsaved hotel is a no-op success
r = await api('DELETE', `/api/saved/${hotel1.id}`, { token })
check('8 Remove unsaved hotel (no-op)', r.status === 200, `-> HTTP ${r.status}`)

// 9. Remove without login -> 401
r = await api('DELETE', `/api/saved/${hotel1.id}`)
check('9 Remove without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 10. Another user cannot see the first user's saved hotels (scoped list)
const userB = { name: 'Bob Save', email: `bob_save_${ts}@example.com`, password: 'password123' }
r = await api('POST', '/api/auth/register', { body: userB })
const tokenB = r.data?.token
r = await api('GET', '/api/saved', { token: tokenB })
check(
  '10 Saved lists are per-user',
  r.status === 200 && (r.data?.saved || []).length === 0,
  `-> HTTP ${r.status} count=${r.data?.count}`
)

// 11. DB-level duplicate prevention (unique compound index)
await mongoose.connect(process.env.MONGODB_URI)
const { default: SavedHotel } = await import('../src/models/SavedHotel.js')
const { default: User } = await import('../src/models/User.js')
const dupUser = await User.create({
  name: 'Dup Test',
  email: `dup_${ts}@example.com`,
  password: 'password123',
})
await SavedHotel.deleteMany({ user: dupUser._id })
await SavedHotel.create({ user: dupUser._id, hotel: hotel1.id })
let duplicateBlocked = false
try {
  await SavedHotel.create({ user: dupUser._id, hotel: hotel1.id })
} catch (err) {
  duplicateBlocked = err.code === 11000
}
// Clean up the duplicate-check user.
await SavedHotel.deleteMany({ user: dupUser._id })
await User.deleteOne({ _id: dupUser._id })
await mongoose.disconnect()
check('11 DB unique index blocks duplicates', duplicateBlocked, `blocked=${duplicateBlocked}`)

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`)
process.exit(fail ? 1 : 0)
