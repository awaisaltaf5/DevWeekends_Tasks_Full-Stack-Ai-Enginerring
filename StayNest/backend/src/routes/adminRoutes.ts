const express = require('express');
const { getUsers } = require('../controllers/authController');
const {
  getStats,
  getAdminHotels,
  createAdminHotel,
  updateAdminHotel,
  deleteAdminHotel,
  getAdminBookings,
  getAdminBooking,
  updateBookingStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

/**
 * Admin-only routes. `protect` runs first (authenticates the JWT and loads
 * the user), then `admin` enforces the role.
 *
 * @route   GET  /api/admin/stats               -> dashboard summary
 * @route   GET  /api/admin/hotels              -> list all hotels
 * @route   POST /api/admin/hotels              -> create hotel
 * @route   PUT  /api/admin/hotels/:id          -> update / toggle hotel
 * @route   DELETE /api/admin/hotels/:id        -> delete hotel
 * @route   GET  /api/admin/bookings            -> list all bookings
 * @route   GET  /api/admin/bookings/:id        -> booking detail
 * @route   PUT  /api/admin/bookings/:id/status -> change booking status
 * @route   GET  /api/admin/users               -> list all users
 *
 * NOTE: there is intentionally no user-deletion endpoint here, so an admin
 * can never accidentally remove their own (or any) account.
 */
router.use(protect, admin);

router.get('/stats', getStats);

router
  .route('/hotels')
  .get(getAdminHotels)
  .post(createAdminHotel);
router
  .route('/hotels/:id')
  .put(updateAdminHotel)
  .delete(deleteAdminHotel);

router.get('/bookings', getAdminBookings);
router.get('/bookings/:id', getAdminBooking);
router.put('/bookings/:id/status', updateBookingStatus);

router.get('/users', getUsers);

module.exports = router;
