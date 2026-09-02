/* Temp verification script: seeds test users into MongoDB Atlas via Mongoose. */
process.env.NODE_ENV = "development";
require("dotenv").config({ path: "config/.env" });
const mongoose = require("mongoose");
const User = require("./model/user");
const Shop = require("./model/shop");
const Product = require("./model/product");
const Order = require("./model/order");
const Event = require("./model/event");
const Coupon = require("./model/coupounCode");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connected to Atlas");

  // verify each model maps to a collection
  const models = { User, Shop, Product, Order, Event, Coupon };
  for (const [name, m] of Object.entries(models)) {
    const count = await m.estimatedDocumentCount();
    console.log(`${name}: ${count} docs`);
  }

  const existing = await User.findOne({ email: "admin@vendora.test" });
  if (!existing) {
    await User.create({
      name: "Vendora Admin",
      email: "admin@vendora.test",
      password: "vendora123",
      role: "Admin",
      avatar: "avatar-test.png",
    });
    console.log("admin user created");
  } else {
    console.log("admin user already exists");
  }

  const buyer = await User.findOne({ email: "buyer@vendora.test" });
  if (!buyer) {
    await User.create({
      name: "Vendora Buyer",
      email: "buyer@vendora.test",
      password: "vendora123",
      avatar: "avatar-test.png",
    });
    console.log("buyer user created");
  } else {
    console.log("buyer user already exists");
  }

  await mongoose.disconnect();
  console.log("seed done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
