import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validation';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  createAppointment,
  myAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  doctorAvailableSlots,
  cancelAppointment,
  updateAppointmentNotes,
} from '../controllers/appointmentController';

const router = Router();

router.post(
  '/',
  protect,
  body('doctorRef').isString().notEmpty(),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('startTime').matches(/^\d{2}:\d{2}$/),
  body('endTime').matches(/^\d{2}:\d{2}$/),
  body('type').optional().isIn(['in-person', 'video']),
  body('reason').optional().isString().isLength({ max: 500 }),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  validate,
  createAppointment,
);

router.get('/me', protect, myAppointments);

// Patients, assigned doctors, and admins are authorized inside the controller.
// Public: available slots for a doctor on a date.
router.get(
  '/doctor/:ref/slots',
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  validate,
  doctorAvailableSlots,
);

router.get('/:id', protect, getAppointmentById);

// A patient cancels their own booking (sensible rules enforced in the controller).
router.post('/:id/cancel', protect, param('id').isMongoId(), validate, cancelAppointment);

// A doctor updates the appointment status.
router.patch(
  '/:id/status',
  protect,
  authorize('doctor'),
  param('id').isMongoId(),
  body('status').isString().notEmpty(),
  validate,
  updateAppointmentStatus,
);

// A doctor adds/updates consultation notes.
router.patch(
  '/:id/notes',
  protect,
  authorize('doctor'),
  param('id').isMongoId(),
  body('notes').isString().isLength({ max: 2000 }),
  validate,
  updateAppointmentNotes,
);

export default router;
