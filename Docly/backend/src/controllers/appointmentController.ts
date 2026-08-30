import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { Appointment, DoctorProfile, Specialty, User } from '../models';
import { assertBookable, timeToMinutes } from '../services/availabilityService';
import type { AppointmentStatus } from '../models';
import { buildMeetingRoom } from '../services/jitsiService';
import {
  notifyPatientAboutAppointment,
  notifyDoctorAboutAppointment,
} from '../services/notificationService';
import { env } from '../config/env';

interface BookingBody {
  doctorRef?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: 'in-person' | 'video';
  reason?: string;
  phone?: string;
  email?: string;
}

function readBookingBody(raw: unknown): BookingBody {
  const body: BookingBody = {};
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.doctorRef === 'string') body.doctorRef = obj.doctorRef;
    if (typeof obj.date === 'string') body.date = obj.date;
    if (typeof obj.startTime === 'string') body.startTime = obj.startTime;
    if (typeof obj.endTime === 'string') body.endTime = obj.endTime;
    if (typeof obj.type === 'string') body.type = obj.type as 'in-person' | 'video';
    if (typeof obj.reason === 'string') body.reason = obj.reason;
    if (typeof obj.phone === 'string') body.phone = obj.phone;
    if (typeof obj.email === 'string') body.email = obj.email;
  }
  return body;
}

/** Look up a doctor's profile by 24-hex id or by slug (never a CastError). */
async function findDoctor(doctorRef: string) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(doctorRef);
  if (isObjectId) {
    return DoctorProfile.findOne({
      $or: [{ _id: doctorRef }, { slug: doctorRef.toLowerCase() }],
    });
  }
  return DoctorProfile.findOne({ slug: doctorRef.toLowerCase() });
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.name === 'MongoServerError' &&
    (err as { code?: number }).code === 11000
  );
}

/**
 * POST /api/appointments
 *
 * Book a slot as the authenticated patient. The slot is validated against the
 * doctor's real availability (working hours, breaks, blocked dates, duration
 * and already-booked slots). Double-booking is prevented both with a
 * check-then-create step and an atomic unique index on the slot window, so two
 * concurrent patients can never both grab the same time.
 */
