import mongoose from 'mongoose';
import { Appointment, DoctorProfile, Specialty, User, type AppointmentStatus } from '../models';
import { AppError } from '../utils/AppError';
import type { Qualification, VisitType, AvailabilitySlot } from '../models';
import { validateAvailabilitySet } from './availabilityService';
import { placeholderAvatar } from './unsplashService';

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { day: 1, startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true, breaks: [] },
  { day: 2, startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true, breaks: [] },
  { day: 3, startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true, breaks: [] },
  { day: 4, startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true, breaks: [] },
  { day: 5, startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true, breaks: [] },
];

/** Default specialty assigned when a doctor profile is first auto-created. */
const DEFAULT_SPECIALTY_SLUG = 'general-physician';

/** Get (creating if missing) the authenticated user's doctor profile. */
export async function ensureDoctorProfile(user: { id: string; name: string; email: string }) {
  const existing = await DoctorProfile.findOne({ user: user.id })
    .populate('user', 'name email profileImage role')
    .populate('specialty', 'name slug icon description');
  if (existing) {
    return existing;
  }

  const chosen =
    (await Specialty.findOne({ slug: DEFAULT_SPECIALTY_SLUG })) ?? (await Specialty.findOne());

  const profile = await DoctorProfile.create({
    user: user.id,
    specialty: chosen ? chosen._id : undefined,
    slug: slugify(`${user.name} ${randomSuffix()}`),
    yearsOfExperience: 0,
    consultationFee: 0,
    languages: ['English'],
    visitTypes: ['in-person' as VisitType],
    availability: DEFAULT_AVAILABILITY,
    profileImage: placeholderAvatar(user.name),
    isActive: true,
  });
  return profile;
}

export type ProfileUpdate = Partial<{
  bio: string;
  clinicName: string;
  clinicAddress: string;
  yearsOfExperience: number;
  consultationFee: number;
  languages: string[];
  visitTypes: VisitType[];
  qualifications: Qualification[];
  location: { area?: string; city: string; country: string; coordinates: [number, number] };
  specialty: string;
}>;

/** Update the editable fields of a doctor's own public profile. */
export async function updateDoctorProfile(
  profile: { save(): Promise<unknown> } & Record<string, any>,
  update: ProfileUpdate,
): Promise<void> {
  const allowed: (keyof ProfileUpdate)[] = [
    'bio',
    'clinicName',
    'clinicAddress',
    'yearsOfExperience',
    'consultationFee',
    'languages',
    'visitTypes',
    'qualifications',
    'location',
    'specialty',
  ];
  for (const key of allowed) {
    const value = update[key];
    if (value === undefined) continue;
    if (key === 'yearsOfExperience') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 60) {
        throw new AppError(400, 'Years of experience must be between 0 and 60.');
      }
      profile[key] = n;
      continue;
    }
    if (key === 'consultationFee') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) {
        throw new AppError(400, 'Consultation fee must be a positive number.');
      }
      profile[key] = n;
      continue;
    }
    if (key === 'location') {
      const loc = (value ?? {}) as Record<string, unknown>;
      if (typeof loc !== 'object' || Array.isArray(loc)) {
        throw new AppError(400, 'Location must be an object.');
      }
      const coords =
        Array.isArray(loc.coordinates) && loc.coordinates.length === 2
          ? loc.coordinates
          : [loc.lng, loc.lat];
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        throw new AppError(400, 'Location coordinates must be [longitude, latitude].');
      }
      profile[key] = {
        type: 'Point',
        coordinates: [lng, lat],
        area: typeof loc.area === 'string' ? loc.area : (profile.location?.area ?? ''),
        city: typeof loc.city === 'string' ? loc.city : (profile.location?.city ?? ''),
        country: typeof loc.country === 'string' ? loc.country : (profile.location?.country ?? ''),
      };
      continue;
    }
    if (key === 'languages') {
      if (!Array.isArray(value) || value.length === 0) {
        throw new AppError(400, 'Provide at least one language.');
      }
    }
    if (key === 'visitTypes') {
      const v = value as VisitType[];
      if (!Array.isArray(v) || v.length === 0 || v.some((t) => !['in-person', 'video'].includes(t))) {
        throw new AppError(400, 'Choose at least one valid visit type.');
      }
    }
    if (key === 'qualifications') {
      const q = value as Qualification[];
      if (!Array.isArray(q)) throw new AppError(400, 'Qualifications must be a list.');
      for (const item of q) {
        if (!item || typeof item.degree !== 'string' || !item.degree.trim()) {
          throw new AppError(400, 'Each qualification needs a degree.');
        }
      }
    }
    profile[key] = value;
  }
  await profile.save();
}

