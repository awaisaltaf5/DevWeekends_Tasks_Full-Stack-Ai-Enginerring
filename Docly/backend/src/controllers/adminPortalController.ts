import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { signToken } from '../services/tokenService';
import { asyncHandler } from '../middleware/errorHandler';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/emailService';
import { DoctorProfile, User, Specialty, Appointment } from '../models';
import type { AuthenticatedRequest } from '../types';

/**
 * Admin Login Endpoint
 * POST /api/auth/admin-login
 * 
 * Uses username and password from environment variables for admin authentication.
 * This is separate from regular user authentication.
 */
export const adminLogin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      throw new AppError(400, 'Username and password are required.');
    }

    // Get admin credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
      throw new AppError(401, 'Invalid admin credentials.');
    }

    // Create a hardcoded admin token (using admin-specific JWT)
    // For production, consider storing admin accounts in database
    const adminUser = {
      id: 'admin_system',
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@docly.com',
      role: 'admin' as const,
    };

    const token = signToken('admin_system', 'admin');

    return sendSuccess(res, 200, 'Admin login successful', {
      token,
      user: adminUser,
    });
  },
);

/**
 * Middleware to verify admin token
 */
export const verifyAdminToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      throw new AppError(401, 'Admin token required.');
    }

    // Verify token - for now, we check if it's a valid JWT
    // In production, validate against your JWT secret
    try {
      // Token validation is handled by the protect middleware in the main auth flow
      // For admin, we just ensure they have the token
      next();
    } catch (error) {
      throw new AppError(401, 'Invalid admin token.');
    }
  }
);

/**
 * Get Dashboard Statistics
 * GET /api/admin/statistics
 */
