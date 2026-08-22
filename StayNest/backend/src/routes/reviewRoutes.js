const express = require('express');
const { protect } = require('../middleware/auth');
const {
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

/**
 * Review mutation routes (PUT / DELETE) — require authentication.
 *
 * PUT    /api/reviews/:id  -> update own review (owner only; non-owner = 404)
 * DELETE /api/reviews/:id  -> delete own review (owner only; non-owner = 404)
 *
 * Reading reviews for a hotel (GET) and posting a new one (POST) live under
 * the nested hotel route: /api/hotels/:hotelId/reviews (see hotelRoutes).
 */
router.use(protect);
router.route('/:id').put(updateReview).delete(deleteReview);

module.exports = router;
