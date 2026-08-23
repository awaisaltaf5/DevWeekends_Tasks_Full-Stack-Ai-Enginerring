import axios from 'axios'

/**
 * Shared Axios instance for the StayNest frontend.
 *
 * - `VITE_API_URL` is read from the Vite environment so the same code works in
 *   dev (proxy) and prod (absolute URL).
 * - A request interceptor attaches the JWT from localStorage so every request
 *   is authenticated once auth is wired up.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL || '/api'
const apiBaseUrl = configuredApiUrl.replace(/\/+$/, '').endsWith('/api')
  ? configuredApiUrl.replace(/\/+$/, '')
  : `${configuredApiUrl.replace(/\/+$/, '')}/api`

const api = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
