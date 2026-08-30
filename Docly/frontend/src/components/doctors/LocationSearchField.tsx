import { MapPin, X, Loader2 } from 'lucide-react';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import type { GeocodePlace } from '../../types';

interface Props {
  onSelect: (place: GeocodePlace) => void;
  onClear: () => void;
}

/**
 * Type-ahead location field. Debounces user input via the Nominatim-backed
 * backend proxy, shows a dropdown of matching places, and reports the
 * selected place (with coordinates) back to the parent.
 */
export default function LocationSearchField({ onSelect, onClear }: Props) {
  const location = useLocationSearch();

  const handleSelect = (place: GeocodePlace) => {
    location.select(place);
    onSelect(place);
  };

  const handleClear = () => {
    location.clear();
    onClear();
  };

  return (
    <div className="relative">
      <MapPin
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted z-10"
        aria-hidden="true"
      />
      <input
        type="search"
        value={location.query}
        onChange={(e) => location.setQuery(e.target.value)}
        placeholder="City or area..."
        aria-label="Search location"
        className="input pl-10 pr-10"
      />
      {location.query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-foreground"
          aria-label="Clear location"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown */}
      {location.loading && (
        <div className="absolute z-20 mt-1 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching…
          </div>
        </div>
      )}

      {!location.loading && !location.error && location.results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {location.results.map((place) => (
            <button
              key={`${place.displayName}-${place.lat}-${place.lon}`}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-background-alt"
            >
              <div className="font-medium text-foreground">{place.displayName}</div>
              {(place.city || place.country) && (
                <div className="text-xs text-muted">
                  {[place.city, place.country].filter(Boolean).join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!location.loading && location.error && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-500">
          {location.error}
        </div>
      )}
    </div>
  );
}
