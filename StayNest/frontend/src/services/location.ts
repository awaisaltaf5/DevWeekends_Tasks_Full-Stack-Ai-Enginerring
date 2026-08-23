import api from '../app/api/hotelApi'

export const POPULAR_DESTINATIONS = [
  { name: 'Islamabad', city: 'Islamabad', state: 'Capital Territory', country: 'Pakistan', icon: 'capital' },
  { name: 'Lahore', city: 'Lahore', state: 'Punjab', country: 'Pakistan', icon: 'historical' },
  { name: 'Karachi', city: 'Karachi', state: 'Sindh', country: 'Pakistan', icon: 'coastal' },
  { name: 'Murree', city: 'Murree', state: 'Punjab', country: 'Pakistan', icon: 'mountain' },
  { name: 'Hunza', city: 'Hunza', state: 'Gilgit-Baltistan', country: 'Pakistan', icon: 'mountain' },
  { name: 'Skardu', city: 'Skardu', state: 'Gilgit-Baltistan', country: 'Pakistan', icon: 'mountain' },
  { name: 'Dubai', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', icon: 'city' },
  { name: 'London', city: 'London', state: 'Greater London', country: 'United Kingdom', icon: 'city' },
  { name: 'Paris', city: 'Paris', state: 'Île-de-France', country: 'France', icon: 'city' },
  { name: 'Istanbul', city: 'Istanbul', state: 'Marmara', country: 'Turkey', icon: 'historical' },
  { name: 'New York', city: 'New York', state: 'New York', country: 'United States', icon: 'city' },
]

/**
 * Location search via the backend OpenStreetMap Nominatim proxy.
 * Returns { success, found, city, lat, lon, displayName, ... }.
 */
export async function searchLocation(q) {
  const res = await api.get('/location/search', { params: { q } })
  return res.data
}

/**
 * Fast live location autocomplete suggestions with debouncing & fallbacks.
 */
export async function getLocationSuggestions(q, limit = 5) {
  if (!q || !String(q).trim()) {
    return POPULAR_DESTINATIONS.slice(0, limit)
  }

  try {
    const res = await api.get('/location/suggestions', { params: { q: String(q).trim(), limit } })
    if (res.data?.success && Array.isArray(res.data?.suggestions) && res.data.suggestions.length > 0) {
      return res.data.suggestions
    }
  } catch (err) {
    // Graceful fallback to client-side filter
  }

  const lower = String(q).trim().toLowerCase()
  return POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(lower) ||
      d.city.toLowerCase().includes(lower) ||
      d.country.toLowerCase().includes(lower)
  ).slice(0, limit)
}

// Simple display helpers used across hotel UI.
export const capitalize = (s = '') =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''

// ---------------------------------------------------------------------------
// Currency preference — persisted in localStorage so prices app-wide follow
// the user's choice from Account > Preferences.
// ---------------------------------------------------------------------------
const CURRENCY_KEY = 'sn_currency'

const CURRENCIES = {
  PKR: { symbol: 'Rs', label: 'Pakistani Rupee' },
  USD: { symbol: '$', label: 'US Dollar' },
  EUR: { symbol: '€', label: 'Euro' },
  GBP: { symbol: '£', label: 'British Pound' },
}

let currentCurrency = (() => {
  try {
    const stored = localStorage.getItem(CURRENCY_KEY)
    return CURRENCIES[stored] ? stored : 'PKR'
  } catch {
    return 'PKR'
  }
})()

export const currencyOptions = Object.keys(CURRENCIES).map((code) => ({
  code,
  symbol: CURRENCIES[code].symbol,
  label: CURRENCIES[code].label,
}))

export const getCurrency = () => currentCurrency

export const setCurrency = (code) => {
  if (CURRENCIES[code]) {
    currentCurrency = code
    try {
      localStorage.setItem(CURRENCY_KEY, code)
    } catch {
      /* storage unavailable */
    }
  }
}

export const formatPrice = (n = 0) =>
  `${CURRENCIES[currentCurrency].symbol} ${Number(n).toLocaleString()}`

// ---------------------------------------------------------------------------
// Date helpers used by the booking flow (check-in / check-out / nights).
// ---------------------------------------------------------------------------
const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Difference in whole days between two dates (out − in). */
export const daysBetween = (a, b) => {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.round((d2 - d1) / MS_PER_DAY)
}

/** Format a date as e.g. "Wed, 15 Jan 2025". */
export const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Format a date range "15 Jan – 17 Jan 2025". */
export const formatDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return ''
  const inD = new Date(checkIn)
  const outD = new Date(checkOut)
  const sameMonth = inD.getMonth() === outD.getMonth() && inD.getFullYear() === outD.getFullYear()
  const f = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return sameMonth
    ? `${inD.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${outD.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : `${f(inD)} – ${f(outD)}`
}