export const createAppointment = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; email: string; role?: string } };
    if (!user?.id) {
      throw new AppError(401, 'You must be logged in to book an appointment.');
    }
    if (user.role !== 'patient') {
      throw new AppError(403, 'Only patients can book appointments.');
    }

    const { doctorRef, date, startTime, endTime, type, reason, phone, email } = readBookingBody(
      req.body,
    );

    if (!doctorRef || !date || !startTime || !endTime) {
      throw new AppError(400, 'doctorRef, date, startTime and endTime are required.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError(400, 'date must be YYYY-MM-DD.');
    }

    const profile = await findDoctor(doctorRef);
    if (!profile || !profile.isActive) {
      throw new AppError(404, 'Doctor not found or not accepting appointments.');
    }

    // Validate the requested slot against the doctor's real availability.
    await assertBookable(
      {
        availability: profile.availability,
        blockedDates: profile.blockedDates,
        _id: profile._id,
        isActive: profile.isActive,
      },
      date,
      startTime,
      endTime,
    );

    const patient = await User.findById(user.id);
    if (!patient) {
      throw new AppError(401, 'Patient not found.');
    }

    const specialty = await Specialty.findById(profile.specialty);
    if (!specialty) {
      throw new AppError(400, 'Doctor has no specialty configured.');
    }

    const [y, m, d] = date.split('-').map(Number);
    const appointmentDate = new Date(y, m - 1, d);

    const payload = {
      patient: patient._id,
      doctorProfile: profile._id,
      doctor: profile.user,
      specialty: specialty._id,
      date: appointmentDate,
      startTime,
      endTime,
      type: type ?? 'in-person',
      status: 'confirmed' as const,
      reason: reason ?? '',
      notes: '',
      meetingUrl: '',
      meetingId: '',
      meetingToken: '',
      patientContact: {
        phone: phone ?? '',
        email: email ?? patient.email,
      },
      fee: type === 'video' ? profile.consultationFee * 0.9 : profile.consultationFee,
    };

    let appointment;
    try {
      appointment = await Appointment.create(payload);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        // Atomic unique-index guard: the slot was just taken by someone else.
        throw new AppError(409, 'That appointment slot was just booked. Please pick another time.');
      }
      throw err;
    }

        const apptId = String(appointment._id);

    // For video consultations, assign a unique Jitsi meeting room + token.
    const isVideo = type === 'video';
    let meetingUrl = '';
    let meetingId = '';
    if (isVideo) {
      meetingId = buildMeetingRoom(apptId);
      meetingUrl = `${env.clientUrl}/video/${apptId}`;
      await Appointment.updateOne(
        { _id: appointment._id },
        { $set: { meetingId, meetingUrl } },
      );
    }

    const leanDoc = await Appointment.findById(appointment._id)
      .populate('patient', 'name email profileImage')
      .populate('doctorProfile', 'clinicName consultationFee')
      .populate('specialty', 'name slug')
      .lean();
    if (!leanDoc) {
      throw new AppError(404, 'Appointment not found after booking.');
    }

    const populated = { ...leanDoc, id: String(leanDoc._id) };

    // Fire-and-forget email + in-app notification for the patient (and doctor).
    const aptype = type ?? 'in-person';
    const patientName = (leanDoc.patient as { name?: string } | null)?.name ?? patient.name;
    const doctor = await getDoctorContact(profile.user);
    void notifyPatientAboutAppointment({
      patientId: user.id,
      type: 'appointment.booking',
      title: 'Appointment booked',
      message: `Your ${aptype} appointment is confirmed.`,
      appointmentId: apptId,
      email: {
        to: { name: patientName, email: patient.email },
        template: 'appointment.booking',
        vars: {
          patientName,
          doctor: { name: doctor.name },
          date: toDateString(appointmentDate),
          time: `${startTime}–${endTime}`,
          type: aptype,
          fee: populated.fee,
          meetingUrl,
          appUrl: env.clientUrl,
        },
      },
    });
    void notifyDoctorAboutAppointment({
      doctorId: String(profile.user),
      type: 'appointment.booking',
      title: 'New appointment',
      message: `${patientName} booked a ${aptype} appointment.`,
      appointmentId: apptId,
      ...(doctor.email
        ? {
            email: {
              to: { name: doctor.name, email: doctor.email },
              template: 'appointment.booking.doctor',
              vars: {
                doctorName: doctor.name,
                patientName,
                date: toDateString(appointmentDate),
                time: `${startTime}–${endTime}`,
                type: aptype,
                fee: populated.fee,
                reason: reason ?? '',
                clinicName: (leanDoc.doctorProfile as { clinicName?: string } | null)?.clinicName ?? '',
                meetingUrl,
                appUrl: env.clientUrl,
              },
            },
          }
        : {}),
    });

    return sendSuccess(res, 201, 'Appointment booked', { appointment: {
      ...populated,
      meetingUrl,
      meetingId,
    } });
  },
);

async function getDoctorContact(doctorUserId: unknown): Promise<{ name: string; email: string }> {
  try {
    const d = await User.findById(doctorUserId).select('name email').lean();
    return { name: d?.name ?? 'Doctor', email: d?.email ?? '' };
  } catch {
    return { name: 'Doctor', email: '' };
  }
}

/** Extract a doctor display name from a (possibly lean) appointment doc. */
function doctorNameForAppointment(appt: {
  doctorProfile?: { user?: { name?: string } } | null;
  doctor?: { name?: string } | null;
}): string {
  const fromProfile = appt.doctorProfile?.user?.name;
  const fromDoctor = appt.doctor?.name;
  return fromProfile ?? fromDoctor ?? 'Doctor';
}

