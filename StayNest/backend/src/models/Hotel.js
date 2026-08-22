const mongoose = require('mongoose');

/**
 * Hotel model for the StayNest discovery/search feature.
 *
 * `city` is stored lowercased so case-insensitive filtering is trivial.
 * `rating` is 0..5 and `reviewCount` is used for the "popular" sort.
 * Only `isActive: true` hotels are exposed publicly.
 */
const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Hotel name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true, lowercase: true, index: true },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    images: { type: [String], default: [] },
    thumbnail: { type: String },
    pricePerNight: { type: Number, required: [true, 'Price per night is required'], min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    amenities: { type: [String], default: [] },
    roomTypes: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes matching the common query patterns.
HotelSchema.index({ city: 1, pricePerNight: 1 });
HotelSchema.index({ pricePerNight: 1 });
HotelSchema.index({ rating: -1, reviewCount: -1 });

HotelSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);
