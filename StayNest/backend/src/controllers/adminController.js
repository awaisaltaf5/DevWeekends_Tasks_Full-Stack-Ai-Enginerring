const mongoose = require('mongoose');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/error');

/**
 * Admin-only controllers. All routes are mounted behind `protect` + `admin`
 * in adminRoutes, so `req.user` is always an authenticated admin here.
 */

/**
 * @GET /api/admin/stats
 * Dashboard summary: aggregate counts for users, hotels and bookings plus
 * total revenue (sum of totalPrice across confirmed/completed bookings).
 */
exports.getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalHotels, totalBookings, revenueResult] =
    await Promise.all([
      User.countDocuments({}),
      Hotel.countDocuments({}),
      Booking.countDocuments({}),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalHotels,
      totalBookings,
      totalRevenue: revenueResult[0]?.total || 0,
    },
  });
});

/**
 * @GET /api/admin/hotels
 * List EVERY hotel (including inactive/featured state) for the management
 * table. Supports an optional ?search= query across name/city.
 */
exports.getAdminHotels = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search && String(search).trim()) {
    const rx = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { city: rx }];
  }

  const hotels = await Hotel.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: hotels.length, hotels });
});

/**
 * @POST /api/admin/hotels
 * Create a hotel. Validation is delegated to the Hotel schema.
 */
exports.createAdminHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({ success: true, hotel });
});

/**
 * @PUT /api/admin/hotels/:id
 * Update a hotel (name, price, images, isActive toggle, etc.).
 */
exports.updateAdminHotel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }
  const hotel = await Hotel.findByIdAndUpdate(id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!hotel) {
    return next(new AppError(404, 'Hotel not found'));
  }
  res.status(200).json({ success: true, hotel });
});

/**
 * @DELETE /api/admin/hotels/:id
 * Permanently delete a hotel.
 */
exports.deleteAdminHotel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }
  const hotel = await Hotel.findByIdAndDelete(id);
  if (!hotel) {
    return next(new AppError(404, 'Hotel not found'));
  }
  res.status(200).json({ success: true, message: 'Hotel deleted' });
});

/**
 * @GET /api/admin/bookings
 * List all bookings (across all users) with user + hotel populated.
 * Supports optional ?status= filter.
 */
exports.getAdminBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && Booking.schema.path('status').enumValues.includes(status)) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('hotel', 'name city country')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

/**
 * @GET /api/admin/bookings/:id
 * Fetch a single booking's full detail for the admin view.
 */
exports.getAdminBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid booking ID'));
  }
  const booking = await Booking.findById(id)
    .populate('user', 'name email')
    .populate('hotel');
  if (!booking) {
    return next(new AppError(404, 'Booking not found'));
  }
  res.status(200).json({ success: true, booking });
});

/**
 * @PUT /api/admin/bookings/:id/status
 * Change a booking's status. Body: { status: 'pending'|'confirmed'|'cancelled'|'completed' }
 */
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid booking ID'));
  }
  const allowed = Booking.schema.path('status').enumValues;
  if (!allowed.includes(status)) {
    return next(new AppError(400, `Status must be one of: ${allowed.join(', ')}`));
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('user', 'name email')
    .populate('hotel', 'name city country');

  if (!booking) {
    return next(new AppError(404, 'Booking not found'));
  }

  res.status(200).json({ success: true, booking });
});