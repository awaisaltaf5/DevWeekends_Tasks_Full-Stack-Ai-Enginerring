import { useState } from 'react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { useDoctors } from '../hooks/useDoctors';
import { useSpecialties } from '../hooks/useSpecialties';
import SearchBar from '../components/doctors/SearchBar';
import SpecialtyFilter from '../components/doctors/SpecialtyFilter';
import FilterBar from '../components/doctors/FilterBar';
import LocationSearchField from '../components/doctors/LocationSearchField';
import DoctorCard from '../components/doctors/DoctorCard';
import { DoctorGridSkeleton, ErrorState, EmptyState } from '../components/ui/States';
import Pagination from '../components/ui/Pagination';

/** Doctor discovery page with search, filters, and pagination. */
export default function FindDoctorsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    doctors,
    pagination,
    loading,
    error,
    filters,
    setPage,
    updateFilters,
    setSort,
    resetFilters,
    refetch,
  } = useDoctors();

  const { specialties, loading: specialtiesLoading } = useSpecialties();

  return (
    <section className="container-docly py-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-bg via-background to-background-alt p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Care, on your schedule</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find the right doctor
          </h1>
          <p className="mt-3 text-muted">
            Search trusted specialists by name, specialty, or location and compare the details that matter.
          </p>
        </div>
      </div>

      {/* Search + Location row (stacks on mobile, side-by-side on sm+) */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SearchBar
          value={filters.search}
          onChange={(v) => updateFilters({ search: v })}
          placeholder="Doctor name or clinic..."
          ariaLabel="Search doctors"
          suggestions={doctors}
          loading={loading && Boolean(filters.search.trim())}
        />
        <LocationSearchField
          onSelect={(place) =>
            updateFilters({
              lat: place.lat,
              lng: place.lon,
              city: place.city ?? '',
              radiusKm: 50,
            })
          }
          onClear={() =>
            updateFilters({
              lat: undefined,
              lng: undefined,
              city: '',
              radiusKm: 50,
            })
          }
        />
      </div>

      {/* Specialty filter pills */}
      <div className="mt-6">
        <SpecialtyFilter
          specialties={specialties}
          loading={specialtiesLoading}
          selected={filters.specialty}
          onSelect={(slug) => updateFilters({ specialty: slug })}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {loading ? 'Finding doctors...' : `${pagination.total.toLocaleString()} doctor${pagination.total === 1 ? '' : 's'} found`}
        </p>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="btn-secondary px-3 py-2 text-sm lg:hidden"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Advanced filters */}
      <div className={`${filtersOpen ? 'block' : 'hidden'} mt-4 lg:block`}>
        <FilterBar
          filters={filters}
          onFilterChange={updateFilters}
          onSortChange={setSort}
          onReset={resetFilters}
        />
      </div>

      {/* Active filter summary */}
      {(filters.search || filters.specialty || filters.city || filters.minFee !== undefined || filters.maxFee !== undefined || filters.minExperience !== undefined || filters.minRating !== undefined) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            <Filter className="h-3.5 w-3.5" /> Active
          </span>
          {filters.search && <FilterChip label={`Search: ${filters.search}`} onRemove={() => updateFilters({ search: '' })} />}
          {filters.specialty && <FilterChip label={`Specialty: ${filters.specialty}`} onRemove={() => updateFilters({ specialty: '' })} />}
          {filters.city && <FilterChip label={`Location: ${filters.city}`} onRemove={() => updateFilters({ city: '', lat: undefined, lng: undefined })} />}
          {filters.minFee !== undefined && <FilterChip label={`From Rs. ${filters.minFee}`} onRemove={() => updateFilters({ minFee: undefined })} />}
          {filters.maxFee !== undefined && <FilterChip label={`Up to Rs. ${filters.maxFee}`} onRemove={() => updateFilters({ maxFee: undefined })} />}
          {filters.minExperience !== undefined && <FilterChip label={`${filters.minExperience}+ years`} onRemove={() => updateFilters({ minExperience: undefined })} />}
          {filters.minRating !== undefined && <FilterChip label={`${filters.minRating}+ rating`} onRemove={() => updateFilters({ minRating: undefined })} />}
        </div>
      )}

      {/* Results */}
      <div className="mt-8">
        {loading ? (
          <DoctorGridSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary-light bg-primary-bg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
      aria-label={`Remove ${label} filter`}
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}
