const express = require('express');
const {
  searchLocation,
  getLocationSuggestions,
} = require('../controllers/locationController');

const router = express.Router();

/**
 * @GET /api/location/search?q=<location>
 * Public location search (OpenStreetMap Nominatim proxy).
 *
 * @GET /api/location/suggestions?q=<query>&limit=5
 * Fast live location autocomplete suggestions.
 */
router.get('/search', searchLocation);
router.get('/suggestions', getLocationSuggestions);

module.exports = router;
