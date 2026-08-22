// StayNest booking API test suite (Node.js native fetch).
// Run from the backend directory with the backend running:
//   node tests/booking.test.mjs
import 'dotenv/config'
import mongoose from 'mongoose'
import Booking from '../src/models/Booking.js'

const base = 'http://127.0.0.1:5000'
const ts = Date.now()
const userA = { name: 'Alice A', email: `alice_${ts}@example.com`, password: 'password123' }
const userB = { name: 'Bob B', email: `bob_${ts}@example.com`, password: 'password123' }

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
  try { data = await res.json() } catch { /* non-JSON */ }
  return { status: res.status, data }
}

// Helper: ISO date string offset `days` from today (UTC midnight).
const dateOffset = (days) => {
  const d = new Date(Date.now() + days * 86400000)
  return d.toISOString().split('T')[0]
}

console.log('===== STAYNEST BOOKING TEST SUITE =====\n')

// --- Setup: register two users, pick an active hotel ---
let r = await api('POST', '/api/auth/register', { body: userA })
const tokenA = r.data?.token
check('Setup register user A', r.status === 201 && !!tokenA, `-> HTTP ${r.status}`)

r = await api('POST', '/api/auth/register', { body: userB })
const tokenB = r.data?.token
check('Setup register user B', r.status === 201 && !!tokenB, `-> HTTP ${r.status}`)

r = await api('GET', '/api/hotels')
const hotel = r.data?.hotels?.find((h) => (h.roomTypes || []).length > 0)
check('Setup a hotel is available', !!hotel?.id && !!hotel?.roomTypes?.length, `-> hotel=${hotel?.id}`)
const hotelId = hotel?.id
const pricePerNight = hotel?.pricePerNight
const roomType = hotel?.roomTypes[0]

// 1. Book hotel while logged in (valid)
const nights = 3
const rooms = 2
r = await api('POST', '/api/bookings', {
  token: tokenA,
  body: {
    hotel: hotelId,
    roomType,
    checkIn: dateOffset(2),
    checkOut: dateOffset(2 + nights),
    guests: 4,
    numberOfRooms: rooms,
  },
})
const booking = r.data?.booking
check(
  '1 Book hotel (logged in)',
  r.status === 201 && !!booking?.id && booking.hotel?.id === hotelId,
  `-> HTTP ${r.status} booking=${booking?.id}`
)

// 2. Backend price calculation (server-authoritative) + multiple rooms.
const expectedTotal = Math.round(pricePerNight * nights * rooms)
check(
  '2 Price calculated on backend',
  booking?.pricePerNight === pricePerNight &&
    booking?.numberOfRooms === rooms &&
    booking?.totalPrice === expectedTotal,
  `-> nights=${nights} rooms=${rooms} expected=${expectedTotal} got=${booking?.totalPrice}`
)

// 3. Tampered totalPrice from client is ignored (server recalculates).
r = await api('POST', '/api/bookings', {
  token: tokenA,
  body: {
    hotel: hotelId,
    roomType,
    checkIn: dateOffset(2),
    checkOut: dateOffset(5),
    guests: 2,
    numberOfRooms: 1,
    totalPrice: 1,               // malicious client value — must be ignored
    pricePerNight: 1,            // also ignored/overwritten
  },
})
const tampered = r.data?.booking
check(
  '3 Client-tampered price ignored',
  r.status === 201 &&
    tampered?.totalPrice === Math.round(pricePerNight * 3 * 1) &&
    tampered?.pricePerNight === pricePerNight,
  `-> expected ${Math.round(pricePerNight * 3)} got ${tampered?.totalPrice}`
)

// 4. Try booking without login -> 401
r = await api('POST', '/api/bookings', {
  body: { hotel: hotelId, roomType, checkIn: dateOffset(2), checkOut: dateOffset(5), guests: 2, numberOfRooms: 1 },
})
check('4 Booking without login -> 401', r.status === 401, `-> HTTP ${r.status} "${r.data?.message}"`)

// 5. Invalid dates (check-in after check-out) -> 400
r = await api('POST', '/api/bookings', {
  token: tokenA,
  body: { hotel: hotelId, roomType, checkIn: dateOffset(5), checkOut: dateOffset(2), guests: 2, numberOfRooms: 1 },
})
check('5 Invalid dates (check-in after check-out) -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

// 6. Guests / rooms must be positive -> 400
r = await api('POST', '/api/bookings', {
  token: tokenA,
  body: { hotel: hotelId, roomType, checkIn: dateOffset(2), checkOut: dateOffset(5), guests: 0, numberOfRooms: 1 },
})
check('6a Guests zero -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

r = await api('POST', '/api/bookings', {
  token: tokenA,
  body: { hotel: hotelId, roomType, checkIn: dateOffset(2), checkOut: dateOffset(5), guests: 2, numberOfRooms: 0 },
})
check('6b Rooms zero -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

// 7. View booking (detail) -> 200, owned by user A.
r = await api('GET', `/api/bookings/${booking.id}`, { token: tokenA })
check(
  '7 Get booking by id (owner)',
  r.status === 200 && r.data?.booking?.id === booking.id && r.data?.booking?.hotel?.id === hotelId,
  `-> HTTP ${r.status}`
)

// 8. List bookings -> includes the owned booking.
r = await api('GET', '/api/bookings', { token: tokenA })
check(
  '8 List my bookings',
  r.status === 200 && Array.isArray(r.data?.bookings) && r.data.bookings.some((b) => b.id === booking.id),
  `-> HTTP ${r.status} count=${r.data?.count}`
)

// 9. Another user cannot access this booking (GET) -> 404.
r = await api('GET', `/api/bookings/${booking.id}`, { token: tokenB })
check('9 Another user cannot view booking -> 404', r.status === 404, `-> HTTP ${r.status} "${r.data?.message}"`)

// 10. Another user cannot cancel this booking (PUT) -> 404.
r = await api('PUT', `/api/bookings/${booking.id}/cancel`, { token: tokenB })
check('10 Another user cannot cancel booking -> 404', r.status === 404, `-> HTTP ${r.status} "${r.data?.message}"`)

// 11. Cancel booking (owner) -> 200 + status cancelled.
r = await api('PUT', `/api/bookings/${booking.id}/cancel`, { token: tokenA })
check(
  '11 Cancel booking (owner)',
  r.status === 200 && r.data?.booking?.status === 'cancelled' && r.data?.booking?.hotel?.name,
  `-> HTTP ${r.status} status=${r.data?.booking?.status}`
)

// 12. Cancelling again -> 400 (already cancelled).
r = await api('PUT', `/api/bookings/${booking.id}/cancel`, { token: tokenA })
check('12 Cancel again -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

// 13. Verify cancelled status persisted in the database.
await mongoose.connect(process.env.MONGODB_URI)
const dbBooking = await Booking.findById(booking.id)
await mongoose.disconnect()
check('13 DB status is cancelled', dbBooking?.status === 'cancelled', `-> status=${dbBooking?.status}`)

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`)
process.exit(fail ? 1 : 0)