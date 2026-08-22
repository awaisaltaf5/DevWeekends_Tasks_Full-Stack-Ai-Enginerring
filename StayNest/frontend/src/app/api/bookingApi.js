import api from '../../app/api/hotelApi'

/**
 * Booking API client.
 *
 * Uses the shared `api` axios instance, which automatically attaches the JWT
 * stored in localStorage, so every request here is authenticated.
 */
export const createBooking = async (payload) => {
  const res = await api.post('/bookings', payload)
  return res.data
}

export const fetchBookings = async () => {
  const res = await api.get('/bookings')
  return res.data
}

export const fetchBooking = async (id) => {
  const res = await api.get(`/bookings/${id}`)
  return res.data
}

export const cancelBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/cancel`)
  return res.data
}
