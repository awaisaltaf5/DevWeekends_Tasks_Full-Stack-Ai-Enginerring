const AppError = require('../utils/AppError');
const { geocode, geocodeSuggestions } = require('../utils/geocode');
const { asyncHandler } = require('../middleware/error');

/**
 * @GET /api/location/search?q=...
 * Resolves a free-text location query (e.g. "Islamabad") via OpenStreetMap
 * Nominatim and returns the resolved city / lat / lon so the frontend can
 * filter the hotel inventory by city.
 */
exports.searchLocation = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return next(new AppError(400, 'Missing location query'));
  }

  let result;
  try {
    result = await geocode(String(q).trim());
  } catch (err) {
    return res.status(200).json({
      success: true,
      found: false,
      message: 'Location service unavailable',
      suggestions: [],
    });
  }

  if (!result) {
    return res.status(200).json({
      success: true,
      found: false,
      message: 'Location not found',
      suggestions: [],
    });
  }

  res.status(200).json({
    success: true,
    found: true,
    ...result,
  });
});

/**
 * @GET /api/location/suggestions?q=...
 * Returns a fast list of autocomplete location suggestions.
 */
exports.getLocationSuggestions = asyncHandler(async (req, res, next) => {
  const { q, limit = 5 } = req.query;
  const limitNum = Math.min(10, Math.max(1, parseInt(limit, 10) || 5));

  try {
    const suggestions = await geocodeSuggestions(q, limitNum);
    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      count: 0,
      suggestions: [],
      message: 'Suggestions currently unavailable',
    });
  }
});
