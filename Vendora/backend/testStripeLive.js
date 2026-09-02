/**
 * Vendora — LIVE Stripe payment flow test (requires STRIPE_* keys in config/.env).
 */
require("dotenv").config({ path: "config/.env" });
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
  const shop = await Shop.findOne();
  if (!shop) { console.log("No shop in DB — run testStripe.js first"); process.exit(1); }

  const product = await Product.create({
    name: "Live Stripe Product", description: "Live payment test", category: "Test",
    discountPrice: 100, stock: 10, shopId: String(shop._id),
    shop: { _id: String(shop._id), name: shop.name },
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
  });

  // buyer login
  const login = await fetch(`${API}/user/login-user`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "buyer@vendora.test", password: "vendora123" }),
  });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const meData = await (await fetch(`${API}/user/getuser`, { headers: { Cookie: cookie } })).json();
  check("Buyer login", login.status === 201);

  // 1. real PaymentIntent — backend computes 2×$100 + 10% = $220 → 22000 cents
  const intentRes = await fetch(`${API}/payment/create-payment-intent`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ cart: [{ productId: String(product._id), qty: 2 }] }),
  });
  const intentData = await intentRes.json();
  check("create-payment-intent 200 with client_secret (LIVE)", intentRes.status === 200 && !!intentData.clientSecret, JSON.stringify(intentData).slice(0, 200));
  const pi = await stripe.paymentIntents.retrieve(intentData.paymentIntentId || intentData.id);
  check("Stripe-side amount = 22000 (backend-computed, not frontend)", pi.amount === 22000, `got ${pi.amount}`);
  check("Intent currency correct", pi.currency === (process.env.STRIPE_CURRENCY || "usd").toLowerCase());
  check("Intent metadata buyer = authenticated user", pi.metadata.userId === String(meData.user._id));
  const intentId = pi.id;

  // 2. order must NOT be created from an unconfirmed intent (failed/abandoned payment)
  const premature = await fetch(`${API}/payment/create-order`, {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      paymentIntentId: intentId, paymentMethod: "stripe", couponCode: null,
      shippingAddress: { address1: "1 Main St", city: "T", zipCode: "1", country: "US" },
    }),
  });
  check("create-order rejected for unconfirmed PaymentIntent (no order on failed payment)", premature.status >= 400, `got ${premature.status}`);

  // seed the order the webhook will later update (as create-order does after confirmation)
  const order = await Order.create({
    cart: [{ _id: String(product._id), name: product.name, qty: 2, discountPrice: 100, images: product.images, shopId: String(shop._id) }],
    shippingAddress: { address1: "1 Main St" }, user: { _id: meData.user._id, name: meData.user.name, email: meData.user.email },
    totalPrice: 220, status: "Processing",
    paymentInfo: { id: intentId, status: "Unpaid", type: "Credit Card", paymentIntentId: intentId },
  });

  // 3. UNSIGNED webhook → rejected, order stays unpaid
  const unsigned = await fetch(`${API}/payment/webhook`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "payment_intent.succeeded", data: { object: { id: intentId } } }),
  });
  check("Unsigned webhook rejected (400)", unsigned.status === 400);
  const afterUnsigned = await Order.findById(order._id);
  check("Order NOT marked paid by unsigned request", afterUnsigned.paymentInfo.status === "Unpaid");

  // 4. correctly SIGNED webhook → order marked paid
  const payload = JSON.stringify({
    id: "evt_test_signed", type: "payment_intent.succeeded",
    data: { object: { id: intentId, amount: 22000, currency: "usd" } },
  });
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const signed = await fetch(`${API}/payment/webhook`, {
    method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": sig }, body: payload,
  });
  check("Signed webhook accepted (200)", signed.status === 200);
  const paid = await Order.findById(order._id);
  check("Order marked Succeeded only after verified webhook", paid.paymentInfo.status === "Succeeded", `got ${paid.paymentInfo.status}`);
  check("paidAt recorded + transaction id stored", !!paid.paidAt && paid.paymentInfo.id === intentId);

  // 5. idempotency — replay the same event
  await fetch(`${API}/payment/webhook`, {
    method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": sig }, body: payload,
  });
  const count = await Order.countDocuments({ "paymentInfo.id": intentId });
  check("Webhook replay creates no duplicates (idempotent)", count === 1);

  // 6. signed payment_failed for an unknown intent — no side effects
  const failPayload = JSON.stringify({ id: "evt_fail", type: "payment_intent.payment_failed", data: { object: { id: "pi_unknown_123" } } });
  const failSig = stripe.webhooks.generateTestHeaderString({ payload: failPayload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const failRes = await fetch(`${API}/payment/webhook`, {
    method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": failSig }, body: failPayload,
  });
  check("payment_failed for unknown intent handled gracefully", failRes.status === 200);

  // 7. seller sees order + updates status; buyer sees it
  const sellerLogin = await fetch(`${API}/shop/login-shop`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: shop.email, password: "vendora123" }),
  });
  const sellerCookie = sellerLogin.headers.get("set-cookie").split(";")[0];
  const sellerOrders = await (await fetch(`${API}/order/get-seller-all-orders/${shop._id}`, { headers: { Cookie: sellerCookie } })).json();
  check("Seller sees the paid order", sellerOrders.orders.some((o) => String(o._id) === String(order._id) && o.paymentInfo.status === "Succeeded"));
  await fetch(`${API}/order/update-order-status/${order._id}`, {
    method: "PUT", headers: { "Content-Type": "application/json", Cookie: sellerCookie },
    body: JSON.stringify({ status: "Shipping" }),
  });
  const buyerOrders = await (await fetch(`${API}/order/get-all-orders/${meData.user._id}`, { headers: { Cookie: cookie } })).json();
  const buyerOrder = buyerOrders.orders.find((o) => String(o._id) === String(order._id));
  check("Buyer sees status 'Shipping' + payment 'Succeeded'", buyerOrder.status === "Shipping" && buyerOrder.paymentInfo.status === "Succeeded");

  // cleanup
  await stripe.paymentIntents.cancel(intentId).catch(() => {});
  await Product.findByIdAndDelete(product._id);
  await Order.findByIdAndDelete(order._id);

  console.log(`\n${pass} passed, ${fail} failed`);
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
