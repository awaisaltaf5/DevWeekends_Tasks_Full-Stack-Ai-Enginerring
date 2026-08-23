/**
 * Minimal Unsplash API client (public/search endpoints).
 *
 * The Unsplash public access key is exposed via VITE_UNSPLASH_ACCESS_KEY and
 * is meant to be public (it's the "demo" tier used in browsers). Because the
 * free public key is rate-limited (~50 requests/hour per IP), every response
 * is cached in localStorage with a TTL so repeated views never burn quota.
 *
 * Returns normalized photo records:
 *   { id, url, thumb, alt, author }
 */

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ''
const BASE = 'https://api.unsplash.com'
const CACHE_KEY = 'sn_unsplash_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}
  } catch {
    return {}
  }
}

function writeCache(obj) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch {
    /* storage unavailable — cache is best-effort */
  }
}

/**
 * Search Unsplash photos for a query and return normalized records.
 * Cached per-query for 24h to respect the demo rate limit.
 */
export async function searchPhotos(query, { perPage = 3 } = {}) {
  const key = String(query || 'hotel').trim().toLowerCase()
  if (!key) return []

  const cache = readCache()
  const hit = cache[key]
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.items

  if (!ACCESS_KEY) return []

  const url = `${BASE}/search/photos?query=${encodeURIComponent(key)}&per_page=${perPage}`
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } })
  if (!res.ok) throw new Error(`Unsplash request failed (${res.status})`)

  const data = await res.json()
  const items = (data.results || []).map((p) => ({
    id: p.id,
    url: p.urls?.regular || '',
    thumb: p.urls?.small || p.urls?.thumb || p.urls?.regular || '',
    alt: p.alt_description || p.description || '',
    author: p.user?.name || '',
  }))

  cache[key] = { items, ts: Date.now() }
  writeCache(cache)
  return items
}

/**
 * Fetch a single validated image for a query with its details.
 * Returns the first result or null when unavailable.
 */
export async function fetchImage(query, { perPage = 1 } = {}) {
  const items = await searchPhotos(query, { perPage })
  return items[0] || null
}
