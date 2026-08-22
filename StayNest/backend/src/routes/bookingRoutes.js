const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

/**
 * Booking routes — all require authentication.
 *
 * GET    /api/bookings          -> list the current user's bookings
 * POST   /api/bookings          -> create a booking (price recalculated server-side)
 * GET    /api/bookings/:id      -> fetch a booking (owner only — 404 otherwise)
 * PUT    /api/bookings/:id/cancel -> cancel a booking (pending/confirmed only)
 *
 * Ownership is enforced in the controllers by scoping every query to
 * `user: req.user._id`, so a user can never read or mutate another user's
 * booking.
 */
router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
