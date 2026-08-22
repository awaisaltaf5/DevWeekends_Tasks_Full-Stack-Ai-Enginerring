const express = require('express');
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const {
  getHotelReviews,
  createReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

/**
 * Hotel discovery/search routes.
 *
 * GET    /api/hotels              -> public (list + filters)
 * GET    /api/hotels/:id          -> public (detail)
 * GET    /api/hotels/:id/reviews  -> public (list reviews)
 * POST   /api/hotels/:id/reviews  -> authenticated (create a review)
 * POST   /api/hotels              -> admin
 * PUT    /api/hotels/:id          -> admin
 * DELETE /api/hotels/:id          -> admin
 */
router
  .route('/')
  .get(getHotels)
  .post(protect, admin, createHotel);

router.route('/:hotelId/reviews').get(getHotelReviews).post(protect, createReview);

router
  .route('/:id')
  .get(getHotelById)
  .put(protect, admin, updateHotel)
  .delete(protect, admin, deleteHotel);

module.exports = router;
