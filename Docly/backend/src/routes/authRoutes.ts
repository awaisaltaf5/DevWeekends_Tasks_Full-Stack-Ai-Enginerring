import { Router } from 'express';
import { register, login, googleLogin, resetPassword, getMe, adminLogin } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleLogin);

// POST /api/auth/password-reset
router.post('/password-reset', resetPassword);

// POST /api/auth/admin-login - Admin Portal login
router.post('/admin-login', adminLogin);

// GET /api/auth/me - protected
router.get('/me', protect, getMe);

export default router;