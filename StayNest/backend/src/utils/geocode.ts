/**
 * Location search via the free OpenStreetMap Nominatim geocoding API with
 * built-in fallback suggestions for fast, reliable autocomplete.
 */

const POPULAR_DESTINATIONS = [
  { name: 'Islamabad', city: 'Islamabad', state: 'Islamabad Capital Territory', country: 'Pakistan', lat: 33.6844, lon: 73.0479 },
  { name: 'Lahore', city: 'Lahore', state: 'Punjab', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  { name: 'Karachi', city: 'Karachi', state: 'Sindh', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Rawalpindi', city: 'Rawalpindi', state: 'Punjab', country: 'Pakistan', lat: 33.5651, lon: 73.0169 },
  { name: 'Murree', city: 'Murree', state: 'Punjab', country: 'Pakistan', lat: 33.9070, lon: 73.3943 },
  { name: 'Hunza', city: 'Hunza', state: 'Gilgit-Baltistan', country: 'Pakistan', lat: 36.3167, lon: 74.6500 },
  { name: 'Skardu', city: 'Skardu', state: 'Gilgit-Baltistan', country: 'Pakistan', lat: 35.2971, lon: 75.6333 },
  { name: 'Peshawar', city: 'Peshawar', state: 'Khyber Pakhtunkhwa', country: 'Pakistan', lat: 34.0151, lon: 71.5249 },
  { name: 'Multan', city: 'Multan', state: 'Punjab', country: 'Pakistan', lat: 30.1575, lon: 71.5249 },
  { name: 'Faisalabad', city: 'Faisalabad', state: 'Punjab', country: 'Pakistan', lat: 31.4504, lon: 73.1350 },
  { name: 'Dubai', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'London', city: 'London', state: 'Greater London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', city: 'Paris', state: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Istanbul', city: 'Istanbul', state: 'Marmara', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'New York', city: 'New York', state: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo', city: 'Tokyo', state: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Singapore', city: 'Singapore', state: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Bangkok', city: 'Bangkok', state: 'Central Thailand', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Rome', city: 'Rome', state: 'Lazio', country: 'Italy', lat: 41.9028, lon: 12.4964 },
];

function formatNominatimPlace(place) {
  const address = place.address || {};
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state ||
    place.name ||
    '';
  const state = address.state || address.province || address.region || '';
  const country = address.country || '';

  return {
    name: place.name || city,
    city,
    state,
    country,
    displayName: place.display_name,
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
    address,
  };
}

async function geocode(query) {
  if (!query || !String(query).trim()) return null;
  const q = String(query).trim();

  // Try Nominatim
  try {
    const url =
      'https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=' +
      encodeURIComponent(q);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'StayNest/1.0 (hotel discovery search; contact: dev@staynest.local)',
        'Accept-Language': 'en',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const top = formatNominatimPlace(data[0]);
        const suggestions = data.map(formatNominatimPlace);
        return {
          ...top,
          suggestions,
        };
      }
    }
  } catch (err) {
    // Fall back to local list
  }

  // Fallback to local curated destinations
  const lowerQ = q.toLowerCase();
  const matches = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQ) ||
      d.city.toLowerCase().includes(lowerQ) ||
      d.country.toLowerCase().includes(lowerQ)
  );

  if (matches.length > 0) {
    const top = matches[0];
    return {
      name: top.name,
      city: top.city,
      state: top.state,
      country: top.country,
      displayName: `${top.city}, ${top.state ? top.state + ', ' : ''}${top.country}`,
      lat: top.lat,
      lon: top.lon,
      suggestions: matches.map((m) => ({
        name: m.name,
        city: m.city,
        state: m.state,
        country: m.country,
        displayName: `${m.city}, ${m.state ? m.state + ', ' : ''}${m.country}`,
        lat: m.lat,
        lon: m.lon,
      })),
    };
  }

  return null;
}

async function geocodeSuggestions(query, limit = 5) {
  if (!query || !String(query).trim()) {
    return POPULAR_DESTINATIONS.slice(0, limit).map((m) => ({
      name: m.name,
      city: m.city,
      state: m.state,
      country: m.country,
      displayName: `${m.city}, ${m.state ? m.state + ', ' : ''}${m.country}`,
      lat: m.lat,
      lon: m.lon,
    }));
  }

  const res = await geocode(query);
  if (res && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
    return res.suggestions.slice(0, limit);
  }

  const lowerQ = String(query).trim().toLowerCase();
  const matches = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQ) ||
      d.city.toLowerCase().includes(lowerQ) ||
      d.country.toLowerCase().includes(lowerQ)
  );

  return matches.slice(0, limit).map((m) => ({
    name: m.name,
    city: m.city,
    state: m.state,
    country: m.country,
    displayName: `${m.city}, ${m.state ? m.state + ', ' : ''}${m.country}`,
    lat: m.lat,
    lon: m.lon,
  }));
}

module.exports = { geocode, geocodeSuggestions, POPULAR_DESTINATIONS };
