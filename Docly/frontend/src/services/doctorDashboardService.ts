import { api, apiErrorMessage } from './api';
import type {
  Doctor,
  DashboardStats,
  Appointment,
  Patient,
  AvailabilitySlotForm,
  BookableSlot,
  DoctorProfileUpdate,
} from '../types';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiSuccess {
  success: boolean;
  message?: string;
}

/** GET /api/doctor/me — the authenticated doctor's profile. */
export async function fetchMyProfile(): Promise<Doctor> {
  const { data } = await api.get<ApiSuccess & { profile: Doctor }>('/doctor/me');
  if (!data.profile) throw new Error('No profile returned');
  return data.profile;
}

/** PUT /api/doctor/profile — update editable profile fields. */
export async function updateMyProfile(update: DoctorProfileUpdate): Promise<Doctor> {
  const { data } = await api.put<ApiSuccess & { profile: Doctor }>('/doctor/profile', update);
  return data.profile;
}

/** GET /api/doctor/dashboard — overview statistics. */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiSuccess & { stats: DashboardStats }>('/doctor/dashboard');
  return data.stats;
}

/** GET /api/doctor/appointments — paginated, filterable list. */
export async function fetchAppointments(params: {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<{ appointments: Appointment[]; pagination: Pagination }> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const { data } = await api.get<ApiSuccess & {
    appointments?: Appointment[];
    pagination?: Pagination;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  }>(`/doctor/appointments?${qs.toString()}`);
  const appointments = Array.isArray(data.appointments) ? data.appointments : [];
  const pagination = data.pagination ?? {
    page: data.page ?? params.page ?? 1,
    limit: data.limit ?? params.limit ?? 10,
    total: data.total ?? appointments.length,
    totalPages: data.totalPages ?? 1,
  };
  return { appointments, pagination };
}

/** GET /api/doctor/patients — unique patients. */
export async function fetchPatients(): Promise<Patient[]> {
  const { data } = await api.get<ApiSuccess & { patients: Patient[] }>('/doctor/patients');
  return data.patients;
}

/** GET /api/doctor/availability/slots?date=YYYY-MM-DD — preview slots. */
export async function fetchSlots(date: string): Promise<BookableSlot[]> {
  const { data } = await api.get<ApiSuccess & { slots: BookableSlot[] }>(
    `/doctor/availability/slots?date=${encodeURIComponent(date)}`,
  );
  return data.slots;
}

/** PUT /api/doctor/availability — set weekly availability + blocked dates. */
export async function setAvailability(
  availability: AvailabilitySlotForm[],
  blockedDates?: string[],
): Promise<void> {
  await api.put<ApiSuccess>('/doctor/availability', { availability, blockedDates });
}

/** POST /api/doctor/profile/image — upload a profile image. */
export async function uploadProfileImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<ApiSuccess & { profileImage: string }>(
    '/doctor/profile/image',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.profileImage;
}
