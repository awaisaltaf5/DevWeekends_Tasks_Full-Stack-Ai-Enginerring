const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/error');

// Escape regex metacharacters from user input to avoid regex injection.
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @GET /api/hotels
 * Public list with pagination, search, city, price/rating range and sorting.
 * Query params: page, limit, search, city, minPrice, maxPrice, rating, sort.
 */
exports.getHotels = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 9,
    search,
    city,
    minPrice,
    maxPrice,
    rating,
    sort = 'featured',
    featured,
    amenities,
  } = req.query;

  const filter = { isActive: true };

  // Free-text search across name / description / city.
  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { city: rx }];
  }

  if (city && String(city).trim()) {
    filter.city = String(city).toLowerCase().trim();
  }

  const priceFilter = {};
  if (minPrice !== undefined && minPrice !== '') priceFilter.$gte = Number(minPrice);
  if (maxPrice !== undefined && maxPrice !== '') priceFilter.$lte = Number(maxPrice);
  if (Object.keys(priceFilter).length) filter.pricePerNight = priceFilter;

  if (rating !== undefined && rating !== '') filter.rating = { $gte: Number(rating) };

  if (featured !== undefined && featured !== '') {
    filter.featured = featured === 'true' || featured === true;
  }

  if (amenities && String(amenities).trim()) {
    const list = String(amenities)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length) filter.amenities = { $all: list };
  }

  const sortMap = {
    priceAsc: { pricePerNight: 1 },
    priceDesc: { pricePerNight: -1 },
    rating: { rating: -1, reviewCount: -1 },
    popular: { reviewCount: -1, rating: -1 },
    newest: { createdAt: -1 },
    featured: { featured: -1, rating: -1 },
  };
  const sortQuery = sortMap[sort] || sortMap.featured;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));

  const total = await Hotel.countDocuments(filter);
  const hotels = await Hotel.find(filter)
    .sort(sortQuery)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: hotels.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    hotels,
  });
});

/**
 * @GET /api/hotels/:id
 * Public single-hotel detail (active hotels only).
 */
exports.getHotelById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }

  const hotel = await Hotel.findOne({ _id: id, isActive: true });
  if (!hotel) {
    return next(new AppError(404, 'Hotel not found'));
  }

  res.status(200).json({ success: true, hotel });
});

/**
 * @POST /api/hotels  (admin only)
 */
exports.createHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({ success: true, hotel });
});

/**
 * @PUT /api/hotels/:id  (admin only)
 */
exports.updateHotel = asyncHandler(async (req, res, next) => {
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
 * @DELETE /api/hotels/:id  (admin only)
 */
exports.deleteHotel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError(400, 'Invalid hotel ID'));
  }

  const hotel = await Hotel.findByIdAndDelete(id);
  if (!hotel) {
    return next(new AppError(404, 'Hotel not found'));
  }

  res.status(200).json({ success: true, message: 'Hotel deleted', id });
});
