import { Router } from 'express';
import { getSpecialties } from '../controllers/specialtyController';

const router = Router();

// GET /api/specialties
router.get('/', getSpecialties);

export default router;