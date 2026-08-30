import { api } from './api';
import type { Appointment, Specialty, User } from '../types';

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  pendingDoctorApprovals: number;
  totalAppointments: number;
  appointmentsByStatus: Record<string, number>;
}

export interface AdminDoctor {
  id: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  user?: User;
  specialty?: Specialty;
}

export interface AdminPage<T> {
  [key: string]: unknown;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function fetchAdminDashboard(): Promise<AdminStats> {
  const { data } = await api.get<{ stats: AdminStats }>('/admin/dashboard');
  return data.stats;
}

export async function fetchAdminDoctors(status?: string): Promise<AdminDoctor[]> {
  const { data } = await api.get<{ doctors: AdminDoctor[] }>('/admin/doctors', { params: status ? { status } : undefined });
  return data.doctors;
}

export async function updateDoctorVerification(id: string, status: 'verified' | 'rejected'): Promise<void> {
  await api.patch(`/admin/doctors/${id}/verification`, { status });
}

export async function fetchAdminUsers(params: { search?: string; role?: string }): Promise<{ users: User[]; pagination: AdminPage<User>['pagination'] }> {
  const { data } = await api.get<{ users: User[]; pagination: AdminPage<User>['pagination'] }>('/admin/users', { params });
  return data;
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<void> {
  await api.patch(`/admin/users/${id}/status`, { isActive });
}

export async function fetchAdminAppointments(status?: string): Promise<{ appointments: Appointment[]; pagination: AdminPage<Appointment>['pagination'] }> {
  const { data } = await api.get<{ appointments: Appointment[]; pagination: AdminPage<Appointment>['pagination'] }>('/admin/appointments', { params: status ? { status } : undefined });
  return data;
}

export async function updateAdminAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
  await api.patch(`/admin/appointments/${id}/status`, { status });
}

export async function fetchAdminSpecialties(): Promise<Specialty[]> {
  const { data } = await api.get<{ specialties: Specialty[] }>('/admin/specialties');
  return data.specialties;
}

export async function createAdminSpecialty(payload: { name: string; description: string; icon: string }): Promise<void> {
  await api.post('/admin/specialties', payload);
}

export async function updateAdminSpecialty(id: string, payload: Partial<Pick<Specialty, 'name' | 'description' | 'icon'>> & { isActive?: boolean }): Promise<void> {
  await api.patch(`/admin/specialties/${id}`, payload);
}

export async function deleteAdminSpecialty(id: string): Promise<void> {
  await api.delete(`/admin/specialties/${id}`);
}
