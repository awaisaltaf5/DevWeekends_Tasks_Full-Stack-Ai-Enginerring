import { Router } from 'express';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { adminListRecords } from '../controllers/medicalRecordController';
import { adminListPrescriptions } from '../controllers/prescriptionController';
import { approveDoctor } from '../controllers/adminDoctorController';
import {
	adminDashboard,
	adminListUsers,
	adminUpdateUserStatus,
	adminListAppointments,
	adminUpdateAppointmentStatus,
	adminListSpecialties,
	adminCreateSpecialty,
	adminUpdateSpecialty,
	adminDeleteSpecialty,
} from '../controllers/adminController';

const router = Router();

/** All routes here require an authenticated admin. */
router.use(protect, authorize('admin'));

router.get('/dashboard', adminDashboard);
router.get('/users', adminListUsers);
router.patch('/users/:id/status', adminUpdateUserStatus);
router.get('/appointments', adminListAppointments);
router.patch('/appointments/:id/status', adminUpdateAppointmentStatus);
router.get('/specialties', adminListSpecialties);
router.post('/specialties', adminCreateSpecialty);
router.patch('/specialties/:id', adminUpdateSpecialty);
router.delete('/specialties/:id', adminDeleteSpecialty);

// GET /api/admin/doctors  -> handled by adminPortalRoutes (getAdminDoctors)
// with status/specialty/location/search filters + pagination.

// PATCH /api/admin/doctors/:id/verification  { status: 'verified' | 'rejected' }
router.patch('/doctors/:id/verification', approveDoctor);

// GET /api/admin/records?patientId=
router.get('/records', adminListRecords);

// GET /api/admin/prescriptions?patientId=&doctorId=
router.get('/prescriptions', adminListPrescriptions);

export default router;