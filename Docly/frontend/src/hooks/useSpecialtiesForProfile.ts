import { useEffect, useState } from 'react';
import { fetchSpecialties } from '../services/specialtyService';
import { apiErrorMessage } from '../services/api';
import type { Specialty } from '../types';

interface UseSpecialtiesForProfileResult {
  specialties: Specialty[];
  specialtiesLoading: boolean;
  error: string | null;
}

/** Loads specialties for the profile specialty dropdown. */
export function useSpecialtiesForProfile(): UseSpecialtiesForProfileResult {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSpecialtiesLoading(true);
    setError(null);
    fetchSpecialties()
      .then((data) => {
        if (active) setSpecialties(data);
      })
      .catch((err) => {
        if (active) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (active) setSpecialtiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { specialties, specialtiesLoading, error };
}