/** GET /api/appointments/me — the authenticated user's own appointments. */
export const myAppointments = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    if (!user?.id) {
      throw new AppError(401, 'You must be logged in.');
    }
    const role = (await User.findById(user.id).lean())?.role;
    if (role !== 'patient' && role !== 'doctor') {
      throw new AppError(403, 'Only patients and doctors have appointments.');
    }
    const filter: Record<string, unknown> =
      role === 'doctor' ? { doctor: user.id } : { patient: user.id };

    // Optional status filtering: `status` (exact) or `view` (upcoming/completed/cancelled).
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const view = typeof req.query.view === 'string' ? req.query.view : undefined;
    if (status) {
      if (!BASE_STATUSES.includes(status as AppointmentStatus)) {
        throw new AppError(400, `status must be one of: ${BASE_STATUSES.join(', ')}`);
      }
      filter.status = status;
    } else if (view) {
      if (view === 'upcoming') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filter.status = { $in: ['pending', 'confirmed', 'scheduled'] };
        filter.date = { $gte: today };
      } else if (view === 'completed') {
        filter.status = 'completed';
      } else if (view === 'cancelled') {
        filter.status = 'cancelled';
      } else {
        throw new AppError(400, 'view must be one of: upcoming, completed, cancelled');
      }
    }

    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 10;
    const resolvedLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * resolvedLimit;

    const [total, items] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(resolvedLimit)
        .populate('patient', 'name email profileImage')
        .populate('doctorProfile', 'clinicName consultationFee clinicAddress user')
        .populate('doctor', 'name email profileImage')
        .populate('specialty', 'name slug')
        .lean(),
    ]);

    const appointments = items.map((a) => ({
      ...a,
      id: String(a._id),
      fee: (a as { doctorProfile?: { consultationFee?: number } }).doctorProfile
        ?.consultationFee ?? a.fee ?? 0,
    }));
    return sendSuccess(res, 200, 'Appointments retrieved', {
      appointments,
      pagination: {
        page,
        limit: resolvedLimit,
        total,
        totalPages: Math.ceil(total / resolvedLimit),
      },
    });
  },
);

/** GET /api/appointments/:id — return one appointment to an authorized user. */
export const getAppointmentById = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    const { id } = req.params as { id?: string };

    if (!user?.id) {
      throw new AppError(401, 'You must be logged in.');
    }
    if (!id) {
      throw new AppError(404, 'Appointment not found.');
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new AppError(404, 'Appointment not found.');
    }

    const appointment = await Appointment.findById(id)
      .populate('patient', 'name email profileImage')
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'clinicName consultationFee clinicAddress user')
      .populate('specialty', 'name slug')
      .lean();

    if (!appointment) {
      throw new AppError(404, 'Appointment not found.');
    }

    const patientId = String(appointment.patient?._id ?? appointment.patient);
    const doctorId = String(appointment.doctor?._id ?? appointment.doctor);
    const isOwner = user.role === 'patient' && patientId === user.id;
    const isAssignedDoctor = user.role === 'doctor' && doctorId === user.id;

    if (user.role !== 'admin' && !isOwner && !isAssignedDoctor) {
      throw new AppError(403, 'You are not allowed to view this appointment.');
    }

    const { meetingToken: _meetingToken, ...safeAppointment } = appointment as typeof appointment & {
      meetingToken?: string;
    };

    return sendSuccess(res, 200, 'Appointment retrieved', {
      appointment: { ...safeAppointment, id: String(appointment._id) },
    });
  },
);

const BASE_STATUSES: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'scheduled',
  'completed',
  'cancelled',
  'no-show',
];

/** Allowed doctor-initiated status transitions. */
const DOCTOR_TRANSITIONS: Record<string, AppointmentStatus[]> = {
  pending: ['confirmed', 'scheduled', 'cancelled', 'no-show'],
  confirmed: ['scheduled', 'completed', 'cancelled', 'no-show'],
  scheduled: ['completed', 'cancelled', 'no-show', 'confirmed'],
  completed: [],
  cancelled: [],
  'no-show': [],
};

/** How many hours before the appointment a patient can still cancel. */
const CANCELLATION_WINDOW_HOURS = 24;

/**
 * PATCH /api/appointments/:id/status — a doctor updates an appointment status.
 * Enforces whitelisted transitions so invalid/retroactive changes are rejected.
 */
