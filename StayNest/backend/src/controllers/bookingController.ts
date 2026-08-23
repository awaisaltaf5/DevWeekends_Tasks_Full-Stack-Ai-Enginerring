const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/error');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parse a value into a real Date, or return null if it is not a valid date.
 */
const parseDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * @POST /api/bookings
 * Create a booking for the authenticated user (`req.user`).
 *
 * IMPORTANT: the total price is ALWAYS recalculated server-side from the hotel's
 * current `pricePerNight`. Any `totalPrice` sent by the client is ignored — we
 * never trust the client on pricing.
 *
 * Validation:
 *  - hotel must exist and be active
 *  - room type must be one of the hotel's room types
 *  - check-in must be before check-out (real, parseable dates)
 *  - guests and numberOfRooms must be positive integers
 */
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { hotel, roomType, checkIn, checkOut, guests, numberOfRooms } = req.body;
  const userId = req.user._id;

  // --- Hotel lookup (must exist & be active) ---
  if (!hotel || !mongoose.isValidObjectId(hotel)) {
    return next(new AppError(400, 'A valid hotel is required'));
  }
  const hotelDoc = await Hotel.findOne({ _id: hotel, isActive: true });
  if (!hotelDoc) {
    return next(new AppError(404, 'Hotel not found or not available'));
  }

  // --- Dates ---
  const inDate = parseDate(checkIn);
  const outDate = parseDate(checkOut);
  if (!inDate || !outDate) {
    return next(new AppError(400, 'Invalid check-in or check-out date'));
  }
  if (inDate >= outDate) {
    return next(new AppError(400, 'Check-in must be before check-out'));
  }

  // --- Guests / rooms ---
  const guestCount = Number(guests);
  const roomCount = Number(numberOfRooms);
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return next(new AppError(400, 'Guests must be a positive number'));
  }
  if (!Number.isInteger(roomCount) || roomCount < 1) {
    return next(new AppError(400, 'Number of rooms must be a positive number'));
  }
  if (!roomType || !hotelDoc.roomTypes?.includes(roomType)) {
    return next(new AppError(400, 'Invalid room type'));
  }

  // --- Price (server-authoritative) ---
  const pricePerNight = hotelDoc.pricePerNight;
  const numberOfNights = Math.ceil((outDate - inDate) / MS_PER_DAY);
  const totalPrice = Math.round(pricePerNight * numberOfNights * roomCount);

  const booking = await Booking.create({
    user: userId,
    hotel: hotelDoc._id,
    roomType,
    checkIn: inDate,
    checkOut: outDate,
    guests: guestCount,
    numberOfRooms: roomCount,
    pricePerNight,
    totalPrice,
    status: 'pending',
  });

  // Populate the hotel so the response includes its details.
  await Booking.populate(booking, { path: 'hotel' });

  res.status(201).json({
    success: true,
    booking,
    numberOfNights,
    totalPrice,
  });
});

/**
 * @GET /api/bookings
 * List every booking that belongs to the authenticated user (newest first).
 */
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('hotel')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

/**
 * @GET /api/bookings/:id
 * Fetch a single booking. The query is scoped to the current user, so a
 * request for another user's booking simply returns 404.
 */
exports.getBooking = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError(400, 'Invalid booking ID'));
  }

  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id }).populate('hotel');
  if (!booking) {
    return next(new AppError(404, 'Booking not found'));
  }

  res.status(200).json({ success: true, booking });
});

/**
 * @PUT /api/bookings/:id/cancel
 * Cancel a booking. Only `pending` and `confirmed` bookings may be cancelled;
 * `cancelled` and `completed` are terminal states.
 */
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError(400, 'Invalid booking ID'));
  }

  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) {
    return next(new AppError(404, 'Booking not found'));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError(400, 'Booking is already cancelled'));
  }
  if (booking.status === 'completed') {
    return next(new AppError(400, 'Completed bookings cannot be cancelled'));
  }

  booking.status = 'cancelled';
  await booking.save();

  // Populate hotel so the response mirrors the other endpoints.
  await Booking.populate(booking, { path: 'hotel' });

  res.status(200).json({ success: true, booking });
});
