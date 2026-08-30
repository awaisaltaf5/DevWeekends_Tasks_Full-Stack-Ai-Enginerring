import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDoctors } from '../services/doctorService';
import { apiErrorMessage } from '../services/api';
import { useDebounce } from './useDebounce';
import type { Doctor, DoctorFilters, DoctorSort, Pagination } from '../types';

const PAGE_SIZE = 9;

export const defaultFilters: DoctorFilters = {
  search: '',
  specialty: '',
  city: '',
  lat: undefined,
  lng: undefined,
  radiusKm: 50,
  minFee: undefined,
  maxFee: undefined,
  minExperience: undefined,
  maxExperience: undefined,
  minRating: undefined,
  sort: 'relevance',
};

interface UseDoctorsResult {
  doctors: Doctor[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  filters: DoctorFilters;
  page: number;
  setPage: (page: number) => void;
  updateFilters: (patch: Partial<DoctorFilters>, resetPage?: boolean) => void;
  setSort: (sort: DoctorSort) => void;
  resetFilters: () => void;
  refetch: () => void;
}

/**
 * Loads paginated doctor search results with debounced free-text inputs.
 * Uses an AbortController to ignore stale responses when filters change.
 */
export function useDoctors(): UseDoctorsResult {
  const [filters, setFilters] = useState<DoctorFilters>(defaultFilters);
  const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce free-text inputs so we don't refetch on every keystroke.
  const debouncedSearch = useDebounce(filters.search, 450);
  const debouncedCity = useDebounce(filters.city, 450);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    const queryFilters: DoctorFilters = {
      ...filters,
      search: debouncedSearch,
      city: debouncedCity,
    };

    // Respect the chosen location even when the city text is cleared fully:
    // if both are empty, drop the coordinates.
    const effective = { ...queryFilters };
    if (!effective.search.trim() && !effective.city.trim()) {
      effective.lat = undefined;
      effective.lng = undefined;
    }

    fetchDoctors(effective, page, PAGE_SIZE)
      .then((result) => {
        if (controller.signal.aborted) return;
        setDoctors(result.doctors);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    debouncedSearch,
    debouncedCity,
    filters.specialty,
    filters.lat,
    filters.lng,
    filters.radiusKm,
    filters.minFee,
    filters.maxFee,
    filters.minExperience,
    filters.maxExperience,
    filters.minRating,
    filters.sort,
    page,
    refreshKey,
  ]);

  const updateFilters = useCallback(
    (patch: Partial<DoctorFilters>, resetPage = true) => {
      setFilters((prev) => ({ ...prev, ...patch }));
      if (resetPage) setPage(1);
    },
    [],
  );

  const setSort = useCallback(
    (sort: DoctorSort) => updateFilters({ sort }),
    [updateFilters],
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, []);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    doctors,
    pagination,
    loading,
    error,
    filters,
    page,
    setPage,
    updateFilters,
    setSort,
    resetFilters,
    refetch,
  };
}
