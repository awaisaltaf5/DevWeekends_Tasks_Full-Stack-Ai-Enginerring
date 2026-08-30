import { api } from './api';
import type { Specialty } from '../types';

/** Fetch all active specialties (with doctor counts). */
export async function fetchSpecialties(): Promise<Specialty[]> {
  const { data } = await api.get<{ success: boolean; specialties?: Specialty[] }>(
    '/specialties',
  );
  return data.specialties ?? [];
}