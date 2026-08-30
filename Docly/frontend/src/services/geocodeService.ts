import { api } from './api';
import type { GeocodePlace } from '../types';

/**
 * Location search via the backend proxy (Nominatim). Debouncing happens in
 * the consuming hook — this service only issues a single request.
 */
export async function searchLocations(query: string): Promise<GeocodePlace[]> {
  if (!query.trim()) {
    return [];
  }
  const { data } = await api.get<{ success: boolean; places?: GeocodePlace[] }>(
    `/location/search?q=${encodeURIComponent(query.trim())}`,
  );
  return data.places ?? [];
}