/**
 * Vendora — database seed runner.
 *
 * Populates MongoDB Atlas with realistic mock sellers and ~78 products
 * across 10 categories, with product-matching Unsplash images.
 *
 * Usage (from backend/):
 *   npm run seed            — seeds only if no seeded products exist (idempotent)
 *   npm run seed -- --force — wipes seeded products and re-seeds
 *
 * Safe by design: never touches real users/orders; only creates shops
 * with @vendora.test emails and products belonging to them.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../config/.env") });
const mongoose = require("mongoose");
const Shop = require("../model/shop");
const Product = require("../model/product");

const shopsData = require("./shops");
const unsplash = require("./unsplash");
const productsData = [
  ...require("./productsA"),
  ...require("./productsB"),
  ...require("./productsC"),
  ...require("./productsD"),
];

const FORCE = process.argv.includes("--force");

function descriptionFor(p) {
  return (
    `${p.name} by ${p.brand}. ` +
    `A customer favourite in our ${p.category} range, chosen for its quality, durability and everyday value. ` +
    `Sold and shipped by a verified Vendora seller. Check the seller's storefront for the full ${p.category} collection.`
  );
}

// simple concurrency-limited image fetcher
async function fetchAllImages(products) {
  const results = new Array(products.length);
  const CONCURRENCY = 4;
  let next = 0;
  async function worker() {
    while (next < products.length) {
      const i = next++;
      const url = await unsplash.fetchImage(products[i].query);
      results[i] = url;
      process.stdout.write(`\rimages ${i + 1}/${products.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log("");
  return results;
}

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI missing — check backend/config/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas");

  // 1. Seed shops (upsert by email — keeps existing seller workflow intact)
  const shopMap = {}; // category -> shop doc
  for (const s of shopsData) {
    let shop = await Shop.findOne({ email: s.email });
    if (!shop) {
      shop = await Shop.create(s);
      console.log(`created shop: ${shop.name}`);
    } else {
      console.log(`shop exists:  ${shop.name}`);
    }
    shopMap[s.category] = shop;
  }

  // 2. Resume-safe guard: products already seeded WITH images are kept;
  //    missing/incomplete ones are retried. Never duplicates products.
  const seededShopIds = Object.values(shopMap).map((s) => String(s._id));
  const existingProducts = await Product.find(
    { shopId: { $in: seededShopIds } },
    { name: 1, images: 1 }
  );
  const existingByName = new Map(existingProducts.map((p) => [p.name, p]));
  const pending = productsData.filter((p) => {
    const existing = existingByName.get(p.name);
    return !existing || !existing.images || existing.images.length === 0;
  });
  const skipped = productsData.length - pending.length;
  if (skipped > 0) console.log(`${skipped} products already seeded with images — skipping them.`);
  if (pending.length === 0) {
    console.log("\nNothing to do. Use --force to wipe and re-seed.");
    await mongoose.disconnect();
    process.exit(0);
  }
  if (FORCE) {
    const del = await Product.deleteMany({ shopId: { $in: seededShopIds } });
    console.log(`force: removed ${del.deletedCount} seeded products`);
    pending.splice(0, pending.length, ...productsData);
  }
  console.log(`${pending.length} products to seed.`);

  // 3. Fetch product-matching images (only for pending products)
  console.log(`fetching ${pending.length} Unsplash images...`);
  const images = await fetchAllImages(pending);

  // 4. Create products
  let created = 0;
  for (let i = 0; i < pending.length; i++) {
    const p = pending[i];
    const shop = shopMap[p.category];
    const image = images[i];
    if (!image) {
      console.warn(`skip "${p.name}" — no image available`);
      continue;
    }
    // deterministic pseudo-random ratings/sold for a realistic storefront
    const soldOut = (i * 7) % 40;
    const reviewCount = (i * 3) % 12;
    const rating = Math.round((3.6 + ((i * 13) % 14) / 10) * 10) / 10; // 3.6 – 4.9
    await Product.create({
      name: p.name,
      description: descriptionFor(p),
      category: p.category,
      tags: p.tags,
      originalPrice: p.originalPrice,
      discountPrice: p.discountPrice,
      stock: p.stock,
      images: [image],
      shopId: String(shop._id),
      shop: { _id: String(shop._id), name: shop.name, avatar: shop.avatar },
      sold_out: soldOut,
      ratings: rating,
      reviews: Array.from({ length: reviewCount }, (_, r) => ({
        user: { _id: String(shop._id) + r, name: ["Aisha", "Ben", "Carla", "Diego", "Emma", "Farid"][r % 6] },
        rating: 3 + ((i + r) % 3),
        comment: ["Great quality, fast delivery!", "Exactly as described.", "Good value for the price.", "Works perfectly, recommend it."][(i + r) % 4],
        productId: null,
      })),
    });
    created++;
  }

  console.log(`\nSeeding complete: ${created} products across ${shopsData.length} shops.`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