/** Replace the weekly availability (validated) and blocked dates. */
export async function setAvailability(
  profile: { availability: AvailabilitySlot[]; blockDates?: string[] } & {
    save(): Promise<unknown>;
  } & Record<string, unknown>,
  availability: AvailabilitySlot[],
  blockedDates?: string[],
): Promise<void> {
  if (!Array.isArray(availability) || availability.length === 0) {
    throw new AppError(400, 'Provide at least one working-day availability slot.');
  }
  const err = validateAvailabilitySet(availability);
  if (err) throw new AppError(400, err);

  profile.availability = availability;

  if (blockedDates !== undefined) {
    if (!Array.isArray(blockedDates)) {
      throw new AppError(400, 'blockedDates must be a list of dates.');
    }
    const parsed = blockedDates.map((b) => {
      const date = new Date(b);
      if (Number.isNaN(date.getTime())) {
        throw new AppError(400, `Invalid blocked date: ${b}`);
      }
      return date;
    });
        profile.blockedDates = parsed;
  }

  await profile.save();
}

/** Aggregate dashboard statistics for the doctor's profile. */
export async function getDashboardStats(doctorProfileId: string) {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const activeStatuses: AppointmentStatus[] = ['pending', 'confirmed', 'scheduled'];
  const [upcomingCount, todayCount, completed, totalAppointments, cancelled] = await Promise.all([
    Appointment.countDocuments({
      doctorProfile: doctorProfileId,
      date: { $gte: dayEnd },
      status: { $in: activeStatuses },
    }),
    Appointment.countDocuments({
      doctorProfile: doctorProfileId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $in: [...activeStatuses, 'completed'] },
    }),
    Appointment.find({ doctorProfile: doctorProfileId, status: 'completed' }).lean(),
    Appointment.countDocuments({ doctorProfile: doctorProfileId }),
    Appointment.countDocuments({ doctorProfile: doctorProfileId, status: 'cancelled' }),
  ]);

  const uniquePatients = await Appointment.distinct('patient', { doctorProfile: doctorProfileId });
  const fees = completed.map((a) => (a as { fee?: number }).fee ?? 0);
  const earnings = fees.reduce((sum, f) => sum + f, 0);

  return {
    upcomingAppointments: upcomingCount,
    todayAppointments: todayCount,
    totalAppointments,
    completedAppointments: completed.length,
    cancelledAppointments: cancelled,
    uniquePatients: uniquePatients.length,
    earnings,
  };
}

export type AppointmentFilter = {
  status?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
};

/** List appointments for a doctor with optional filters + pagination. */
export async function listAppointments(
  doctorProfileId: string,
  filter: AppointmentFilter,
) {
  const query: Record<string, unknown> = { doctorProfile: doctorProfileId };

  if (filter.status) {
    const allowed = ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'];
    if (!allowed.includes(filter.status)) {
      throw new AppError(400, `Invalid status filter. Use: ${allowed.join(', ')}`);
    }
    query.status = filter.status;
  }
  if (filter.from || filter.to) {
    const dateRange: Record<string, Date> = {};
    if (filter.from) dateRange.$gte = new Date(`${filter.from}T00:00:00`);
    if (filter.to) dateRange.$lte = new Date(`${filter.to}T23:59:59`);
    query.date = dateRange;
  }

  const page = Math.max(filter.page, 1);
  const limit = Math.min(Math.max(filter.limit, 1), 50);
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    Appointment.countDocuments(query),
    Appointment.find(query)
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patient', 'name email profileImage')
      .populate('doctorProfile', 'consultationFee clinicName')
      .lean(),
  ]);

  const appointments = items.map((a) => ({
    ...a,
    id: String(a._id),
    fee: (a as { fee?: number; doctorProfile?: { consultationFee?: number } }).fee
      ?? (a as { doctorProfile?: { consultationFee?: number } }).doctorProfile?.consultationFee
      ?? 0,
  }));
  return { appointments, page, limit, total, totalPages: Math.ceil(total / limit) };
}

/** List unique patients who have booked with this doctor. */
export async function listPatients(doctorProfileId: string) {
  const ids = await Appointment.distinct('patient', { doctorProfile: doctorProfileId });
  const patients = await User.find({ _id: { $in: ids }, role: 'patient' })
    .select('name email profileImage')
    .lean();
  const counts = await Appointment.aggregate([
    {
      $match: {
        doctorProfile: new mongoose.Types.ObjectId(doctorProfileId),
        status: 'completed',
      },
    },
    { $group: { _id: '$patient', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return patients.map((p) => ({
    id: String(p._id),
    name: p.name,
    email: p.email,
    profileImage: p.profileImage,
    completedVisits: countMap.get(String(p._id)) ?? 0,
  }));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 5);
}