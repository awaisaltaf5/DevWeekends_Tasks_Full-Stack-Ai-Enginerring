import { api } from './api';
import type { Doctor, DoctorsPayload, DoctorFilters, Pagination } from '../types';

/** Build a query string from doctor filters, omitting empty values. */
export function buildDoctorQuery(filters: DoctorFilters, page: number, limit = 10): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.specialty) params.set('specialty', filters.specialty);
  if (filters.city.trim()) params.set('city', filters.city.trim());
  if (filters.lat !== undefined) params.set('lat', String(filters.lat));
  if (filters.lng !== undefined) params.set('lng', String(filters.lng));
  if (filters.radiusKm !== undefined) params.set('radiusKm', String(filters.radiusKm));
  if (filters.minFee !== undefined) params.set('minFee', String(filters.minFee));
  if (filters.maxFee !== undefined) params.set('maxFee', String(filters.maxFee));
  if (filters.minExperience !== undefined) params.set('minExperience', String(filters.minExperience));
  if (filters.maxExperience !== undefined) params.set('maxExperience', String(filters.maxExperience));
  if (filters.minRating !== undefined) params.set('minRating', String(filters.minRating));
  params.set('sort', filters.sort);

  return params.toString();
}

interface DoctorsResponseData {
  success: boolean;
  doctors?: Doctor[];
  pagination?: Pagination;
}

/** Fetch a page of doctors with filters. */
export async function fetchDoctors(
  filters: DoctorFilters,
  page: number,
  limit = 10,
): Promise<DoctorsPayload> {
  const { data } = await api.get<DoctorsResponseData>(
    `/doctors?${buildDoctorQuery(filters, page, limit)}`,
  );
  return {
    doctors: data.doctors ?? [],
    pagination: data.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

/** Fetch a single doctor by id or slug. */
export async function fetchDoctor(ref: string): Promise<Doctor> {
  const { data } = await api.get<{ success: boolean; doctor: Doctor }>(
    `/doctors/${encodeURIComponent(ref)}`,
  );
  return data.doctor;
}