const mongoose = require('mongoose');

/**
 * Booking model for the StayNest hotel booking system.
 *
 * A booking always belongs to a User and a Hotel and records the chosen
 * room type, stay dates, guest/room counts and the price that was charged.
 *
 * `totalPrice` is NEVER trusted from the client — controllers recalc-
 * ulate it from the hotel's current `pricePerNight` at creation time.
 *
 * Status lifecycle:
 *   pending -> confirmed -> completed
 *                   |
 *                   v
 *            cancelled  (terminal)
 *
 * Only the authenticated user who owns the booking can read / cancel it.
 */
const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    roomType: { type: String, required: [true, 'Room type is required'], trim: true },
    checkIn: { type: Date, required: [true, 'Check-in date is required'] },
    checkOut: { type: Date, required: [true, 'Check-out date is required'] },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Guests must be at least 1'],
    },
    numberOfRooms: {
      type: Number,
      required: [true, 'Number of rooms is required'],
      min: [1, 'Number of rooms must be at least 1'],
    },
    pricePerNight: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// Most common read: "give me a user's bookings" — newest first.
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ user: 1, status: 1 });

// Keep the external contract consistent with the Hotel/User models: expose a
// stable `id` and strip internal Mongoose fields.
BookingSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

BookingSchema.statics.STATUS = BOOKING_STATUSES;

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);