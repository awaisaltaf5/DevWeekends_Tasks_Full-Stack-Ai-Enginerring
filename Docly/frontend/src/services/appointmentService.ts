import { api } from './api';
import type { BookableSlot, Appointment, AppointmentStatusUpdate } from '../types';

/** GET the doctor's generated slots for a specific date. */
export async function fetchBookableSlots(
  doctorRef: string,
  date: string,
): Promise<BookableSlot[]> {
  const { data } = await api.get<{ success: boolean; slots?: BookableSlot[] }>(
    `/appointments/doctor/${encodeURIComponent(doctorRef)}/slots?date=${encodeURIComponent(date)}`,
  );
  return data.slots ?? [];
}

/** Book an appointment as the authenticated patient. */
export async function bookAppointment(payload: {
  doctorRef: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'video';
  reason?: string;
  phone?: string;
}): Promise<Appointment> {
  const { data } = await api.post<{ success: boolean; appointment: Appointment }>(
    '/appointments',
    payload,
  );
  return data.appointment;
}

/** Pagination metadata from the appointments endpoints. */
export interface AppointmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * GET /appointments/me — the authenticated user's own appointments.
 * `view` may be 'upcoming' | 'completed' | 'cancelled'; `status` overrides it.
 */
export async function fetchMyAppointments(params: {
  view?: 'upcoming' | 'completed' | 'cancelled';
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ appointments: Appointment[]; pagination: AppointmentPagination }> {
  const qs = new URLSearchParams();
  if (params.view) qs.set('view', params.view);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const { data } = await api.get<{
    success: boolean;
    appointments: Appointment[];
    pagination: AppointmentPagination;
  }>(`/appointments/me?${qs.toString()}`);
  return { appointments: data.appointments, pagination: data.pagination };
}

/** GET /appointments/:id — one appointment, authorized by the backend. */
export async function fetchAppointment(id: string): Promise<Appointment> {
  const { data } = await api.get<{ success: boolean; appointment: Appointment }>(
    `/appointments/${encodeURIComponent(id)}`,
  );
  return data.appointment;
}

/** POST /appointments/:id/cancel — cancel one of the patient's own bookings. */
export async function cancelMyAppointment(id: string): Promise<Appointment> {
  const { data } = await api.post<{ success: boolean; appointment: Appointment }>(
    `/appointments/${id}/cancel`,
  );
  return data.appointment;
}

/** PATCH /appointments/:id/status — doctor updates the appointment status. */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatusUpdate,
): Promise<Appointment> {
  const { data } = await api.patch<{ success: boolean; appointment: Appointment }>(
    `/appointments/${id}/status`,
    { status },
  );
  return data.appointment;
}

/** PATCH /appointments/:id/notes — doctor adds/updates consultation notes. */
export async function updateAppointmentNotes(
  id: string,
  notes: string,
): Promise<Appointment> {
  const { data } = await api.patch<{ success: boolean; appointment: Appointment }>(
    `/appointments/${id}/notes`,
    { notes },
  );
  return data.appointment;
}