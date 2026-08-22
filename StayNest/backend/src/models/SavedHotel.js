const mongoose = require('mongoose');

/**
 * SavedHotel model — a user bookmarks a hotel.
 *
 * A compound unique index enforces "one SavedHotel row per (user, hotel)" so
 * duplicate saves are impossible at the database level. The controller also
 * guards against duplicates explicitly to return a clean response.
 *
 * `toJSON` exposes a stable `id` and maps the populated hotel through the
 * Hotel model's own transform.
 */
const SavedHotelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate saved hotels (unique per user + hotel).
SavedHotelSchema.index({ user: 1, hotel: 1 }, { unique: true });

// Most common read: a user's saved hotels, newest first.
SavedHotelSchema.index({ user: 1, createdAt: -1 });

SavedHotelSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports =
  mongoose.models.SavedHotel || mongoose.model('SavedHotel', SavedHotelSchema);