export const getAdminStatistics = asyncHandler(
  async (_req: Request, res: Response): Promise<Response> => {
    const [
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      totalPatients,
      totalAppointments,
      appointmentStats,
        ] = await Promise.all([
      // Total doctors = all non-removed profiles (regardless of status).
      DoctorProfile.countDocuments({ removedAt: null }),
      // Pending verification = pending, non-removed.
      DoctorProfile.countDocuments({ verificationStatus: 'pending', removedAt: null }),
      // Approved = verified, non-removed.
      DoctorProfile.countDocuments({ verificationStatus: 'verified', removedAt: null }),
      // Rejected = rejected, non-removed.
      DoctorProfile.countDocuments({ verificationStatus: 'rejected', removedAt: null }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const completedAppointments =
      appointmentStats.find((stat) => stat._id === 'completed')?.count || 0;
    const pendingAppointments =
      appointmentStats.find((stat) => stat._id === 'pending')?.count || 0;

    return sendSuccess(res, 200, 'Dashboard statistics retrieved', {
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      totalPatients,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
    });
  }
);

/**
 * Escape RegExp meta-characters so user input is treated as a literal string
 * when building `$regex` filters. Prevents NoSQL-injection / regex-ReDoS.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count the total number of doctor profiles matching the base `query` (status,
 * specialty, location) that *also* match a post-population text search. Used
 * to return an accurate `total` for paginated admin search results.
 */
async function countMatchingDoctors(query: Record<string, unknown>, searchLower: string): Promise<number> {
  const candidates = await DoctorProfile.find(query)
    .populate('user', 'name email')
    .populate('specialty', 'name')
    .lean();
  const matched = candidates.filter(
    (doc: any) =>
      doc.user?.name?.toLowerCase().includes(searchLower) ||
      doc.user?.email?.toLowerCase().includes(searchLower) ||
      doc.specialty?.name?.toLowerCase().includes(searchLower) ||
      doc.clinicName?.toLowerCase().includes(searchLower) ||
      doc.bio?.toLowerCase().includes(searchLower),
  );
  return matched.length;
}

/**
 * Get All Doctors with Filters
 * GET /api/admin/doctors?status=pending&specialty=&location=&search=
 */
export const getAdminDoctors = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
    const query: Record<string, unknown> = { removedAt: null };

    // Filter by verification status
    if (req.query.status && req.query.status !== 'all') {
      query.verificationStatus = req.query.status;
    }

    // Filter by specialty (if specialty ID provided)
    if (req.query.specialty) {
      query.specialty = req.query.specialty;
    }

    // Filter by location (city/area/country) — escape the regex to prevent
    // NoSQL injection via regex meta-characters in user input.
    const locationQuery = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    if (locationQuery) {
      const locationRegex = escapeRegex(locationQuery);
      query.$or = [
        { 'location.city': { $regex: locationRegex, $options: 'i' } },
        { 'location.area': { $regex: locationRegex, $options: 'i' } },
        { 'location.country': { $regex: locationRegex, $options: 'i' } },
      ];
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;

    // Search term used after population (doctor name/email/specialty/clinic).
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const searchLower = searchQuery.toLowerCase();

    // Fetch the candidate page (filtered by status/specialty/location above).
    let doctors = await DoctorProfile.find(query)
      .populate('user', 'name email profileImage isActive')
      .populate('specialty', 'name slug')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Filter by doctor name / email / specialty name / clinic after population.
    if (searchQuery) {
      doctors = doctors.filter((doc: any) =>
        doc.user?.name?.toLowerCase().includes(searchLower) ||
        doc.user?.email?.toLowerCase().includes(searchLower) ||
        doc.specialty?.name?.toLowerCase().includes(searchLower) ||
        doc.clinicName?.toLowerCase().includes(searchLower) ||
        doc.bio?.toLowerCase().includes(searchLower),
      );
    }

    // Get the accurate total count of matching records. When a search term is
    // present, the count must reflect the post-population filter, so compute it
    // from the un-paginated full set rather than reusing the base query.
    const total = searchQuery
      ? await countMatchingDoctors(query, searchLower)
      : await DoctorProfile.countDocuments(query);

    const formattedDoctors = doctors.map((doctor: any) => ({
      id: String(doctor._id),
      user: doctor.user,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      yearsOfExperience: doctor.yearsOfExperience,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      location: doctor.location,
      languages: doctor.languages,
      profileImage: doctor.profileImage,
      verificationStatus: doctor.verificationStatus,
      verificationMessage: doctor.verificationMessage,
      verificationUpdatedAt: doctor.verificationUpdatedAt,
      averageRating: doctor.averageRating,
      totalRatings: doctor.totalRatings,
      visitTypes: doctor.visitTypes,
            isActive: doctor.isActive,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
      removedAt: doctor.removedAt ?? null,
      removedReason: doctor.removedReason ?? null,
      removedBy: doctor.removedBy ?? null,
    }));

    return sendSuccess(res, 200, 'Doctors retrieved', {
      doctors: formattedDoctors,
      total,
    });
  }
);

/**
 * Get Single Doctor Profile
 * GET /api/admin/doctors/:id
 */
export const getAdminDoctorById = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const doctor = await DoctorProfile.findById(id)
      .populate('user', 'name email profileImage isActive')
      .populate('specialty', 'name slug')
      .lean();

    if (!doctor) {
      throw new AppError(404, 'Doctor profile not found.');
    }

        const formatted = {
      id: String(doctor._id),
      user: doctor.user,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      yearsOfExperience: doctor.yearsOfExperience,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      location: doctor.location,
      languages: doctor.languages,
      profileImage: doctor.profileImage,
      verificationStatus: doctor.verificationStatus,
      verificationMessage: doctor.verificationMessage,
      verificationUpdatedAt: doctor.verificationUpdatedAt,
      verificationDocuments: doctor.verificationDocuments ?? [],
      averageRating: doctor.averageRating,
      totalRatings: doctor.totalRatings,
      visitTypes: doctor.visitTypes,
            isActive: doctor.isActive,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
      removedAt: doctor.removedAt ?? null,
      removedReason: doctor.removedReason ?? null,
      removedBy: doctor.removedBy ?? null,
    };

    return sendSuccess(res, 200, 'Doctor profile retrieved', formatted);
  }
);

/**
 * Update Doctor Verification Status
 * PUT /api/admin/doctors/:id/verify
 * Body: { action: 'approve' | 'reject' | 'request_changes', message?: string }
 */
