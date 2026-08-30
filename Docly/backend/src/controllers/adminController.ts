import { type Request, type Response } from 'express';
import { Appointment, DoctorProfile, Specialty, User } from '../models';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

const STATUSES = ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'] as const;

function pageParams(req: Request) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function pageResult(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

/** GET /api/admin/dashboard */
export const adminDashboard = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {
  const [patientCount, doctorCount, pendingDoctors, appointmentCount, appointmentStats] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    DoctorProfile.countDocuments({ verificationStatus: 'pending' }),
    Appointment.countDocuments(),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const byStatus = Object.fromEntries(appointmentStats.map((item) => [item._id, item.count]));
  return sendSuccess(res, 200, 'Admin dashboard retrieved', {
    stats: {
      totalPatients: patientCount,
      totalDoctors: doctorCount,
      pendingDoctorApprovals: pendingDoctors,
      totalAppointments: appointmentCount,
      appointmentsByStatus: byStatus,
    },
  });
});

/** GET /api/admin/users */
export const adminListUsers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { page, limit, skip } = pageParams(req);
  const query: Record<string, unknown> = {};
  if (req.query.role === 'patient' || req.query.role === 'doctor') query.role = req.query.role;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const search = req.query.search.trim();
    query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  }
  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);
  return sendSuccess(res, 200, 'Users retrieved', {
    users: users.map((user) => ({ ...user, id: String(user._id) })),
    pagination: pageResult(page, limit, total),
  });
});

/** PATCH /api/admin/users/:id/status { isActive: boolean } */
export const adminUpdateUserStatus = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params as { id?: string };
  if (!id || typeof req.body?.isActive !== 'boolean') throw new AppError(400, 'isActive boolean is required.');
  const target = await User.findById(id).select('name email role isActive').lean();
  if (!target) throw new AppError(404, 'User not found.');
  if (target.role === 'admin') throw new AppError(400, 'Admin accounts cannot be deactivated here.');
  const updated = await User.findByIdAndUpdate(id, { isActive: req.body.isActive }, { new: true })
    .select('name email role isActive')
    .lean();
  return sendSuccess(res, 200, 'User status updated', { user: { ...updated, id: String(updated?._id) } });
});

/** GET /api/admin/appointments */
export const adminListAppointments = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { page, limit, skip } = pageParams(req);
  const query: Record<string, unknown> = {};
  if (typeof req.query.status === 'string' && STATUSES.includes(req.query.status as typeof STATUSES[number])) query.status = req.query.status;
  const [total, appointments] = await Promise.all([
    Appointment.countDocuments(query),
    Appointment.find(query)
      .sort({ date: -1, startTime: -1 }).skip(skip).limit(limit)
      .populate('patient', 'name email profileImage')
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'clinicName verificationStatus')
      .populate('specialty', 'name slug').lean(),
  ]);
  return sendSuccess(res, 200, 'Appointments retrieved', {
    appointments: appointments.map((item) => ({ ...item, id: String(item._id) })),
    pagination: pageResult(page, limit, total),
  });
});

/** PATCH /api/admin/appointments/:id/status { status } */
export const adminUpdateAppointmentStatus = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params as { id?: string };
  const status = req.body?.status as string;
  if (!id || !STATUSES.includes(status as typeof STATUSES[number])) throw new AppError(400, 'Valid appointment status is required.');
  const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
    .populate('patient', 'name email profileImage').populate('doctor', 'name email profileImage')
    .populate('doctorProfile', 'clinicName').populate('specialty', 'name slug').lean();
  if (!updated) throw new AppError(404, 'Appointment not found.');
  return sendSuccess(res, 200, 'Appointment status updated', { appointment: { ...updated, id: String(updated._id) } });
});

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** POST /api/admin/specialties */
export const adminListSpecialties = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {
  const specialties = await Specialty.find().sort({ name: 1 }).lean();
  return sendSuccess(res, 200, 'Specialties retrieved', {
    specialties: specialties.map((specialty) => ({ ...specialty, id: String(specialty._id) })),
  });
});

export const adminCreateSpecialty = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { name, description = '', icon = 'Stethoscope' } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) throw new AppError(400, 'Specialty name is required.');
  const specialty = await Specialty.create({ name: name.trim(), slug: slugify(name), description, icon, isActive: true });
  return sendSuccess(res, 201, 'Specialty created', { specialty });
});

/** PATCH /api/admin/specialties/:id */
export const adminUpdateSpecialty = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params as { id?: string };
  const update: Record<string, unknown> = {};
  if (typeof req.body?.name === 'string' && req.body.name.trim()) {
    update.name = req.body.name.trim(); update.slug = slugify(req.body.name);
  }
  if (typeof req.body?.description === 'string') update.description = req.body.description;
  if (typeof req.body?.icon === 'string') update.icon = req.body.icon;
  if (typeof req.body?.isActive === 'boolean') update.isActive = req.body.isActive;
  if (!id || Object.keys(update).length === 0) throw new AppError(400, 'At least one specialty field is required.');
  const specialty = await Specialty.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
  if (!specialty) throw new AppError(404, 'Specialty not found.');
  return sendSuccess(res, 200, 'Specialty updated', { specialty: { ...specialty, id: String(specialty._id) } });
});

/** DELETE /api/admin/specialties/:id: soft-delete to preserve references. */
export const adminDeleteSpecialty = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params as { id?: string };
  const specialty = await Specialty.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
  if (!specialty) throw new AppError(404, 'Specialty not found.');
  return sendSuccess(res, 200, 'Specialty deactivated', { specialty: { ...specialty, id: String(specialty._id) } });
});
