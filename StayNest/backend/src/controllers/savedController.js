const mongoose = require('mongoose');
const SavedHotel = require('../models/SavedHotel');
const Hotel = require('../models/Hotel');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/error');

/**
 * @POST /api/saved
 * Save a hotel for the authenticated user. Body: { hotel: <hotelId> }.
 * A duplicate save (same user + hotel) returns the existing row with a 200
 * instead of failing — the endpoint is idempotent.
 */
exports.saveHotel = asyncHandler(async (req, res, next) => {
  const { hotel } = req.body;
  const userId = req.user._id;

  if (!hotel || !mongoose.isValidObjectId(hotel)) {
    return next(new AppError(400, 'A valid hotel is required'));
  }

  const hotelDoc = await Hotel.findOne({ _id: hotel, isActive: true });
  if (!hotelDoc) {
    return next(new AppError(404, 'Hotel not found or not available'));
  }

  // Check for an existing save first so duplicates are handled explicitly.
  const existing = await SavedHotel.findOne({ user: userId, hotel: hotelDoc._id });
  if (existing) {
    await SavedHotel.populate(existing, { path: 'hotel' });
    return res.status(200).json({ success: true, saved: existing });
  }

  try {
    const saved = await SavedHotel.create({ user: userId, hotel: hotelDoc._id });
    await SavedHotel.populate(saved, { path: 'hotel' });
    res.status(201).json({ success: true, saved });
  } catch (err) {
    // Race-condition guard: two concurrent saves hitting the unique index.
    if (err.code === 11000) {
      const existing = await SavedHotel.findOne({
        user: userId,
        hotel: hotelDoc._id,
      }).populate('hotel');
      return res.status(200).json({ success: true, saved: existing });
    }
    throw err;
  }
});

/**
 * @GET /api/saved
 * List every hotel the authenticated user has saved (newest first), with the
 * full hotel document populated for display.
 */
exports.getSavedHotels = asyncHandler(async (req, res) => {
  const saved = await SavedHotel.find({ user: req.user._id })
    .populate('hotel')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: saved.length,
    saved,
  });
});

/**
 * @DELETE /api/saved/:hotelId
 * Remove a hotel from the authenticated user's saved list. `hotelId` in the
 * URL is the Hotel document's id (not the SavedHotel id). Removing a hotel
 * that was not saved is treated as a no-op success.
 */
exports.removeSavedHotel = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(hotelId)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }

  const deleted = await SavedHotel.findOneAndDelete({
    user: userId,
    hotel: hotelId,
  });

  res.status(200).json({
    success: true,
    message: deleted ? 'Hotel removed from saved' : 'Hotel was not saved',
  });
});
