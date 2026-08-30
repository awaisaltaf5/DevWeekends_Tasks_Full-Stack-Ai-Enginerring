import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validation';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import upload from '../middleware/upload';
import medicalUpload from '../middleware/medicalUpload';
import {
  getMyProfile,
  updateMyProfile,
  dashboardStats,
  appointments,
  patients,
  doctorSlots,
  setMyAvailability,
  uploadProfileImage,
  uploadVerificationDocument,
} from '../controllers/doctorDashboardController';
import {
  doctorViewPatientRecords,
  doctorUploadRecord,
} from '../controllers/medicalRecordController';
import {
  createPrescription,
  doctorPrescriptions,
  doctorPrescriptionDetail,
} from '../controllers/prescriptionController';

const router = Router();

/** All routes in this file are restricted to authenticated doctors. */
router.use(protect, authorize('doctor'));

/** Dashboard overview & related read endpoints */
router.get('/dashboard', dashboardStats);
router.get(
  '/appointments',
  query('from').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('to').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  validate,
  appointments,
);
router.get('/patients', patients);

/** Profile management */
router.get('/me', getMyProfile);
router.put('/profile', updateMyProfile);
router.post('/profile/image', upload.single('image'), uploadProfileImage);
router.post('/verification-documents', medicalUpload.single('document'), uploadVerificationDocument);


/** Availability management */
router.get(
  '/availability/slots',
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  validate,
  doctorSlots,
);
router.put(
  '/availability',
  body('availability').isArray({ min: 1 }),
  body('availability.*.day').isInt({ min: 0, max: 6 }),
  body('availability.*.startTime').matches(/^\d{2}:\d{2}$/),
  body('availability.*.endTime').matches(/^\d{2}:\d{2}$/),
  body('availability.*.slotDuration').isInt({ min: 15 }),
  body('blockedDates').optional().isArray(),
  validate,
  setMyAvailability,
);

/** Medical records for a doctor's own patients (relationship-gated). */
router.get(
  '/patients/:patientId/records',
  param('patientId').isMongoId(),
  validate,
  doctorViewPatientRecords,
);
router.post(
  '/patients/:patientId/records',
  param('patientId').isMongoId(),
  medicalUpload.single('file'),
  doctorUploadRecord,
);

/** Prescriptions authored by the doctor. */
router.get(
  '/prescriptions',
  query('patientId').optional().isMongoId(),
  validate,
  doctorPrescriptions,
);
router.post(
  '/prescriptions',
  body('patientId').isMongoId(),
  body('appointmentId').optional().isMongoId(),
  body('diagnosis').optional().isString().isLength({ max: 2000 }),
  body('notes').optional().isString().isLength({ max: 3000 }),
  body('medicines').optional().isArray(),
  validate,
  createPrescription,
);
router.get(
  '/prescriptions/:id',
  param('id').isMongoId(),
  validate,
  doctorPrescriptionDetail,
);

export default router;