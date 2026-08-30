import { Router } from 'express';
import { health } from '../controllers/healthController';

const router = Router();

// GET /api/health
router.get('/', health);

export default router;