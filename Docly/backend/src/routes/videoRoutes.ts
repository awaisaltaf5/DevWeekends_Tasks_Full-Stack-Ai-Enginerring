import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../utils/validation';
import { protect } from '../middleware/auth';
import { getVideoMeeting } from '../controllers/videoController';

const router = Router();

// GET /api/video/:appointmentId — meeting config for the patient/doctor only.
router.get(
  '/:appointmentId',
  protect,
  param('appointmentId').isMongoId(),
  validate,
  getVideoMeeting,
);

export default router;