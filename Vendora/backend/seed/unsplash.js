/**
 * Vendora — Unsplash image utility (backend only).
 * Fetches relevant product photos from the Unsplash API using
 * UNSPLASH_ACCESS_KEY and returns direct images.unsplash.com URLs
 * (which are served publicly — the key is never needed at runtime).
 *
 * Results are cached in seed/.unsplash-cache.json so re-seeding does
 * not re-hit the API. Falls back to curated per-category URLs when the
 * API is unavailable, so seeding never fails.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../config/.env") });
const fs = require("fs");
const path = require("path");

const CACHE_FILE = path.join(__dirname, ".unsplash-cache.json");
let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
} catch (_) {
  cache = {};
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

/**
 * Fetch one product-matching image URL for a search query.
 * `orientation`/size are normalised by Unsplash (w=800, quality auto).
 */
async function fetchImage(query) {
  if (cache[query]) return cache[query];

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.warn("UNSPLASH_ACCESS_KEY missing — using fallback image");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (res.status === 429) {
      console.warn(`Unsplash rate limit reached (resets hourly) — "${query}" will be retried on the next seed run`);
      return null;
    }
    if (!res.ok) throw new Error(`Unsplash API ${res.status}`);
    const data = await res.json();
    const url = data.results?.[0]?.urls?.regular;
    if (!url) throw new Error("No results");
    cache[query] = url;
    // persist the cache occasionally (cheap enough to write each time at seed scale)
    saveCache();
    return url;
  } catch (err) {
    console.warn(`Unsplash fetch failed for "${query}": ${err.message}`);
    return null;
  }
}

module.exports = { fetchImage };