export const updateAppointmentStatus = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    const { id } = req.params as { id?: string };
    const { status } = req.body ?? {};

    if (!user?.id) {
      throw new AppError(401, 'Authentication required.');
    }
    if (!id) {
      throw new AppError(400, 'Appointment id is required.');
    }
    if (!BASE_STATUSES.includes(status as AppointmentStatus)) {
      throw new AppError(400, `status must be one of: ${BASE_STATUSES.join(', ')}`);
    }

    const appt = await Appointment.findOne({ _id: id })
      .populate('doctorProfile', 'user clinicName')
      .lean();
    if (!appt) {
      throw new AppError(404, 'Appointment not found');
    }
    const doctorUserId = String(
      (appt.doctorProfile as unknown as { user?: unknown })?.user ?? '',
    );
    if (doctorUserId !== user.id) {
      throw new AppError(403, 'Only the booking doctor can update this appointment.');
    }

    const allowedTargets = DOCTOR_TRANSITIONS[appt.status] ?? [];
    if (!allowedTargets.includes(status as AppointmentStatus)) {
      throw new AppError(
        400,
        `Cannot change status from "${appt.status}" to "${status}". Allowed: ${allowedTargets.join(', ') || 'none'}.`,
      );
    }

        const updated = await Appointment.findOneAndUpdate({ _id: id }, { status }, { returnDocument: 'after' })
      .populate('patient', 'name email profileImage')
      .populate('doctorProfile', 'clinicName consultationFee')
      .populate('specialty', 'name slug')
      .lean();
    if (!updated) {
      throw new AppError(404, 'Appointment not found');
    }

    // Notify the patient of the status change (in-app + email).
    const aptype = (updated as { type?: string }).type ?? 'in-person';
    const patientObj = (updated as { patient?: { name?: string; email?: string } }).patient;
    const patientEmail = patientObj?.email;
    const patientName = patientObj?.name ?? 'there';
    const dateStr = toDateString((updated as { date?: Date }).date ?? new Date());
    void notifyPatientAboutAppointment({
      patientId: String(((updated as unknown as { patient?: { _id?: string } }).patient?._id as string) ?? user.id),
      type: 'appointment.status_update',
      title: `Appointment ${status}`,
      message: `Your ${aptype} appointment is now ${status}.`,
      appointmentId: id,
      email: patientEmail
        ? {
            to: { name: patientName, email: patientEmail },
            template: 'appointment.status_update',
            vars: {
              patientName,
              doctor: {
                name: doctorNameForAppointment(
                  updated as unknown as {
                    doctorProfile?: { user?: { name?: string } } | null;
                    doctor?: { name?: string } | null;
                  },
                ),
              },
              date: dateStr,
              time: `${(updated as { startTime?: string }).startTime ?? ''}–${(updated as { endTime?: string }).endTime ?? ''}`,
              status,
            },
          }
        : undefined,
    });

    return sendSuccess(res, 200, 'Status updated', {
      appointment: { ...updated, id: String(updated._id) },
    });
  },
);
/**
 * POST /api/appointments/:id/cancel — a patient cancels their own booking.
 *
 * Sensible rules:
 *  - Only the patient who booked may cancel.
 *  - Already completed/cancelled/no-show appointments cannot be cancelled again.
 *  - The appointment must not have started yet.
 *  - Must be at least CANCELLATION_WINDOW_HOURS away (24h by default).
 */
