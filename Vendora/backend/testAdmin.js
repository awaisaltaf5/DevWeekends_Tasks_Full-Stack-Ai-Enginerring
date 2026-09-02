/**
 * Vendora — Admin authorization & functionality test.
 * Verifies: admin login, admin-only middleware (401/403), seller & buyer
 * locked out of admin APIs, dashboard stats, seller suspend flow
 * (login + seller APIs blocked while suspended), moderation deletes.
 */
require("dotenv").config({ path: "config/.env" });
const mongoose = require("mongoose");
const Product = require("./model/product");
const Shop = require("./model/shop");

const API = "http://localhost:8000/api/v2";
let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS - ${name}`); }
  else { fail++; console.log(`FAIL - ${name} ${extra}`); }
}

async function login(endpoint, email, password) {
  const res = await fetch(`${API}/${endpoint}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const sc = res.headers.get("set-cookie");
  return { status: res.status, cookie: sc ? sc.split(";")[0] : null };
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const shop = await Shop.findOne();
  if (!shop) { console.error("No shop seeded"); process.exit(1); }

  // 1. Admin authentication
  const admin = await login("user/login-user", "admin@vendora.test", "vendora123");
  check("Admin login (201)", admin.status === 201);

  const buyer = await login("user/login-user", "buyer@vendora.test", "vendora123");
  const seller = await login("shop/login-shop", shop.email, "vendora123");

  // 2. Admin-only API middleware — anonymous
  const anon = await fetch(`${API}/admin/stats`);
  check("Anonymous /admin/stats → 401", anon.status === 401);

  // 3. Buyer forbidden
  const buyerRes = await fetch(`${API}/admin/stats`, { headers: { Cookie: buyer.cookie } });
  check("Buyer /admin/stats → 403", buyerRes.status === 403);

  // 4. Seller forbidden (admin APIs use the user JWT — seller has none)
  const sellerRes = await fetch(`${API}/admin/stats`, { headers: { Cookie: seller.cookie } });
  check("Seller-only cookie /admin/stats → 401", sellerRes.status === 401);

  // 5. Forged role escalation: seller tries admin-all-users with seller cookie
  const forged = await fetch(`${API}/user/admin-all-users`, { headers: { Cookie: seller.cookie } });
  check("Seller /user/admin-all-users → 401 (no user JWT)", forged.status === 401);

  // 6. Admin allowed everywhere
  const stats = await fetch(`${API}/admin/stats`, { headers: { Cookie: admin.cookie } });
  const statsData = await stats.json();
  check("Admin /admin/stats → 200 with platform earnings", stats.status === 200 && "platformEarnings" in statsData.stats, JSON.stringify(statsData).slice(0, 150));

  const activity = await fetch(`${API}/admin/activity`, { headers: { Cookie: admin.cookie } });
  check("Admin /admin/activity → 200", activity.status === 200);

  // 7. Admin lists buyers, sellers, products, orders, withdraws
  // (legacy routes respond 201 per existing codebase convention)
  const users = await fetch(`${API}/user/admin-all-users`, { headers: { Cookie: admin.cookie } });
  check("Admin /user/admin-all-users → 2xx", users.status === 200 || users.status === 201);
  const sellers = await fetch(`${API}/shop/admin-all-sellers`, { headers: { Cookie: admin.cookie } });
  check("Admin /user/admin-all-sellers → 2xx", sellers.status === 200 || sellers.status === 201);
  const products = await fetch(`${API}/product/admin-all-products`, { headers: { Cookie: admin.cookie } });
  check("Admin /product/admin-all-products → 2xx", products.status === 200 || products.status === 201);
  const orders = await fetch(`${API}/order/admin-all-orders`, { headers: { Cookie: admin.cookie } });
  check("Admin /order/admin-all-orders → 2xx", orders.status === 200 || orders.status === 201);
  const withdraws = await fetch(`${API}/withdraw/get-all-withdraw-request`, { headers: { Cookie: admin.cookie } });
  check("Admin /withdraw/get-all-withdraw-request → 2xx", withdraws.status === 200 || withdraws.status === 201);

  // 8. Seller suspension flow
  const seedProduct = await Product.create({
    name: "Admin Moderation Test", description: "moderation", category: "Test",
    discountPrice: 10, stock: 1, shopId: String(shop._id), shop: { _id: String(shop._id), name: shop.name },
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
  });

  const before = await fetch(`${API}/product/get-all-products-shop/${shop._id}`, { headers: { Cookie: seller.cookie } });
  check("Seller API accessible before suspension", before.status === 200 || before.status === 201);

  const susp = await fetch(`${API}/admin/update-seller-status/${shop._id}`, {
    method: "PUT", headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ status: "Suspended" }),
  });
  check("Admin suspends seller → 200", susp.status === 200);

  const relogin = await login("shop/login-shop", shop.email, "vendora123");
  check("Suspended seller cannot login (403)", relogin.status === 403, `got ${relogin.status}`);

  // seller-protected route (isSeller middleware) — old token must be rejected once suspended
  const blockedApi = await fetch(`${API}/product/create-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: seller.cookie },
    body: JSON.stringify({ name: "x", description: "x", category: "x", discountPrice: 1, stock: 1, shopId: String(shop._id) }),
  });
  check("Suspended seller's existing token blocked on seller APIs (401/403)", blockedApi.status === 401 || blockedApi.status === 403, `got ${blockedApi.status}`);

  const del = await fetch(`${API}/admin/delete-product/${seedProduct._id}`, {
    method: "DELETE", headers: { Cookie: admin.cookie },
  });
  check("Admin deletes product (moderation) → 200", del.status === 200);

  const act = await fetch(`${API}/admin/update-seller-status/${shop._id}`, {
    method: "PUT", headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ status: "Active" }),
  });
  check("Admin re-activates seller → 200", act.status === 200);
  const relogin2 = await login("shop/login-shop", shop.email, "vendora123");
  check("Re-activated seller can login again (201)", relogin2.status === 201);

  const badStatus = await fetch(`${API}/admin/update-seller-status/${shop._id}`, {
    method: "PUT", headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ status: "Banned" }),
  });
  check("Invalid status value rejected (400)", badStatus.status === 400);

  console.log(`\n${pass} passed, ${fail} failed`);
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
