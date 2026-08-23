const mongoose = require('mongoose');

/**
 * Review model — a guest rates a hotel with 1-5 stars and an optional comment.
 *
 * A compound unique index enforces one review per (user, hotel), preventing a
 * single guest from spamming a hotel with multiple reviews. Guests edit or
 * delete their own review through the dedicated review endpoints instead.
 */
const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// One review per guest per hotel (duplicate-prevention at the DB level).
ReviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

// Most common read: a hotel's reviews, newest first.
ReviewSchema.index({ hotel: 1, createdAt: -1 });

ReviewSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);