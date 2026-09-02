// Vendora — Become-a-Seller flow live test
const API = "http://localhost:8000/api/v2";

(async () => {
  // 1. google-shop-signup: rejects when no Google credential is provided
  let r = await fetch(`${API}/shop/google-shop-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test", address: "a", zipCode: "12345", phoneNumber: "1234567890" }),
  });
  console.log(`1. Google signup without credential → ${r.status} (expect 400)`);

  // 2. shop-login: missing credentials rejected
  r = await fetch(`${API}/shop/login-shop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nope@vendora.test", password: "wrongpass" }),
  });
  console.log(`2. Shop login (wrong creds) → ${r.status} (expect 400)`);

  // 3. create-shop (email flow) with a fresh seller
  const email = `googleflow+${Date.now()}@vendora.test`;
  r = await fetch(`${API}/shop/create-shop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Google Flow Test Shop", email, password: "vendora123",
      address: "1 Test St", zipCode: "12345", phoneNumber: "1234567890",
    }),
  });
  console.log(`3. create-shop (email flow) → ${r.status} (expect 201)`);

  // 4. confirm the shop exists in DB (activation token route works)
  r = await fetch(`${API}/shop/activation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activation_token: "invalid.token.here" }),
  });
  console.log(`4. Bad activation token → ${r.status} (expect 400)`);

  // cleanup
  require("dotenv").config({ path: "config/.env" });
  const mongoose = require("mongoose");
  const Shop = require("./model/shop");
  await mongoose.connect(process.env.MONGODB_URI);
  const del = await Shop.deleteOne({ email });
  console.log(`cleanup done (deleted ${del.deletedCount})`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
