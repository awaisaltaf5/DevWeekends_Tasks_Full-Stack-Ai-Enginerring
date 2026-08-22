// StayNest reviews API test suite (Node.js native fetch).
// Run from the backend directory with the backend running:
//   node tests/reviews.test.mjs
import 'dotenv/config'
import mongoose from 'mongoose'

const base = 'http://127.0.0.1:5000'
const ts = Date.now()
const userA = { name: 'Alice Rev', email: `alice_rev_${ts}@example.com`, password: 'password123' }
const userB = { name: 'Bob Rev', email: `bob_rev_${ts}@example.com`, password: 'password123' }

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

console.log('===== STAYNEST REVIEWS TEST SUITE =====\n')

// -- Setup ----------------------------------------------------------------
let r = await api('POST', '/api/auth/register', { body: userA })
const tokenA = r.data?.token
check('Setup register user A', r.status === 201 && !!tokenA, `-> HTTP ${r.status}`)

r = await api('POST', '/api/auth/register', { body: userB })
const tokenB = r.data?.token
check('Setup register user B', r.status === 201 && !!tokenB, `-> HTTP ${r.status}`)

r = await api('GET', '/api/hotels')
const hotel = r.data?.hotels?.[0]
check('Setup a hotel is available', !!hotel?.id, `-> hotel=${hotel?.id}`)
const hotelId = hotel?.id

// Clear any leftover reviews for this hotel so count/rating assertions are
// deterministic regardless of prior test runs against the shared Atlas DB.
const { default: Review } = await import('../src/models/Review.js')
await mongoose.connect(process.env.MONGODB_URI)
await Review.deleteMany({ hotel: hotelId })
await mongoose.disconnect()

// 1. GET reviews (public) -> empty at first
r = await api('GET', `/api/hotels/${hotelId}/reviews`)
check('1 List reviews (public, empty)', r.status === 200 && r.data?.count === 0, `-> HTTP ${r.status} count=${r.data?.count}`)

// 2. Create a review (authenticated) -> 201
r = await api('POST', `/api/hotels/${hotelId}/reviews`, {
  token: tokenA,
  body: { rating: 5, comment: 'Amazing stay!' },
})
const reviewA = r.data?.review
check(
  '2 Create review (authenticated)',
  r.status === 201 && reviewA?.rating === 5 && reviewA?.user?.name === 'Alice Rev',
  `-> HTTP ${r.status} review=${reviewA?.id}`
)

// 3. Create review without login -> 401
r = await api('POST', `/api/hotels/${hotelId}/reviews`, {
  body: { rating: 4, comment: 'no auth' },
})
check('3 Create review without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 4. Rating validation (0 and 6) -> 400
r = await api('POST', `/api/hotels/${hotelId}/reviews`, { token: tokenB, body: { rating: 0 } })
check('4a Rating 0 -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)
r = await api('POST', `/api/hotels/${hotelId}/reviews`, { token: tokenB, body: { rating: 6 } })
check('4b Rating 6 -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

// 5. Duplicate review (same user + hotel) -> idempotent (existing, not 201)
r = await api('POST', `/api/hotels/${hotelId}/reviews`, {
  token: tokenA,
  body: { rating: 3, comment: 'duplicate attempt' },
})
check(
  '5 Duplicate review blocked (returned existing)',
  r.status === 200 && r.data?.existing === true && r.data?.review?.id === reviewA?.id && r.data?.review?.rating === 5,
  `-> HTTP ${r.status} existing=${r.data?.existing} rating=${r.data?.review?.rating}`
)

// 6. Second user reviews -> 201
r = await api('POST', `/api/hotels/${hotelId}/reviews`, {
  token: tokenB,
  body: { rating: 3, comment: 'Good value' },
})
const reviewB = r.data?.review
check('6 Second user reviews', r.status === 201 && reviewB?.rating === 3, `-> HTTP ${r.status}`)

// 7. Hotel rating / reviewCount recomputed
r = await api('GET', `/api/hotels/${hotelId}`)
const avg = (5 + 3) / 2 // 4
check(
  '7 Hotel rating/count updated',
  r.status === 200 && r.data?.hotel?.reviewCount === 2 && r.data?.hotel?.rating === avg,
  `-> HTTP ${r.status} rating=${r.data?.hotel?.rating} count=${r.data?.hotel?.reviewCount}`
)

// 8. Listing includes both, newest first
r = await api('GET', `/api/hotels/${hotelId}/reviews`)
const ids = (r.data?.reviews || []).map((rv) => rv.id)
check(
  '8 List reviews (2, newest first)',
  r.status === 200 && r.data?.count === 2 && ids[0] === reviewB?.id && ids.includes(reviewA?.id),
  `-> HTTP ${r.status} order=${ids[0] === reviewB?.id}`
)

// 9. Update own review (owner) -> 200
r = await api('PUT', `/api/reviews/${reviewA.id}`, {
  token: tokenA,
  body: { rating: 4, comment: 'Updated review' },
})
check(
  '9 Update own review',
  r.status === 200 && r.data?.review?.rating === 4 && r.data?.review?.comment === 'Updated review',
  `-> HTTP ${r.status} rating=${r.data?.review?.rating}`
)

// 10. Update another user's review -> 404 (owner-only, no leak)
r = await api('PUT', `/api/reviews/${reviewA.id}`, { token: tokenB, body: { rating: 1 } })
check('10 Another user cannot edit review -> 404', r.status === 404, `-> HTTP ${r.status} "${r.data?.message}"`)

// 11. Update without login -> 401
r = await api('PUT', `/api/reviews/${reviewA.id}`, { body: { rating: 2 } })
check('11 Update review without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 12. Hotel rating recomputed after edit
r = await api('GET', `/api/hotels/${hotelId}`)
const avgAfterEdit = (4 + 3) / 2 // 3.5
check('12 Rating recomputed after edit', r.status === 200 && r.data?.hotel?.rating === avgAfterEdit, `-> HTTP ${r.status} rating=${r.data?.hotel?.rating}`)

// 13. Delete own review (owner) -> 200
r = await api('DELETE', `/api/reviews/${reviewB.id}`, { token: tokenB })
check('13 Delete own review', r.status === 200, `-> HTTP ${r.status} "${r.data?.message}"`)

// 14. Delete another user's review -> 404
r = await api('DELETE', `/api/reviews/${reviewA.id}`, { token: tokenB })
check('14 Another user cannot delete review -> 404', r.status === 404, `-> HTTP ${r.status}`)

// 15. Delete without login -> 401
r = await api('DELETE', `/api/reviews/${reviewA.id}`)
check('15 Delete review without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 16. Hotel rating/count recomputed after delete (only A's review remains)
r = await api('GET', `/api/hotels/${hotelId}`)
check('16 Rating recomputed after delete', r.status === 200 && r.data?.hotel?.reviewCount === 1 && r.data?.hotel?.rating === 4, `-> HTTP ${r.status} rating=${r.data?.hotel?.rating} count=${r.data?.hotel?.reviewCount}`)

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`)
process.exit(fail ? 1 : 0)
