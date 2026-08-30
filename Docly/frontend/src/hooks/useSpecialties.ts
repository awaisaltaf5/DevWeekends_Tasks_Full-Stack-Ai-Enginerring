import { useEffect, useState } from 'react';
import { fetchSpecialties } from '../services/specialtyService';
import { apiErrorMessage } from '../services/api';
import type { Specialty } from '../types';

interface UseSpecialtiesResult {
  specialties: Specialty[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Loads the list of specialties once (with manual reload). */
export function useSpecialties(): UseSpecialtiesResult {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchSpecialties()
      .then((data) => {
        if (!active) return;
        setSpecialties(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tick]);

  return {
    specialties,
    loading,
    error,
    reload: () => setTick((t) => t + 1),
  };
}