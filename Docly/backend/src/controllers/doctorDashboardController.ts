import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import {
  ensureDoctorProfile,
  updateDoctorProfile,
  setAvailability,
  getDashboardStats,
  listAppointments,
  listPatients,
} from '../services/doctorDashboardService';
import { generateSlots } from '../services/availabilityService';
import { uploadImage, uploadMedicalFile, isCloudinaryConfigured } from '../services/cloudinaryService';
import { type AuthenticatedRequest } from '../types';
import { User, type VerificationDocument } from '../models';
import { DoctorProfile } from '../models/DoctorProfile';

/** Resolve the authenticated doctor's profile, auto-creating it if missing. */
async function resolveProfile(req: Request): Promise<import('../models').DoctorProfileDoc> {
  const user = (req as AuthenticatedRequest).user;
  const profile = await ensureDoctorProfile({ id: user.id, name: user.name, email: user.email });
  return profile as import('../models').DoctorProfileDoc;
}

function readDateRange(query: Request['query']): { from?: string; to?: string } {
  const from = typeof query.from === 'string' ? query.from : undefined;
  const to = typeof query.to === 'string' ? query.to : undefined;
  return { from, to };
}

/** GET /api/doctor/me — authenticated doctor's profile (populated). */
export const getMyProfile = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  return sendSuccess(res, 200, 'Profile retrieved', { profile });
});

/** PUT /api/doctor/profile — update editable doctor profile fields. */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      throw new AppError(400, 'Name must be at least 2 characters.');
    }
    if (body.name.trim().length > 80) {
      throw new AppError(400, 'Name cannot exceed 80 characters.');
    }
    const user = await User.findById((req as AuthenticatedRequest).user.id);
    if (!user) throw new AppError(404, 'User account not found.');
    user.name = body.name.trim();
    await user.save();
  }
  const { name: _name, ...profileUpdate } = body;
  await updateDoctorProfile(profile as any, profileUpdate);
  const saved = await refreshProfile(profile.id);
  return sendSuccess(res, 200, 'Profile updated', { profile: saved });
});

/** GET /api/doctor/dashboard — overview statistics. */
export const dashboardStats = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  const stats = await getDashboardStats(profile.id);
  return sendSuccess(res, 200, 'Dashboard statistics', { stats });
});

/** GET /api/doctor/appointments — paginated, filterable appointment list. */
export const appointments = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 10;
  const dateRange = readDateRange(req.query);
  if (dateRange.from && dateRange.to && dateRange.from > dateRange.to) {
    throw new AppError(400, 'The appointment start date must be before the end date.');
  }
  const item = await listAppointments(profile.id, {
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
    ...dateRange,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 10,
  });
  return sendSuccess(res, 200, 'Appointments retrieved', item);
});

/** GET /api/doctor/patients — unique patients of the doctor. */
export const patients = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  const patients = await listPatients(profile.id);
  return sendSuccess(res, 200, 'Patients retrieved', { patients, count: patients.length });
});

/** GET /api/doctor/slots?date=YYYY-MM-DD — preview bookable slots on a date. */
export const doctorSlots = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  const date = typeof req.query.date === 'string' ? req.query.date : '';
  const slots = await generateSlots(
    { availability: profile.availability, blockedDates: profile.blockedDates, _id: profile._id },
    date,
  );
  return sendSuccess(res, 200, 'Available slots', { slots });
});

/** PUT /api/doctor/availability — set weekly availability + blocked dates. */
export const setMyAvailability = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const profile = await resolveProfile(req);
  const { availability, blockedDates } = req.body ?? {};
    await setAvailability(
    profile as any,
    availability,
    blockedDates,
  );
  return sendSuccess(res, 200, 'Availability updated');
});

/** POST /api/doctor/profile/image — upload a profile image to Cloudinary. */
export const uploadProfileImage = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      503,
      'Upload service is not configured. Add CLOUDINARY_* vars to the environment.',
    );
  }
  const file = req.file;
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new AppError(400, 'No image file provided.');
  }
  const url = await uploadImage(file.buffer, file.originalname ?? 'profile.jpg');
  if (!url) {
    throw new AppError(502, 'Image upload failed. Please try again.');
  }
  const profile = await resolveProfile(req);
  profile.profileImage = url;
  await profile.save();
    return sendSuccess(res, 200, 'Profile image updated', { profileImage: url });
});

/** POST /api/doctor/verification-documents — upload a degree/licence document. */
export const uploadVerificationDocument = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      503,
      'Upload service is not configured. Add CLOUDINARY_* vars to the environment.',
    );
  }
  const file = req.file;
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new AppError(400, 'No file provided.');
  }
  const { label } = req.body ?? {};
  const docLabel = typeof label === 'string' && label.trim().length > 0 ? label.trim() : file.originalname ?? 'Document';

  const uploaded = await uploadMedicalFile(
    file.buffer,
    file.originalname ?? 'document',
    `docly-verification-${Date.now()}`,
  );
  if (!uploaded) {
    throw new AppError(502, 'Document upload failed. Please try again.');
  }

  const profile = await resolveProfile(req);
  const doc: VerificationDocument = {
    label: docLabel,
    url: uploaded.url,
    publicId: uploaded.publicId,
    uploadedAt: new Date(),
  };
  profile.verificationDocuments = profile.verificationDocuments ?? [];
  profile.verificationDocuments.push(doc);
  await profile.save();
  return sendSuccess(res, 200, 'Verification document uploaded', { document: doc });
});

async function refreshProfile(id: string) {
  const { DoctorProfile } = await import('../models');
  return DoctorProfile.findById(id)
    .populate('user', 'name email profileImage role')
    .populate('specialty', 'name slug icon description');
}