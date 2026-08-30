import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  myNotifications,
  markNotificationsRead,
} from '../controllers/notificationController';

const router = Router();

// Authenticated users fetch their in-app notifications.
router.get('/', protect, myNotifications);

// Mark one (body.id) or all (body.all) notifications as read.
router.patch('/read', protect, markNotificationsRead);

export default router;