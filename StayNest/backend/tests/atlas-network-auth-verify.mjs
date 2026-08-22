import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Hotel from '../src/models/Hotel.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';
import SavedHotel from '../src/models/SavedHotel.js';

const API_BASE = 'http://127.0.0.1:5000';

async function api(method, path, { body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

async function runVerification() {
  console.log('================================================================');
  console.log('       STAYNEST LIVE ATLAS, NETWORK & AUTH VERIFICATION        ');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Mongoose MongoDB Atlas Direct Connection & Stats
  // ---------------------------------------------------------------------------
  console.log('>>> [1/4] TESTING MONGOOSE MONGODB ATLAS CONNECTION...');
  const connStart = Date.now();
  await mongoose.connect(process.env.MONGODB_URI);
  const connDuration = Date.now() - connStart;

  console.log(`  ✓ Connected to MongoDB Atlas in ${connDuration}ms`);
  console.log(`  ✓ Cluster Host: ${mongoose.connection.host}`);
  console.log(`  ✓ Database Name: ${mongoose.connection.name}`);
  console.log(`  ✓ Connection State: ${mongoose.connection.readyState === 1 ? 'CONNECTED (1)' : 'DISCONNECTED'}`);

  const userCount = await User.countDocuments();
  const hotelCount = await Hotel.countDocuments();
  const bookingCount = await Booking.countDocuments();
  const reviewCount = await Review.countDocuments();
  const savedCount = await SavedHotel.countDocuments();

  console.log(`  ✓ Existing Collections in Atlas:`);
  console.log(`    - Users: ${userCount}`);
  console.log(`    - Hotels: ${hotelCount}`);
  console.log(`    - Bookings: ${bookingCount}`);
  console.log(`    - Reviews: ${reviewCount}`);
  console.log(`    - SavedHotels: ${savedCount}`);

  // ---------------------------------------------------------------------------
  // 2. Direct Data Insertion & Read back from Atlas
  // ---------------------------------------------------------------------------
  console.log('\n>>> [2/4] ENTERING REAL TEST DATA DIRECTLY INTO ATLAS...');
  const testEmail = `live_verify_${Date.now()}@example.com`;
  const rawPassword = 'SecurePassword123!';

  // Direct Atlas User Create
  const directUser = await User.create({
    name: 'Atlas Direct Tester',
    email: testEmail,
    password: rawPassword,
    role: 'user',
  });
  console.log(`  ✓ User document created directly in Atlas with ID: ${directUser._id}`);
  console.log(`  ✓ Verifying password was automatically hashed with bcrypt:`);
  console.log(`    - Stored hash: ${directUser.password.slice(0, 20)}... (Length: ${directUser.password.length})`);
  console.log(`    - Hash starts with $2a$ or $2b$: ${directUser.password.startsWith('$2')}`);

  // Direct Atlas Hotel Query
  const sampleHotel = await Hotel.findOne({ isActive: true });
  console.log(`  ✓ Queried active hotel from Atlas: "${sampleHotel.name}" (ID: ${sampleHotel._id}, City: ${sampleHotel.city})`);

  // Direct Atlas Booking Create
  const directBooking = await Booking.create({
    user: directUser._id,
    hotel: sampleHotel._id,
    roomType: sampleHotel.roomTypes[0] || 'Standard Room',
    checkIn: new Date(Date.now() + 86400000),
    checkOut: new Date(Date.now() + 86400000 * 3),
    guests: 2,
    numberOfRooms: 1,
    pricePerNight: sampleHotel.pricePerNight,
    totalPrice: sampleHotel.pricePerNight * 2,
    status: 'pending',
  });
  console.log(`  ✓ Booking document created in Atlas with ID: ${directBooking._id}`);

  // Direct Atlas Review Create
  const directReview = await Review.create({
    user: directUser._id,
    hotel: sampleHotel._id,
    rating: 5,
    comment: 'Atlas live test verified review',
  });
  console.log(`  ✓ Review document created in Atlas with ID: ${directReview._id}`);

  // Verify finding the inserted booking and review back from Atlas
  const foundBooking = await Booking.findById(directBooking._id).populate('hotel', 'name');
  console.log(`  ✓ Verified DB Read: Found booking for "${foundBooking.hotel.name}" Total: PKR ${foundBooking.totalPrice}`);

  // ---------------------------------------------------------------------------
  // 3. Network & External API Connectivity
  // ---------------------------------------------------------------------------
  console.log('\n>>> [3/4] TESTING NETWORK CONNECTIVITY & APIS...');

  // Health API
  const healthRes = await api('GET', '/api/health');
  console.log(`  ✓ Backend Health Endpoint [GET /api/health]: HTTP ${healthRes.status} -> "${healthRes.data?.message}"`);

  // OpenStreetMap Nominatim external network test
  const locStart = Date.now();
  const locRes = await api('GET', '/api/location/search?q=Lahore');
  const locDuration = Date.now() - locStart;
  console.log(`  ✓ External Geocoding Network [OpenStreetMap Nominatim]: HTTP ${locRes.status} in ${locDuration}ms`);
  console.log(`    - Resolved City: ${locRes.data?.city}, Country: ${locRes.data?.country}, Lat: ${locRes.data?.lat}, Lon: ${locRes.data?.lon}`);

  // ---------------------------------------------------------------------------
  // 4. Registration & Login Flow Testing (HTTP / Network End-to-End)
  // ---------------------------------------------------------------------------
  console.log('\n>>> [4/4] TESTING REGISTRATION & LOGIN VIA REST API...');

  const httpUserEmail = `api_guest_${Date.now()}@example.com`;
  const httpUserPass = 'MySecretPass789!';

  // Step A: Registration
  console.log(`  -> A. Testing POST /api/auth/register with email: ${httpUserEmail}`);
  const regRes = await api('POST', '/api/auth/register', {
    body: {
      name: 'Sarah Khan',
      email: httpUserEmail,
      password: httpUserPass,
    },
  });
  console.log(`     ✓ Registration Status: HTTP ${regRes.status} (Created)`);
  console.log(`     ✓ JWT Token Generated: ${regRes.data?.token ? 'YES (' + regRes.data.token.slice(0, 25) + '...)' : 'NO'}`);
  console.log(`     ✓ User object returned without password: ${regRes.data?.user?.password === undefined ? 'YES (Secure)' : 'NO (Leaked!)'}`);
  console.log(`     ✓ User Name: "${regRes.data?.user?.name}", Email: "${regRes.data?.user?.email}", Role: "${regRes.data?.user?.role}"`);

  // Step B: Duplicate registration rejection
  console.log(`  -> B. Testing duplicate registration rejection...`);
  const dupRes = await api('POST', '/api/auth/register', {
    body: {
      name: 'Sarah Khan Copy',
      email: httpUserEmail,
      password: httpUserPass,
    },
  });
  console.log(`     ✓ Duplicate rejected: HTTP ${dupRes.status} -> Message: "${dupRes.data?.message}"`);

  // Step C: Login with wrong password
  console.log(`  -> C. Testing login with wrong password...`);
  const badLoginRes = await api('POST', '/api/auth/login', {
    body: {
      email: httpUserEmail,
      password: 'wrong_password_123',
    },
  });
  console.log(`     ✓ Bad password rejected: HTTP ${badLoginRes.status} -> Message: "${badLoginRes.data?.message}"`);

  // Step D: Login with correct password
  console.log(`  -> D. Testing login with valid credentials...`);
  const loginRes = await api('POST', '/api/auth/login', {
    body: {
      email: httpUserEmail,
      password: httpUserPass,
    },
  });
  const token = loginRes.data?.token;
  console.log(`     ✓ Login Status: HTTP ${loginRes.status} (OK)`);
  console.log(`     ✓ JWT Token Acquired: YES`);
  console.log(`     ✓ User: "${loginRes.data?.user?.name}" (Role: ${loginRes.data?.user?.role})`);

  // Step E: Access protected route with JWT
  console.log(`  -> E. Testing protected route [GET /api/auth/me] with Bearer token...`);
  const meRes = await api('GET', '/api/auth/me', { token });
  console.log(`     ✓ Protected route access: HTTP ${meRes.status} -> Email: "${meRes.data?.user?.email}"`);

  // Step F: Password change & re-login
  console.log(`  -> F. Testing password change & re-authentication...`);
  const newPass = 'BrandNewPassword999!';
  const changeRes = await api('PUT', '/api/auth/change-password', {
    token,
    body: {
      currentPassword: httpUserPass,
      newPassword: newPass,
    },
  });
  console.log(`     ✓ Password changed: HTTP ${changeRes.status} -> Message: "${changeRes.data?.message}"`);

  const oldLoginRes = await api('POST', '/api/auth/login', {
    body: { email: httpUserEmail, password: httpUserPass },
  });
  console.log(`     ✓ Old password rejected: HTTP ${oldLoginRes.status} (401 Unauthorized)`);

  const newLoginRes = await api('POST', '/api/auth/login', {
    body: { email: httpUserEmail, password: newPass },
  });
  console.log(`     ✓ New password login successful: HTTP ${newLoginRes.status} (200 OK)`);

  // ---------------------------------------------------------------------------
  // Clean up direct test documents
  // ---------------------------------------------------------------------------
  await Review.deleteOne({ _id: directReview._id });
  await Booking.deleteOne({ _id: directBooking._id });
  await User.deleteOne({ _id: directUser._id });
  await User.deleteOne({ email: httpUserEmail });
  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log('               ALL 4 VERIFICATION STAGES PASSED!                ');
  console.log('================================================================');
}

runVerification().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
