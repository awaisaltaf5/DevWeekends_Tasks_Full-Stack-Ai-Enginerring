import { Router } from 'express';
import {
  getAdminStatistics,
  getAdminDoctors,
  getAdminDoctorById,
  updateDoctorVerification,
  removeDoctor,
} from '../controllers/adminPortalController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// All admin portal routes require a valid, admin-role bearer token. The
// `protect` guard also accepts the admin_system token from the admin login;
// `authorize('admin')` then rejects any non-admin (patient/doctor) accounts.

// Get dashboard statistics
router.get('/statistics', protect, authorize('admin'), getAdminStatistics);

// Get all doctors with filters
router.get('/doctors', protect, authorize('admin'), getAdminDoctors);

// Get single doctor profile
router.get('/doctors/:id', protect, authorize('admin'), getAdminDoctorById);

// Update doctor verification status
router.put('/doctors/:id/verify', protect, authorize('admin'), updateDoctorVerification);

// Remove a doctor (soft-delete + email notification)
router.delete('/doctors/:id/remove', protect, authorize('admin'), removeDoctor);

export default router;
