// Vendora — activation email delivery test.
// Verifies the real sendMail util sends successfully (and prints the From address used)
// so you can confirm the activation link email is genuinely being delivered.
require("dotenv").config({ path: "config/.env" });
const sendMail = require("./utils/sendMail");
const templates = require("./utils/emailTemplates");

const to = process.argv[2] || "awaisaltaf5@gmail.com";

(async () => {
  const activationUrl = `${process.env.CLIENT_URL}/seller/activation/test.token.here`;
  await sendMail({
    email: to,
    subject: "Vendora — Activate your seller shop (delivery test)",
    html: templates.shopActivation({ name: "Vendora Test Seller", activationUrl }),
    message: `Hello, click here to activate: ${activationUrl}`,
  });
  console.log(`EMAIL SENT OK -> ${to}`);
  console.log(`  From: ${process.env.EMAIL_FROM || process.env.SMTP_USER}`);
  console.log(`  Activation URL: ${activationUrl}`);
  process.exit(0);
})().catch((e) => {
  console.error("EMAIL FAILED:", e.message);
  process.exit(1);
});