export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    const { id } = req.params as { id?: string };
    if (!user?.id) {
      throw new AppError(401, 'Authentication required.');
    }
    if (!id) {
      throw new AppError(400, 'Appointment id is required.');
    }

    const appt = await Appointment.findOne({ _id: id })
      .populate('doctorProfile', 'user clinicName')
      .lean();
    if (!appt) {
      throw new AppError(404, 'Appointment not found');
    }
    if (String(appt.patient) !== user.id) {
      throw new AppError(403, 'Only the patient who booked can cancel this appointment.');
    }
    if (appt.status === 'completed' || appt.status === 'cancelled' || appt.status === 'no-show') {
      throw new AppError(400, `This appointment is already "${appt.status}".`);
    }

    // Build the local start instant (YYYY-MM-DD + startTime).
    const parts = toDateString(appt.date).split('-').map(Number);
    const startMinutes = Math.max(0, timeToMinutes(appt.startTime));
    const startLocal = new Date(parts[0], parts[1] - 1, parts[2], Math.floor(startMinutes / 60), startMinutes % 60);

    if (startLocal.getTime() <= Date.now()) {
      throw new AppError(400, 'Cannot cancel an appointment that has already started.');
    }
    const hoursUntil = (startLocal.getTime() - Date.now()) / 3_600_000;
    if (hoursUntil < CANCELLATION_WINDOW_HOURS) {
      throw new AppError(
        400,
        `Appointments must be cancelled at least ${CANCELLATION_WINDOW_HOURS} hours in advance. This one is ${Math.max(0, hoursUntil).toFixed(1)}h away.`,
      );
    }

    const updated = await Appointment.findOneAndUpdate(
      { _id: id },
            { status: 'cancelled' },
      { returnDocument: 'after' },
    )
      .populate('doctorProfile', 'clinicName consultationFee')
      .lean();

    // Notify the patient + notify the doctor about the cancellation (in-app + email).
    const cancellingUser = await User.findById(user.id).select('name email').lean();
    const patName = cancellingUser?.name ?? 'there';
    const aptype = (updated as { type?: string }).type ?? 'in-person';
    void notifyPatientAboutAppointment({
      patientId: user.id,
      type: 'appointment.cancellation',
      title: 'Appointment cancelled',
      message: `Your ${aptype} appointment was cancelled.`,
      appointmentId: id,
      email: cancellingUser?.email
        ? {
            to: { name: patName, email: cancellingUser.email },
            template: 'appointment.cancellation',
            vars: {
              patientName: patName,
              doctor: { name: doctorNameForAppointment(updated as any) },
              date: toDateString((updated as any).date ?? appt.date),
              time: `${(updated as any).startTime ?? appt.startTime}–${(updated as any).endTime ?? appt.endTime}`,
              reason: 'Cancelled by patient',
            },
          }
        : undefined,
    });
    void notifyDoctorAboutAppointment({
      doctorId: String((appt.doctorProfile as unknown as { user?: unknown })?.user ?? ''),
      type: 'appointment.cancellation',
      title: 'Appointment cancelled',
      message: `${patName} cancelled an appointment.`,
      appointmentId: id,
    });

    return sendSuccess(res, 200, 'Appointment cancelled', {
      appointment: { ...updated, id: String(updated!._id) },
    });
  },
);

/** Format a Date as YYYY-MM-DD in local time. */
function toDateString(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * PATCH /api/appointments/:id/notes — a doctor adds/updates consultation notes.
 */
export const updateAppointmentNotes = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    const { id } = req.params as { id?: string };
    const { notes } = req.body ?? {};

    if (!user?.id) {
      throw new AppError(401, 'Authentication required.');
    }
    if (!id) {
      throw new AppError(400, 'Appointment id is required.');
    }
    if (typeof notes !== 'string' || notes.length > 2000) {
      throw new AppError(400, 'Notes must be a string of at most 2000 characters.');
    }

    const appt = await Appointment.findOne({ _id: id })
      .populate('doctorProfile', 'user')
      .lean();
    if (!appt) {
      throw new AppError(404, 'Appointment not found');
    }
    const doctorUserId = String(
      (appt.doctorProfile as unknown as { user?: unknown })?.user ?? '',
    );
    if (doctorUserId !== user.id) {
      throw new AppError(403, 'Only the booking doctor can add notes.');
    }

    const updated = await Appointment.findOneAndUpdate(
      { _id: id },
            { notes },
      { returnDocument: 'after' },
    )
      .populate('patient', 'name email profileImage')
      .populate('doctorProfile', 'clinicName')
      .lean();
    return sendSuccess(res, 200, 'Notes updated', {
      appointment: { ...updated, id: String(updated!._id) },
    });
  },
);

/**
 * GET /api/appointments/doctor/:ref/slots?date=YYYY-MM-DD
 *
 * Public helper so a patient can see the available slots for a doctor on a
 * given date before booking. Slot generation uses the availability rules.
 */
export const doctorAvailableSlots = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { ref } = req.params as { ref?: string };
    const { date } = req.query as { date?: string };
    if (!ref) {
      throw new AppError(400, 'Doctor reference is required.');
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError(400, 'A valid date (YYYY-MM-DD) is required.');
    }
    const profile = await DoctorProfile.findOne({ slug: ref.toLowerCase() });
    if (!profile) {
      throw new AppError(404, 'Doctor not found.');
    }
    const { generateSlots } = await import('../services/availabilityService');
    const slots = await generateSlots(
      {
        availability: profile.availability,
        blockedDates: profile.blockedDates,
        _id: profile._id,
      },
      date,
    );
    return sendSuccess(res, 200, 'Available slots', { slots });
  },
);