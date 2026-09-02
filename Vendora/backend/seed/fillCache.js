/**
 * Vendora — one-time cache filler for pending seed images.
 * Uses ONE Unsplash API request per category (per_page=30) and distributes
 * distinct, category-matching photos to each pending product — instead of
 * one request per product. Results are written into seed/.unsplash-cache.json
 * keyed by each product's search query, so `npm run seed` then runs fully
 * offline from cache.
 *
 * Usage (from backend/): node seed/fillCache.js [--watch]
 *   --watch: retry every 5 minutes until the hourly rate limit resets.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../config/.env") });
const fs = require("fs");
const path = require("path");

const CACHE_FILE = path.join(__dirname, ".unsplash-cache.json");
const products = [
  ...require("./productsA"),
  ...require("./productsB"),
  ...require("./productsC"),
  ...require("./productsD"),
];

// category -> a single broad search query that matches every product in it
const CATEGORY_QUERY = {
  "Pet Care": "pet dog cat",
  "Mobile and Tablets": "smartphone",
  "Music and Gaming": "gaming",
  Others: "home product",
};

const WATCH = process.argv.includes("--watch");

function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (_) { return {}; }
}
function saveCache(c) { fs.writeFileSync(CACHE_FILE, JSON.stringify(c)); }

// pending = products whose query is not yet cached
function pendingByCategory(cache) {
  const map = {};
  for (const p of products) {
    if (cache[p.query]) continue;
    const q = CATEGORY_QUERY[p.category];
    if (!q) continue;
    (map[q] = map[q] || { category: p.category, items: [] }).items.push(p);
  }
  return map;
}

async function searchUnsplash(q, perPage) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (key) {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=squarish&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (res.ok) return (await res.json()).results || [];
    console.log(`official API ${res.status} for "${q}" — falling back to public search`);
  }
  // public fallback (no key required) — same response shape
  const res2 = await fetch(
    `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=${perPage}`,
    { headers: { "User-Agent": "curl/8.0.0", Accept: "*/*" } }
  );
  if (!res2.ok) throw new Error(`public search ${res2.status} for "${q}"`);
  return (await res2.json()).results || [];
}

async function fillOnce() {
  const cache = loadCache();
  const batches = pendingByCategory(cache);
  const queries = Object.keys(batches);
  if (queries.length === 0) return true;

  for (const q of queries) {
    const { items } = batches[q];
    try {
      const results = await searchUnsplash(q, 30);
      const urls = results.map((r) => r.urls?.regular).filter(Boolean);
      if (urls.length === 0) { console.log(`no results for "${q}"`); continue; }
      // distribute distinct photos across the category's products
      items.forEach((p, i) => {
        cache[p.query] = urls[i % urls.length];
      });
      console.log(`"${q}": filled ${items.length} products from ${Math.min(urls.length, items.length)} distinct photos`);
      saveCache(cache);
    } catch (err) {
      console.log(err.message);
    }
  }
  // done when no uncached products remain
  return Object.keys(pendingByCategory(loadCache())).length === 0;
}

(async () => {
  if (await fillOnce()) { console.log("cache complete"); process.exit(0); }
  if (!WATCH) process.exit(1);
  for (let attempt = 2; attempt <= 20; attempt++) {
    console.log(`waiting 5 min before retry ${attempt}...`);
    await new Promise((r) => setTimeout(r, 5 * 60 * 1000));
    if (await fillOnce()) { console.log("cache complete"); process.exit(0); }
  }
  process.exit(1);
})();
