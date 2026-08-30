import { GeocodeCache, type GeocodePlace } from '../models';

/**
 * Location search backed by the free OpenStreetMap / Nominatim service.
 *
 * Important: this runs server-side on the backend proxy endpoint so the
 * public Nominatim endpoint is never hit directly from the browser. It also:
 *  - caches lookups in MongoDB for TTL days (default 30) to respect fair-use limits,
 *  - throttles concurrent upstream requests to at most 1 per second.
 */

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const CACHE_TTL_DAYS = 30;
const ACCEPT_LANGUAGE = 'en';

// Minimum millis between upstream requests; protects public service limits.
const RATE_LIMIT_MS = 1000;
let lastRequestAt = 0;

/** Sanitize a location query to a stable cache key. */
function queryKey(input: string): string {
  return input.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Sleep until the rate-limit window has elapsed. */
async function respectRateLimit(): Promise<void> {
  const waitTime = lastRequestAt + RATE_LIMIT_MS - Date.now();
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestAt = Date.now();
}

/**
 * Search for places matching `q` using Nominatim.
 * Returns cached results when available; otherwise calls the provider, stores
 * the result, and returns it.
 */
export async function searchPlaces(q: string, limit = 6): Promise<GeocodePlace[]> {
  const clean = q.trim();
  if (!clean) {
    return [];
  }

  const key = queryKey(clean);
  const now = new Date();

  // 1. Cache hit.
  const cached = await GeocodeCache.findOne({ queryKey: key, expiresAt: { $gt: now } }).lean();
  if (cached) {
    return cached.results.slice(0, limit);
  }

  // 2. Upstream fetch (throttled) with a proper user-agent as required by Nominatim.
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('q', clean);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', ACCEPT_LANGUAGE);

  await respectRateLimit();

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'DoclyTelemedicine/1.0 (doctor booking & telemedicine app)',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Geocoding provider returned status ${response.status}`);
  }

  const body = (await response.json()) as unknown;
  const rows = Array.isArray(body) ? (body as NominatimResult[]) : [];

  const results: GeocodePlace[] = rows.map((row) => ({
    displayName: row.display_name ?? '',
    lat: parseFloat(row.lat),
    lon: parseFloat(row.lon),
    city:
      row.address?.city ??
      row.address?.town ??
      row.address?.village ??
      row.address?.county ??
      '',
    state: row.address?.state ?? '',
    country: row.address?.country ?? '',
    boundingbox: (row.boundingbox ?? []).map((v) => Number(v)),
  }));

  // 3. Store in cache (with TTL), upserting if the key somehow changed.
  const expiresAt = new Date(now.getTime() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
  await GeocodeCache.updateOne(
    { queryKey: key },
    { $set: { query: clean, results, createdAt: now, expiresAt } },
    { upsert: true },
  );

  return results.slice(0, limit);
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  display_name?: string;
  lat: string;
  lon: string;
  boundingbox?: string[];
  address?: NominatimAddress;
}