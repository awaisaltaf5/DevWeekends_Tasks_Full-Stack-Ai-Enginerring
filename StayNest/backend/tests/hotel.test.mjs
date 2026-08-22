// StayNest hotel discovery API test suite.
// Run from the backend directory with the backend running:
//   node tests/hotel.test.mjs
const base = 'http://127.0.0.1:5000';

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

async function api(path) {
  const res = await fetch(base + path);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data };
}

console.log('===== STAYNEST HOTEL DISCOVERY TESTS =====\n');

// 1. Default list
let r = await api('/api/hotels');
check(
  '1 List hotels (default limit 9)',
  r.status === 200 && r.data?.total >= 25 && r.data?.hotels?.length === 9,
  `-> HTTP ${r.status} count=${r.data?.count} total=${r.data?.total}`
);
const first = r.data?.hotels?.[0];

// 2. City filter (Islamabad)
r = await api('/api/hotels?city=islamabad');
check(
  '2 City=Islamabad',
  r.status === 200 && r.data?.hotels?.length > 0 && r.data.hotels.every((h) => h.city === 'islamabad'),
  `-> HTTP ${r.status} count=${r.data?.count}`
);

// 3. Price range
r = await api('/api/hotels?minPrice=5000&maxPrice=15000');
check(
  '3 Price 5000-15000',
  r.status === 200 && r.data.hotels.every((h) => h.pricePerNight >= 5000 && h.pricePerNight <= 15000),
  `-> HTTP ${r.status} count=${r.data?.count}`
);

// 4. Search by name
r = await api('/api/hotels?search=grand');
check('4 Search "grand"', r.status === 200 && r.data?.hotels?.length > 0, `-> HTTP ${r.status} count=${r.data?.count}`);

// 5. Rating filter
r = await api('/api/hotels?rating=4.5');
check(
  '5 Rating >= 4.5',
  r.status === 200 && r.data?.hotels?.length > 0 && r.data.hotels.every((h) => h.rating >= 4.5),
  `-> HTTP ${r.status} count=${r.data?.count}`
);

// 6. Sort price ascending
r = await api('/api/hotels?sort=priceAsc');
const prices = r.data?.hotels?.map((h) => h.pricePerNight) || [];
check(
  '6 Sort priceAsc',
  r.status === 200 && prices.every((p, i) => i === 0 || prices[i - 1] <= p),
  `-> HTTP ${r.status} first=${prices[0]} last=${prices[prices.length - 1]}`
);

// 7. Pagination
r = await api('/api/hotels?page=2&limit=6');
check(
  '7 Pagination page2/limit6',
  r.status === 200 && r.data?.currentPage === 2 && r.data?.count <= 6,
  `-> HTTP ${r.status} currentPage=${r.data?.currentPage} count=${r.data?.count} totalPages=${r.data?.totalPages}`
);

// 8. Detail by id
if (first?.id) {
  r = await api(`/api/hotels/${first.id}`);
  check('8 Detail by id', r.status === 200 && r.data?.hotel?.id === first.id, `-> HTTP ${r.status} id=${r.data?.hotel?.id}`);
}

// 9. Invalid ObjectId -> 400
r = await api('/api/hotels/not-a-valid-id');
check('9 Invalid hotel ID -> 400', r.status === 400, `-> HTTP ${r.status} "${r.data?.message}"`);

// 10. Valid-but-nonexistent ObjectId -> 404
r = await api('/api/hotels/507f1f77bcf86cd799439011');
check('10 Nonexistent ID -> 404', r.status === 404, `-> HTTP ${r.status} "${r.data?.message}"`);

// 11. POST without auth -> 401
let r2 = await fetch(base + '/api/hotels', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'X', city: 'x', country: 'x', address: 'x', pricePerNight: 1 }),
});
check('11 POST hotel no auth -> 401', r2.status === 401, `-> HTTP ${r2.status}`);

// 12. Featured only
r = await api('/api/hotels?featured=true');
check(
  '12 Featured only',
  r.status === 200 && r.data?.hotels?.length > 0 && r.data.hotels.every((h) => h.featured === true),
  `-> HTTP ${r.status} count=${r.data?.count}`
);

// 13. Amenities filter
r = await api('/api/hotels?amenities=Swimming%20Pool');
check(
  '13 Amenities Swimming Pool',
  r.status === 200 && r.data?.hotels?.every((h) => (h.amenities || []).includes('Swimming Pool')),
  `-> HTTP ${r.status} count=${r.data?.count}`
);

// 14-15. Location search (Nominatim)
let ld = await (await fetch(base + '/api/location/search?q=Islamabad')).json();
check('14 Location Islamabad', ld?.found === true && !!ld?.city, `-> found=${ld?.found} city=${ld?.city}`);
let ld2 = await (await fetch(base + '/api/location/search?q=Lahore')).json();
check('15 Location Lahore', ld2?.found === true && !!ld2?.city, `-> found=${ld2?.found} city=${ld2?.city}`);

// 16. City + price combined
r = await api('/api/hotels?city=lahore&minPrice=5000&maxPrice=20000');
check(
  '16 City=Lahore + price 5000-20000',
  r.status === 200 && r.data?.hotels?.every((h) => h.city === 'lahore' && h.pricePerNight >= 5000 && h.pricePerNight <= 20000),
  `-> HTTP ${r.status} count=${r.data?.count}`
);

console.log(`\n===== RESULT: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
