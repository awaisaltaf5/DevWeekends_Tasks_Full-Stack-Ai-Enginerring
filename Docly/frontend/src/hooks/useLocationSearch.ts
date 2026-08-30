import { useCallback, useEffect, useRef, useState } from 'react';
import { searchLocations } from '../services/geocodeService';
import { apiErrorMessage } from '../services/api';
import { useDebounce } from './useDebounce';
import type { GeocodePlace } from '../types';

interface UseLocationSearchResult {
  query: string;
  setQuery: (value: string) => void;
  results: GeocodePlace[];
  loading: boolean;
  error: string | null;
  select: (place: GeocodePlace) => void;
  clear: () => void;
}

/**
 * Type-ahead location search. Debounces input, aborts stale requests, and
 * stops once a place has been selected.
 */
export function useLocationSearch(initial = ''): UseLocationSearchResult {
  const [query, setQueryState] = useState(initial);
  const [results, setResults] = useState<GeocodePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);

  const debounced = useDebounce(query, 450);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selected || debounced.trim().length < 3) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    searchLocations(debounced)
      .then((places) => {
        if (!controller.signal.aborted) {
          setResults(places);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(apiErrorMessage(err));
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debounced, selected]);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setSelected(false);
  }, []);

  const select = useCallback((place: GeocodePlace) => {
    setQueryState(place.displayName);
    setSelected(true);
    setResults([place]);
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    setQueryState('');
    setResults([]);
    setSelected(false);
    setError(null);
  }, []);

  return { query, setQuery, results, loading, error, select, clear };
}