import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { DoctorProfile, User } from '../models';
import { sendEmail } from '../services/emailService';
import { createNotification } from '../services/notificationService';
import { logger } from '../utils/logger';

/**
 * PATCH /api/admin/doctors/:id/verification
 *
 * An admin approves (or rejects) a doctor profile. When the doctor is
 * approved, both an in-app notification and a "welcome/approved" email are
 * sent. Email failures are logged, never thrown.
 */
export const approveDoctor = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params as { id?: string };
    const { status } = req.body ?? {};
    if (!id) throw new AppError(400, 'Doctor id is required.');
    if (status !== 'verified' && status !== 'rejected') {
      throw new AppError(400, 'status must be "verified" or "rejected".');
    }

    const profile = await DoctorProfile.findById(id).lean();
    if (!profile) throw new AppError(404, 'Doctor profile not found.');

    const doctorUser = await User.findById(profile.user).select('name email').lean();
    if (!doctorUser) throw new AppError(404, 'Doctor user not found.');

    await DoctorProfile.updateOne(
      { _id: id },
      { $set: { verificationStatus: status, isActive: status === 'verified' } },
    );

    if (status === 'verified') {
      void createNotification({
        recipientId: String(profile.user),
        recipientRole: 'doctor',
        type: 'doctor.approved',
        title: 'Account approved',
        message: 'Your doctor account has been approved. You can now accept appointments.',
        link: '/doctor',
      });
      void sendEmail(
        { name: doctorUser.name, email: doctorUser.email },
        'doctor.approved',
        { name: doctorUser.name },
      ).then((result) => {
        if (!result.sent) {
          logger.warn({ email: doctorUser.email }, 'Doctor approval email not sent');
        }
      });
    }

    return sendSuccess(res, 200, 'Doctor status updated', {
      doctor: { id, verificationStatus: status, isActive: status === 'verified' },
    });
  },
);

/** GET /api/admin/doctors?status= — list doctors for the admin to review. */
export const adminListDoctors = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const query: Record<string, unknown> = {};
    if (status) query.verificationStatus = status;

    const profiles = await DoctorProfile.find(query)
      .populate('user', 'name email profileImage')
      .populate('specialty', 'name slug')
      .lean();

    return sendSuccess(res, 200, 'Doctors retrieved', {
      doctors: profiles.map((p) => ({ ...p, id: String(p._id) })),
      count: profiles.length,
    });
  },
);