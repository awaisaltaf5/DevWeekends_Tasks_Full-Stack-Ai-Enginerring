/**
 * Minimal Unsplash integration used by the seed script.
 *
 * The access key is read from `process.env.UNSPLASH_ACCESS_KEY` — it is NEVER
 * hardcoded. If the key is not configured, `fetchPhoto` returns `null` so
 * callers can fall back to a generated placeholder image.
 *
 * Setup: add the following to backend/.env
 *   UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>
 */
const UNSPLASH_SEARCH = 'https://api.unsplash.com/search/photos';

/** Returns a small, crop-friendly photo URL for the given topic, or null. */
export async function fetchPhoto(topic: string, seedOffset = 0): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return null;
  }

  try {
    const url = new URL(UNSPLASH_SEARCH);
    url.searchParams.set('query', topic);
    url.searchParams.set('per_page', '3');
    url.searchParams.set('orientation', 'portrait');
    url.searchParams.set('page', String((seedOffset % 5) + 1));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${key}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as UnsplashResponse;
    const photo = body.results?.[seedOffset % (body.results.length || 1)];
    if (!photo) {
      return null;
    }
    // Request a portrait crop (~400x400) to keep image payloads small.
    return `${photo.urls.raw}&fit=crop&w=400&h=400&q=80&fm=jpg`;
  } catch {
    return null;
  }
}

/** A deterministic, free placeholder avatar used when Unsplash is unavailable. */
export function placeholderAvatar(name: string): string {
  const encoded = encodeURIComponent(name.trim());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encoded}&backgroundColor=bfdbfe`;
}

interface UnsplashUrls {
  raw: string;
}

interface UnsplashPhoto {
  urls: UnsplashUrls;
}

interface UnsplashResponse {
  results?: UnsplashPhoto[];
}