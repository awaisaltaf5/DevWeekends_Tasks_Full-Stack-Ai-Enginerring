import { Router } from 'express';
import { patientOnly, doctorOnly, adminOnly } from '../controllers/protectedController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes below require a valid token.
router.use(protect);

// Patient-only route
router.get('/patient', authorize('patient'), patientOnly);

// Doctor-only route
router.get('/doctor', authorize('doctor'), doctorOnly);

// Admin-only route
router.get('/admin', authorize('admin'), adminOnly);

export default router;