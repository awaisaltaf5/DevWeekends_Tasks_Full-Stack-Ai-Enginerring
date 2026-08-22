// StayNest admin + hotel/booking management API test suite.
// Run from the backend directory with the backend running:
//   node tests/admin.test.mjs
import 'dotenv/config'
import mongoose from 'mongoose'

const base = 'http://127.0.0.1:5000'
const ts = Date.now()
const userEmail = `admin_user_${ts}@example.com`
const adminEmail = `admin_${ts}@example.com`
const pw = 'password123'

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

const dateOffset = (days) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

console.log('===== STAYNEST ADMIN TEST SUITE =====\n')

// -- Setup: one normal user, one promoted admin ----------------------------
let r = await api('POST', '/api/auth/register', {
  body: { name: 'Normal User', email: userEmail, password: pw },
})
const userToken = r.data?.token
check('Setup register normal user', r.status === 201 && !!userToken, `-> HTTP ${r.status}`)

r = await api('POST', '/api/auth/register', {
  body: { name: 'Admin Person', email: adminEmail, password: pw },
})
check('Setup register admin candidate', r.status === 201 && !!r.data?.token, `-> HTTP ${r.status}`)

await mongoose.connect(process.env.MONGODB_URI)
await mongoose.connection.collection('users').updateOne(
  { email: adminEmail },
  { $set: { role: 'admin' } }
)
await mongoose.disconnect()
r = await api('POST', '/api/auth/login', { body: { email: adminEmail, password: pw } })
const adminToken = r.data?.token
check('Setup login as admin', r.status === 200 && !!adminToken && r.data?.user?.role === 'admin', `-> HTTP ${r.status} role=${r.data?.user?.role}`)

// 1. Admin route protection: no token -> 401
r = await api('GET', '/api/admin/stats')
check('1 Admin stats without login -> 401', r.status === 401, `-> HTTP ${r.status}`)

// 2. Non-admin access rejection -> 403
r = await api('GET', '/api/admin/stats', { token: userToken })
check('2 Admin stats with user token -> 403', r.status === 403, `-> HTTP ${r.status} "${r.data?.message}"`)

// 3. Admin stats -> 200 with counts
r = await api('GET', '/api/admin/stats', { token: adminToken })
const s = r.data?.stats || {}
check(
  '3 Admin stats',
  r.status === 200 && typeof s.totalUsers === 'number' && typeof s.totalHotels === 'number' && typeof s.totalBookings === 'number' && typeof s.totalRevenue === 'number',
  `-> HTTP ${r.status} users=${s.totalUsers} hotels=${s.totalHotels} bookings=${s.totalBookings} revenue=${s.totalRevenue}`
)

// 4. Admin hotel CRUD: create -> 201
r = await api('POST', '/api/admin/hotels', {
  token: adminToken,
  body: {
    name: 'Admin Test Hotel',
    description: 'Created through admin API',
    city: 'testcity',
    country: 'Testland',
    address: '1 Test St',
    pricePerNight: 5000,
    rating: 0,
    reviewCount: 0,
    amenities: ['Free WiFi'],
    roomTypes: ['Standard Room'],
    isActive: true,
  },
})
const newHotel = r.data?.hotel
check('4 Admin create hotel', r.status === 201 && !!newHotel?.id && newHotel?.name === 'Admin Test Hotel', `-> HTTP ${r.status} hotel=${newHotel?.id}`)

// 5. Admin hotel CRUD: update (price + toggle inactive) -> 200
r = await api('PUT', `/api/admin/hotels/${newHotel.id}`, {
  token: adminToken,
  body: { pricePerNight: 7000, isActive: false },
})
check(
  '5 Admin update hotel',
  r.status === 200 && r.data?.hotel?.pricePerNight === 7000 && r.data?.hotel?.isActive === false,
  `-> HTTP ${r.status} price=${r.data?.hotel?.pricePerNight} active=${r.data?.hotel?.isActive}`
)

// 6. Admin list all hotels includes inactive one
r = await api('GET', '/api/admin/hotels', { token: adminToken })
const found = (r.data?.hotels || []).some((h) => h.id === newHotel.id && h.isActive === false)
check('6 Admin list hotels includes inactive', r.status === 200 && found, `-> HTTP ${r.status} count=${r.data?.count} found=${found}`)

