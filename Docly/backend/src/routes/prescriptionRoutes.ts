import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../utils/validation';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  myPrescriptions,
  patientPrescriptionDetail,
} from '../controllers/prescriptionController';

const router = Router();

// Patients list their own prescriptions.
router.get('/me', protect, authorize('patient'), myPrescriptions);

// Patient owner, prescribing doctor, or admin may view a prescription.
router.get(
  '/:id',
  protect,
  param('id').isMongoId(),
  validate,
  patientPrescriptionDetail,
);

export default router;