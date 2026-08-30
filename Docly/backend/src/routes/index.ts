import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import protectedRoutes from './protectedRoutes';
import doctorRoutes from './doctorRoutes';
import doctorDashboardRoutes from './doctorDashboardRoutes';
import specialtyRoutes from './specialtyRoutes';
import locationRoutes from './locationRoutes';
import appointmentRoutes from './appointmentRoutes';
import medicalRecordRoutes from './medicalRecordRoutes';
import prescriptionRoutes from './prescriptionRoutes';
import adminMedicalRoutes from './adminMedicalRoutes';
import adminPortalRoutes from './adminPortalRoutes';
import videoRoutes from './videoRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);
router.use('/doctors', doctorRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/location', locationRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/doctor', doctorDashboardRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/admin', adminMedicalRoutes);
router.use('/admin', adminPortalRoutes);
router.use('/video', videoRoutes);
router.use('/notifications', notificationRoutes);

export default router;