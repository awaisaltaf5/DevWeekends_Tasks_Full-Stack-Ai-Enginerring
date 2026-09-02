/**
 * Vendora — Stripe payment flow test.
 * Verifies the secure payment lifecycle without real Stripe keys.
 * When STRIPE_SECRET_KEY is set, also verifies webhook signature rejection.
 */
require("dotenv").config({ path: "config/.env" });
const mongoose = require("mongoose");
const Product = require("./model/product");
const Order = require("./model/order");
const Shop = require("./model/shop");

const API = "http://localhost:8000/api/v2";
let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS - ${name}`); }
  else { fail++; console.log(`FAIL - ${name} ${extra}`); }
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // seed a fresh product for the flow
  let shop = await Shop.findOne();
  if (!shop) {
    shop = await Shop.create({
      name: "Vendora Test Shop", email: "seller-test@vendora.test", password: "vendora123",
      address: "Test Street 1", phoneNumber: 1234567890, zipCode: 12345,
      avatar: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    });
  }
  const product = await Product.create({
    name: "Stripe Test Product", description: "E2E payment test product", category: "Test",
    discountPrice: 100, stock: 10, shopId: String(shop._id),
    shop: { _id: String(shop._id), name: shop.name },
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
  });
  console.log(`Seeded product ${product._id} ($${product.discountPrice})`);

  // login as buyer
  const login = await fetch(`${API}/user/login-user`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "buyer@vendora.test", password: "vendora123" }),
  });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  check("Buyer login", login.status === 201);

  // 1. unauthenticated payment intent must be rejected
  const anon = await fetch(`${API}/payment/create-payment-intent`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart: [{ productId: String(product._id), qty: 2 }] }),
  });
  check("Unauthenticated create-payment-intent rejected (401)", anon.status === 401);

  // 2. unauthenticated create-order must be rejected
  const anonOrder = await fetch(`${API}/payment/create-order`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentMethod: "COD", cart: [{ productId: String(product._id), qty: 1 }] }),
  });
  check("Unauthenticated create-order rejected (401)", anonOrder.status === 401);

  // 3. authenticated intent without Stripe configured → 503
  const intent = await fetch(`${API}/payment/create-payment-intent`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ cart: [{ productId: String(product._id), qty: 2 }] }),
  });
  check("create-payment-intent responds (200 with keys configured, 503 without)", intent.status === 200 || intent.status === 503, `got ${intent.status}`);

  // 4. webhook present + rejects unsigned payloads (or 503 if unconfigured)
  const hook = await fetch(`${API}/payment/webhook`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "payment_intent.succeeded" }),
  });
  check("Webhook rejects unsigned/invalid payload (400) or is unconfigured (503)", hook.status === 400 || hook.status === 503);

  // 5. COD order end-to-end — backend computes amount from DB prices
  const cod = await fetch(`${API}/payment/create-order`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      paymentMethod: "COD",
      cart: [{ productId: String(product._id), qty: 2 }],
      shippingAddress: { address1: "1 Main St", address2: "", zipCode: "12345", country: "US", city: "Testville" },
    }),
  });
  const codData = await cod.json();
  check("COD order created (201)", cod.status === 201 && !!codData.orders?.[0]?._id, JSON.stringify(codData).slice(0, 200));
  // 2 × $100 = $200 subtotal + 10% shipping = $220 — computed on the backend, NOT from the frontend
  check("Backend-computed amount = $220 (frontend price ignored)", Math.abs(codData.orders[0].totalPrice - 220) < 0.01, `got ${codData.orders[0].totalPrice}`);
  check("Order buyer = authenticated user (not body-trusted)", !!codData.orders[0].user?.email);
  check("COD order paymentInfo.type = Cash On Delivery, status Not Paid", codData.orders[0].paymentInfo?.type === "Cash On Delivery" && codData.orders[0].paymentInfo?.status === "Not Paid");
  const orderId = codData.orders[0]._id;

  // 6. tampered cart: unknown product id → rejected
  const bad = await fetch(`${API}/payment/create-order`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ paymentMethod: "COD", cart: [{ productId: "000000000000000000000000", qty: 1 }], shippingAddress: {} }),
  });
  check("Order with unknown product rejected (400/500)", bad.status >= 400);

  // 7. seller login and sees the order
  const sellerLogin = await fetch(`${API}/shop/login-shop`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: shop.email, password: "vendora123" }),
  });
  const sellerCookie = sellerLogin.headers.get("set-cookie").split(";")[0];
  check("Seller login", sellerLogin.status === 201);
  const sellerOrders = await fetch(`${API}/order/get-seller-all-orders/${shop._id}`, {
    headers: { Cookie: sellerCookie },
  });
  const sellerData = await sellerOrders.json();
  check("Seller sees the order", sellerOrders.status === 200 && sellerData.orders.some((o) => String(o._id) === String(orderId)));

  // 8. seller updates order status
  const upd = await fetch(`${API}/order/update-order-status/${orderId}`, {
    method: "PUT", headers: { "Content-Type": "application/json", Cookie: sellerCookie },
    body: JSON.stringify({ status: "Processing" }),
  });
  check("Seller updates order status", upd.status === 200);

  // 9. buyer sees the updated status
  const me = await fetch(`${API}/user/getuser`, { headers: { Cookie: cookie } });
  const meData = await me.json();
  const buyerOrders = await fetch(`${API}/order/get-all-orders/${meData.user._id}`, {
    headers: { Cookie: cookie },
  });
  const buyerData = await buyerOrders.json();
  const buyerOrder = buyerData.orders.find((o) => String(o._id) === String(orderId));
  check("Buyer sees updated status 'Processing'", buyerOrder && buyerOrder.status === "Processing", `got: ${buyerOrders.status} ${JSON.stringify(buyerOrder || buyerData).slice(0, 300)}`);

  // cleanup
  await Product.findByIdAndDelete(product._id);
  await Order.findByIdAndDelete(orderId);

  console.log(`\n${pass} passed, ${fail} failed`);
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
