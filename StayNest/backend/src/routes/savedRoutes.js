const express = require('express');
const { protect } = require('../middleware/auth');
const {
  saveHotel,
  getSavedHotels,
  removeSavedHotel,
} = require('../controllers/savedController');

const router = express.Router();

/**
 * Saved-hotel routes — all require authentication.
 *
 * POST   /api/saved            -> save a hotel (idempotent)
 * GET    /api/saved            -> list the current user's saved hotels
 * DELETE /api/saved/:hotelId   -> remove a saved hotel
 *
 * Every query is scoped to `user: req.user._id`, so users can only ever see
 * or mutate their own saved list.
 */
router.use(protect);

router.post('/', saveHotel);
router.get('/', getSavedHotels);
router.delete('/:hotelId', removeSavedHotel);

module.exports = router;
