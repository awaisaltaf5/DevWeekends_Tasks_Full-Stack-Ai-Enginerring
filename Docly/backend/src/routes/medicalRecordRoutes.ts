import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../utils/validation';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import medicalUpload from '../middleware/medicalUpload';
import {
  deleteRecord,
  myRecords,
  uploadMyRecord,
} from '../controllers/medicalRecordController';

const router = Router();

// A patient uploads one of their own medical documents (report, image, PDF).
router.post(
  '/',
  protect,
  authorize('patient'),
  medicalUpload.single('file'),
  uploadMyRecord,
);

// A patient lists their own medical history.
router.get('/me', protect, authorize('patient'), myRecords);

// The record owner (patient), the uploading doctor, or an admin may delete it.
router.delete(
  '/:id',
  protect,
  param('id').isMongoId(),
  validate,
  deleteRecord,
);

export default router;