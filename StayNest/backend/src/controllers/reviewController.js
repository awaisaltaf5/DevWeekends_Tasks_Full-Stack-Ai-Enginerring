const mongoose = require('mongoose');
const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/error');

/**
 * Recompute and persist a hotel's rating + reviewCount from its real reviews.
 *
 * Called after every create / update / delete so the Hotel document's
 * `rating` and `reviewCount` always reflect the actual reviews.
 */
const recomputeHotelRating = async (hotelId) => {
  const result = await Review.aggregate([
    { $match: { hotel: hotelId } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = result[0];
  const count = stats?.count || 0;
  // Round to 1 decimal place for a clean display value.
  const rating = stats ? Math.round(stats.avg * 10) / 10 : 0;

  await Hotel.findByIdAndUpdate(hotelId, { rating, reviewCount: count });
};

/**
 * @GET /api/hotels/:hotelId/reviews  (public)
 * List every review for a hotel (newest first), with the reviewer populated
 * so the UI can show the reviewer's name/avatar.
 */
exports.getHotelReviews = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  if (!mongoose.isValidObjectId(hotelId)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError(404, 'Hotel not found'));
  }

  const reviews = await Review.find({ hotel: hotelId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, reviews });
});

/**
 * @POST /api/hotels/:hotelId/reviews  (authenticated)
 * Create a review for a hotel. A user may only review a given hotel once —
 * attempting to post a duplicate returns the existing review (idempotent).
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.isValidObjectId(hotelId)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return next(new AppError(404, 'Hotel not found'));
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return next(new AppError(400, 'Rating must be a whole number between 1 and 5'));
  }

  // Duplicate prevention: one review per user per hotel.
  const existing = await Review.findOne({ user: req.user._id, hotel: hotelId });
  if (existing) {
    await Review.populate(existing, { path: 'user', select: 'name avatar' });
    return res.status(200).json({ success: true, existing: true, review: existing });
  }

  const review = await Review.create({
    user: req.user._id,
    hotel: hotelId,
    rating: ratingNum,
    comment: typeof comment === 'string' ? comment.trim() : '',
  });

  // Pass the hotel's real ObjectId so the aggregation $match compares like-for-like.
  await recomputeHotelRating(hotel._id);
  await Review.populate(review, { path: 'user', select: 'name avatar' });

  res.status(201).json({ success: true, review });
});

/**
 * @PUT /api/reviews/:id  (authenticated, owner only)
 * Update a review's rating / comment. The query is scoped to the owner, so a
 * non-owner gets a 404 (no existence leak).
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid review ID'));
  }

  const review = await Review.findOne({ _id: id, user: req.user._id });
  if (!review) {
    return next(new AppError(404, 'Review not found'));
  }

  const { rating, comment } = req.body;

  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return next(new AppError(400, 'Rating must be a whole number between 1 and 5'));
    }
    review.rating = ratingNum;
  }
  if (comment !== undefined) {
    review.comment = typeof comment === 'string' ? comment.trim() : '';
  }

  await review.save();
  await recomputeHotelRating(review.hotel);
  await Review.populate(review, { path: 'user', select: 'name avatar' });

  res.status(200).json({ success: true, review });
});

/**
 * @DELETE /api/reviews/:id  (authenticated, owner only)
 * Delete a review the current user owns. Non-owners get a 404.
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid review ID'));
  }

  const review = await Review.findOneAndDelete({ _id: id, user: req.user._id });
  if (!review) {
    return next(new AppError(404, 'Review not found'));
  }

  await recomputeHotelRating(review.hotel);

  res.status(200).json({ success: true, message: 'Review deleted' });
});