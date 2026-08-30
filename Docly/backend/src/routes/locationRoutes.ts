import { Router } from 'express';
import { searchLocations } from '../controllers/locationController';

const router = Router();

// GET /api/location/search?q=<place>
router.get('/search', searchLocations);

export default router;