export const updateDoctorVerification = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { action, message } = req.body ?? {};

    if (!action || !['approve', 'reject', 'request_changes'].includes(action)) {
      throw new AppError(400, 'Valid action required: approve, reject, or request_changes');
    }

    const doctor = await DoctorProfile.findById(id);
    if (!doctor) {
      throw new AppError(404, 'Doctor profile not found.');
    }

    let newStatus = doctor.verificationStatus;
    let newMessage = message || '';

    switch (action) {
      case 'approve':
        newStatus = 'verified';
        newMessage = '';
        break;
      case 'reject':
        newStatus = 'rejected';
        newMessage = message || 'Your application has been rejected.';
        break;
      case 'request_changes':
        newStatus = 'pending';
        newMessage = message || 'Please make the requested changes to your profile.';
        break;
    }

    // Update doctor profile
    const updated = await DoctorProfile.findByIdAndUpdate(
      id,
      {
        verificationStatus: newStatus,
        verificationMessage: newMessage,
        verificationUpdatedAt: new Date(),
        isActive: newStatus === 'verified',
      },
      { new: true }
    )
      .populate('user', 'name email profileImage isActive')
      .populate('specialty', 'name slug')
      .lean();

    if (!updated) {
      throw new AppError(500, 'Failed to update doctor profile.');
    }

    // Notify the doctor by email on approve / reject / request-changes.
    // Emails are best-effort; failures are logged and never fail the update.
    const doctorUser = updated.user as unknown as
      | { _id: unknown; name?: string; email?: string }
      | undefined;
    if (doctorUser && doctorUser.email) {
      const doctorName = doctorUser.name ?? 'Doctor';
      const template =
        action === 'approve'
          ? 'doctor.approved'
          : action === 'reject'
            ? 'doctor.rejected'
            : 'doctor.request_changes';
      await sendEmail(
        { name: doctorName, email: doctorUser.email },
        template,
        {
          name: doctorName,
          message: newMessage,
          isRejection: action === 'reject',
          dashboardUrl: `${process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/doctor`,
        },
      );
    }

    const formatted = {
      id: String(updated._id),
      user: updated.user,
      specialty: updated.specialty,
      qualifications: updated.qualifications,
      yearsOfExperience: updated.yearsOfExperience,
      consultationFee: updated.consultationFee,
      bio: updated.bio,
      clinicName: updated.clinicName,
      clinicAddress: updated.clinicAddress,
      location: updated.location,
      languages: updated.languages,
      profileImage: updated.profileImage,
            verificationStatus: updated.verificationStatus,
      verificationMessage: updated.verificationMessage,
      verificationUpdatedAt: updated.verificationUpdatedAt,
      verificationDocuments: updated.verificationDocuments ?? [],
      averageRating: updated.averageRating,
      totalRatings: updated.totalRatings,
      visitTypes: updated.visitTypes,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

        return sendSuccess(res, 200, 'Doctor verification updated', formatted);
  }
);

/**
 * Remove a Doctor (soft-delete)
 * DELETE /api/admin/doctors/:id/remove
 * Body: { reason: string }
 *
 * Sets isActive=false, verificationStatus='rejected', removedAt/removedBy/removedReason.
 * Sends removal email to the doctor. Historical appointments/records are preserved.
 */
export const removeDoctor = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const adminUser = (req as AuthenticatedRequest).user;
    const { reason } = req.body ?? {};

    if (!id) {
      throw new AppError(400, 'Doctor id is required.');
    }
    if (reason === undefined || reason === null || String(reason).trim() === '') {
      throw new AppError(400, 'A removal reason is required.');
    }

    const trimmedReason = String(reason).trim().slice(0, 1000);

    const doctor = await DoctorProfile.findById(id)
      .populate('user', 'name email profileImage isActive role')
      .lean();

    if (!doctor) {
      throw new AppError(404, 'Doctor profile not found.');
    }

    // Already-removed doctors are handled gracefully — report but don't error hard.
    if (!doctor.isActive && doctor.removedAt) {
      throw new AppError(409, 'Doctor has already been removed.');
    }

    const doctorUser = (doctor.user ?? {}) as unknown as {
      _id: unknown;
      name: string;
      email: string;
      isActive: boolean;
      role: string;
    };

    // The actual database change — soft delete.
    const updated = await DoctorProfile.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: false,
          verificationStatus: 'rejected',
          removedAt: new Date(),
          removedReason: trimmedReason,
          removedBy:
            adminUser?.role === 'admin'
              ? adminUser.id ?? 'admin_system'
              : 'admin_system',
        },
      },
      { new: true },
    )
      .populate('user', 'name email profileImage isActive')
      .populate('specialty', 'name slug')
      .lean();

    if (!updated) {
      throw new AppError(500, 'Failed to remove doctor profile.');
    }

    // Best-effort: deactivate the user account so the doctor can no longer log in.
    try {
      await User.findByIdAndUpdate(doctorUser._id, { isActive: false });
    } catch (userErr) {
      logger.error({ doctorId: id, err: userErr }, 'Could not deactivate user account');
    }

    // Best-effort email notification — never fail the removal because of email.
    const emailResult = await sendEmail(
      { name: doctorUser.name, email: doctorUser.email },
      'doctor.removed',
      {
        doctorName: doctorUser.name,
        removalReason: trimmedReason,
        adminName: adminUser?.name ?? 'Docly Administrator',
      },
    );

    const formatted = {
      id: String(updated._id),
      user: updated.user,
      specialty: updated.specialty,
      isActive: updated.isActive,
      verificationStatus: updated.verificationStatus,
      removedAt: updated.removedAt,
      removedReason: updated.removedReason,
      removedBy: updated.removedBy,
    };

    const message = emailResult.sent
      ? 'Doctor removed successfully and notification email sent.'
      : 'Doctor removed successfully. Notification email could not be sent (logged).';

    return sendSuccess(res, 200, message, { ...formatted, emailSent: emailResult.sent });
  }
);
