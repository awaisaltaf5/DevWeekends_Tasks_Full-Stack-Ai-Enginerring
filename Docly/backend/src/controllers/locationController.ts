import { type Request, type Response } from 'express';
import { searchPlaces } from '../services/geocodeService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/location/search?q=<place>
 *
 * Server-side proxy to OpenStreetMap/Nominatim so the public geocoding
 * endpoint is never called directly from the browser. Results are cached in
 * MongoDB and upstream calls are rate-limited to respect fair-use.
 */
export const searchLocations = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return sendError(res, 400, 'Provide a location query (q).');
    }
    const places = await searchPlaces(q);
    return sendSuccess(res, 200, 'Locations found', { places });
  },
);