// 7. Deactivated hotel is hidden from public list
r = await api('GET', '/api/hotels?city=testcity')
check('7 Deactivated hotel hidden publicly', r.status === 200 && r.data?.count === 0, `-> HTTP ${r.status} count=${r.data?.count}`)

// 8. Non-admin cannot access admin hotels -> 403
r = await api('GET', '/api/admin/hotels', { token: userToken })
check('8 Admin hotels with user token -> 403', r.status === 403, `-> HTTP ${r.status}`)
// 9. Admin bookings: create a booking as normal user first
r = await api('GET', '/api/hotels')
const hotel = r.data?.hotels?.find((h) => h.roomTypes?.length > 0)
check('Setup hotel for booking', !!hotel?.id, `-> hotel=${hotel?.id}`)
r = await api('POST', '/api/bookings', {
  token: userToken,
  body: { hotel: hotel.id, roomType: hotel.roomTypes[0], checkIn: dateOffset(2), checkOut: dateOffset(4), guests: 2, numberOfRooms: 1 },
})
const booking = r.data?.booking
check('Setup create booking', r.status === 201 && !!booking?.id, `-> HTTP ${r.status}`)

// 10. Admin list all bookings (across users)
r = await api('GET', '/api/admin/bookings', { token: adminToken })
const bookingFound = (r.data?.bookings || []).some((b) => b.id === booking.id)
check('10 Admin list all bookings', r.status === 200 && bookingFound, `-> HTTP ${r.status} count=${r.data?.count}`)

// 11. Admin booking detail
r = await api('GET', `/api/admin/bookings/${booking.id}`, { token: adminToken })
check('11 Admin booking detail', r.status === 200 && r.data?.booking?.id === booking.id && r.data?.booking?.user?.email === userEmail, `-> HTTP ${r.status}`)

// 12. Admin change booking status -> confirmed
r = await api('PUT', `/api/admin/bookings/${booking.id}/status`, {
  token: adminToken,
  body: { status: 'confirmed' },
})
check('12 Admin change booking status', r.status === 200 && r.data?.booking?.status === 'confirmed', `-> HTTP ${r.status} status=${r.data?.booking?.status}`)

// 13. Admin change booking status invalid -> 400
r = await api('PUT', `/api/admin/bookings/${booking.id}/status`, {
  token: adminToken,
  body: { status: 'nonsense' },
})
check('13 Admin invalid status -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`)

// 14. Non-admin cannot update booking status -> 403
r = await api('PUT', `/api/admin/bookings/${booking.id}/status`, {
  token: userToken,
  body: { status: 'cancelled' },
})
check('14 Non-admin update status -> 403', r.status === 403, `-> HTTP ${r.status}`)

// 15. Admin revisions reflected in revenue (confirmed booking adds its price)
r = await api('GET', '/api/admin/stats', { token: adminToken })
check('15 Revenue includes confirmed booking', r.status === 200 && r.data?.stats?.totalRevenue >= (booking.totalPrice || 0), `-> HTTP ${r.status} revenue=${r.data?.stats?.totalRevenue}`)

// 16. Admin users list
r = await api('GET', '/api/admin/users', { token: adminToken })
check('16 Admin users list', r.status === 200 && Array.isArray(r.data?.users) && r.data?.users?.some((u) => u.email === userEmail), `-> HTTP ${r.status} count=${r.data?.count}`)

// 17. Admin delete hotel -> 200
r = await api('DELETE', `/api/admin/hotels/${newHotel.id}`, { token: adminToken })
check('17 Admin delete hotel', r.status === 200, `-> HTTP ${r.status} "${r.data?.message}"`)

// 18. Deleted hotel gone from admin list
r = await api('GET', '/api/admin/hotels', { token: adminToken })
check('18 Deleted hotel gone', r.status === 200 && !(r.data?.hotels || []).some((h) => h.id === newHotel.id), `-> HTTP ${r.status}`)

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`)
process.exit(fail ? 1 : 0)
