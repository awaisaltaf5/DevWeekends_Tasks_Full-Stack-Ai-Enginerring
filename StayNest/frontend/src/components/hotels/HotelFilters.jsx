import { SlidersHorizontal, X, Star, RotateCcw } from 'lucide-react'
import LocationAutocomplete from '../ui/LocationAutocomplete'

const AMENITY_OPTIONS = [
  'Free WiFi',
  'Swimming Pool',
  'Gym',
  'Restaurant',
  'Spa',
  'Breakfast Included',
  'Airport Shuttle',
  'Free Parking',
  'Air Conditioning',
  'Room Service',
]

const RATING_OPTIONS = [
  { value: '', label: 'All' },
  { value: '3.0', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
]

export default function HotelFilters({ filters, onChange, onReset, onClose, showClose }) {
  const update = (patch) => onChange({ ...filters, ...patch })

  const toggleAmenity = (amenity) => {
    const current = filters.amenities || []
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    update({ amenities: next })
  }

  const activeFilterCount = [
    Boolean(filters.city),
    Boolean(filters.search),
    Boolean(filters.minPrice || filters.maxPrice),
    Boolean(filters.rating),
    Boolean((filters.amenities || []).length > 0),
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {onClose && showClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-1.5 text-muted hover:bg-background-alt hover:text-foreground"
          >
            <X size={18} />
          </button>
        ) : activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Location Filter with Autocomplete */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
          Location / City
        </label>
        <LocationAutocomplete
          value={filters.city || ''}
          onChange={(val) => update({ city: val })}
          onSelect={(loc) => update({ city: loc.city || loc.name || '' })}
          placeholder="Filter by city"
          inputClassName="h-9 text-xs"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
          Price Per Night (PKR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] text-muted">Min</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="input mt-0.5 h-9 text-xs"
              value={filters.minPrice || ''}
              onChange={(e) => update({ minPrice: e.target.value })}
            />
          </div>
          <div>
            <span className="text-[11px] text-muted">Max</span>
            <input
              type="number"
              min="0"
              placeholder="Any"
              className="input mt-0.5 h-9 text-xs"
              value={filters.maxPrice || ''}
              onChange={(e) => update({ maxPrice: e.target.value })}
            />
          </div>
        </div>

        {/* Quick price presets */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { label: '< 10k', min: '', max: '10000' },
            { label: '10k - 25k', min: '10000', max: '25000' },
            { label: '25k - 50k', min: '25000', max: '50000' },
            { label: '50k+', min: '50000', max: '' },
          ].map((preset) => {
            const isSelected =
              filters.minPrice === preset.min && filters.maxPrice === preset.max
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => update({ minPrice: preset.min, maxPrice: preset.max })}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'border border-border bg-background-alt text-muted hover:border-slate-300 hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Minimum Star Rating */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
          Guest Rating
        </label>
        <div className="grid grid-cols-5 gap-1">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = (filters.rating || '') === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => update({ rating: opt.value })}
                className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-border bg-card text-muted hover:bg-background-alt hover:text-foreground'
                }`}
              >
                {opt.value && <Star size={11} className={isSelected ? 'fill-white' : 'fill-amber-400 text-amber-400'} />}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Amenities Checkboxes */}
      <div>
        <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
          Popular Amenities
        </label>
        <div className="space-y-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const checked = (filters.amenities || []).includes(amenity)
            return (
              <label
                key={amenity}
                className="group flex cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary-light"
                />
                <span className={checked ? 'font-semibold text-primary' : ''}>{amenity}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onReset}
        className="btn-secondary h-10 w-full gap-2 rounded-xl text-xs font-bold"
      >
        <RotateCcw size={14} />
        <span>Reset All Filters</span>
      </button>
    </div>
  )
}
