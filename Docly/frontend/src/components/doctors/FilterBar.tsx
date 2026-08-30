import { Star, Filter, X } from 'lucide-react';
import type { DoctorFilters, DoctorSort } from '../../types';

interface Props {
  filters: DoctorFilters;
  onFilterChange: (patch: Partial<DoctorFilters>) => void;
  onSortChange: (sort: DoctorSort) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: DoctorSort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'fee-asc', label: 'Fee (low to high)' },
  { value: 'fee-desc', label: 'Fee (high to low)' },
  { value: 'experience', label: 'Experience' },
  { value: 'name', label: 'Name' },
];

/** Advanced filters: fee range, experience, rating, and sort. */
export default function FilterBar({
  filters,
  onFilterChange,
  onSortChange,
  onReset,
}: Props) {
  const currentRating = filters.minRating ?? 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-foreground">
          <Filter className="h-4 w-4 text-muted" />
          Filters
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-muted hover:text-primary"
        >
          Reset all
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Min fee */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Min fee (Rs.)</label>
          <input
            type="number"
            min={0}
            placeholder="—"
            value={filters.minFee ?? ''}
            onChange={(e) =>
              onFilterChange({
                minFee: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="input py-2 text-sm"
          />
        </div>

        {/* Max fee */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Max fee (Rs.)</label>
          <input
            type="number"
            min={0}
            placeholder="—"
            value={filters.maxFee ?? ''}
            onChange={(e) =>
              onFilterChange({
                maxFee: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="input py-2 text-sm"
          />
        </div>

        {/* Min experience */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">
            Min experience (years)
          </label>
          <input
            type="number"
            min={0}
            max={60}
            placeholder="—"
            value={filters.minExperience ?? ''}
            onChange={(e) =>
              onFilterChange({
                minExperience: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="input py-2 text-sm"
          />
        </div>

        {/* Min rating */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Min rating</label>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onFilterChange({ minRating: star })}
                aria-label={`Minimum ${star} stars`}
                className={`p-0.5 ${star <= currentRating ? 'text-amber-400' : 'text-border'}`}
              >
                <Star className="h-4 w-4 fill-current" />
              </button>
            ))}
            {currentRating > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange({ minRating: undefined })}
                className="p-0.5 text-muted hover:text-foreground"
                aria-label="Clear rating filter"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sort (full-width on mobile, 3/4 on larger screens) */}
        <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
          <label className="text-xs font-medium text-muted">Sort by</label>
          <select
            value={filters.sort}
            onChange={(e) => onSortChange(e.target.value as DoctorSort)}
            className="input py-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
