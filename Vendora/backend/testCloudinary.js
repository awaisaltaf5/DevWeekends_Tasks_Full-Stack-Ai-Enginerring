/* Vendora — Cloudinary / Email / Google / Auth integration test (run: node testCloudinary.js) */
require("dotenv").config({ path: "./config/.env" });
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const sendMail = require("./utils/sendMail");
const templates = require("./utils/emailTemplates");
const Shop = require("./model/shop");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const API = "http://localhost:8000/api/v2";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const results = [];
const check = (name, ok, extra = "") =>
  results.push(`${ok ? "PASS" : "FAIL"} - ${name} ${extra}`);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Email (Brevo SMTP)
  try {
    await sendMail({
      email: process.env.EMAIL_FROM.match(/<(.+)>/)?.[1] || process.env.SMTP_USER,
      subject: "Vendora — SMTP test",
      html: templates.userActivation({ name: "Test", activationUrl: "http://localhost:3000" }),
      message: "Vendora SMTP test",
    });
    check("Brevo email send", true);
  } catch (e) {
    check("Brevo email send", false, e.message);
  }

  // 2. Cloudinary upload / display / delete
  let publicId;
  try {
    const res = await cloudinary.uploader.upload(
      `data:image/png;base64,${PNG.toString("base64")}`,
      { folder: "vendora/test" }
    );
    publicId = res.public_id;
    const display = await fetch(res.secure_url);
    check("Cloudinary upload", true, res.secure_url);
    check("Cloudinary display (HTTP 200)", display.ok);
    await cloudinary.uploader.destroy(publicId);
    const after = await fetch(res.secure_url);
    check("Cloudinary delete (gone)", !after.ok, `status=${after.status}`);
  } catch (e) {
    check("Cloudinary upload/display/delete", false, e.message);
  }

  // 3. Multipart avatar upload through the API (uses the same uploadBuffer path)
  let cookie;
  try {
    const login = await fetch(`${API}/user/login-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@vendora.test", password: "vendora123" }),
    });
    cookie = login.headers.get("set-cookie")?.split(";")[0];
    check("Login (email/password auth)", login.ok);

    const fd = new FormData();
    fd.append("image", new Blob([PNG], { type: "image/png" }), "avatar.png");
    const up = await fetch(`${API}/user/update-avatar`, {
      method: "PUT",
      headers: { Cookie: cookie },
      body: fd,
    });
    const upJson = await up.json();
    check(
      "Avatar upload via API (Cloudinary)",
      up.ok && upJson.user?.avatar?.includes("res.cloudinary.com"),
      upJson.user?.avatar || JSON.stringify(upJson).slice(0, 120)
    );

    // 4. Google login route validation
    const gl = await fetch(`${API}/user/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const glJson = await gl.json();
    check(
      "Google OAuth route (rejects empty credential)",
      gl.status === 400 && !!glJson.message,
      glJson.message
    );
  } catch (e) {
    check("API auth/upload tests", false, e.message);
  }

  // 5. Product image lifecycle through the API (multipart create + delete)
  try {
    const email = `shop${Date.now()}@vendora.test`;
    const shop = await Shop.create({
      name: "Cloudinary Test Shop",
      email,
      password: "vendora123",
      address: "Test Street",
      phoneNumber: 1234567890,
      zipCode: 12345,
      avatar: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    });

    const sLogin = await fetch(`${API}/shop/login-shop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "vendora123" }),
    });
    const sCookie = sLogin.headers.get("set-cookie")?.split(";")[0];

    const fd = new FormData();
    fd.append("shopId", String(shop._id));
    fd.append("name", "Test Product");
    fd.append("description", "Test");
    fd.append("category", "Test");
    fd.append("discountPrice", "10");
    fd.append("stock", "5");
    fd.append("images", new Blob([PNG], { type: "image/png" }), "p.png");
    const create = await fetch(`${API}/product/create-product`, {
      method: "POST",
      headers: { Cookie: sCookie },
      body: fd,
    });
    const cj = await create.json();
    const product = cj.product;
    check(
      "Product create with Cloudinary image",
      create.ok && product?.images?.[0]?.includes("res.cloudinary.com"),
      product?.images?.[0]
    );

    // confirm the asset exists on Cloudinary
    const pid = product.images[0].split("/upload/")[1].replace(/^v\d+\//, "").replace(/\.\w+$/, "");
    const before = await cloudinary.api.resource(pid);
    check("Product image stored on Cloudinary", !!before?.public_id);

    const del = await fetch(`${API}/product/delete-shop-product/${product._id}`, {
      method: "DELETE",
      headers: { Cookie: sCookie },
    });
    check("Product delete via API", del.ok);

    let gone = true;
    try {
      await cloudinary.api.resource(pid);
      gone = false;
    } catch (_) {}
    check("Product image deleted from Cloudinary", gone);

    await Shop.findByIdAndDelete(shop._id);
  } catch (e) {
    check("Product lifecycle tests", false, e.message);
  }

  console.log("\n===== VENDORA TEST RESULTS =====");
  results.forEach((r) => console.log(r));
  await mongoose.disconnect();
  process.exit(0);
})();