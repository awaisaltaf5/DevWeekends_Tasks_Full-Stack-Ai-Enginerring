import { Router } from 'express';
import { getDoctors, getDoctor } from '../controllers/doctorController';

const router = Router();

// GET /api/doctors?search=&specialty=&city=&lat=&lng=&radiusKm=&minFee=&maxFee=&minExperience=&maxExperience=&minRating=&sort=&page=&limit=
router.get('/', getDoctors);

// GET /api/doctors/:id (id or slug)
router.get('/:id', getDoctor);

export default router;
