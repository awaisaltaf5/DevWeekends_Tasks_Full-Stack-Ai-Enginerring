import api from './hotelApi'

/**
 * Thin typed wrappers around the admin-only backend endpoints
 * (/api/admin/*). The shared `api` axios instance attaches the JWT and the
 * backend enforces the `admin` role, so only admins can use these.
 */

export const getAdminStats = () => api.get('/admin/stats').then((r) => r.data)

export const getAdminHotels = (params) =>
  api.get('/admin/hotels', { params }).then((r) => r.data)

export const createAdminHotel = (data) =>
  api.post('/admin/hotels', data).then((r) => r.data)

export const updateAdminHotel = (id, data) =>
  api.put(`/admin/hotels/${id}`, data).then((r) => r.data)

export const deleteAdminHotel = (id) =>
  api.delete(`/admin/hotels/${id}`).then((r) => r.data)

export const getAdminBookings = (params) =>
  api.get('/admin/bookings', { params }).then((r) => r.data)

export const updateBookingStatus = (id, status) =>
  api.put(`/admin/bookings/${id}/status`, { status }).then((r) => r.data)

export const getAdminUsers = () => api.get('/admin/users').then((r) => r.data)
