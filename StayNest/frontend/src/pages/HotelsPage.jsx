import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { fetchHotels } from '../features/hotels/hotelSlice'
import { capitalize, formatPrice } from '../services/location'
import HotelCard from '../components/hotels/HotelCard'
import HotelSkeleton from '../components/hotels/HotelSkeleton'
import HotelFilters from '../components/hotels/HotelFilters'
import Card from '../components/ui/Card'
import LocationAutocomplete from '../components/ui/LocationAutocomplete'

const emptyFilters = {
  city: '',
  search: '',
  minPrice: '',
  maxPrice: '',
  rating: '',
  amenities: [],
  sort: 'featured',
}

export default function HotelsPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hotels, loading, error, total, totalPages, currentPage } = useSelector((s) => s.hotels)

  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'featured',
  }))

  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [recommendedHotels, setRecommendedHotels] = useState([])

  const buildParams = () => ({
    page,
    limit: 9,
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.rating ? { rating: filters.rating } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
    ...(filters.amenities.length ? { amenities: filters.amenities.join(',') } : {}),
  })

  // Sync state when URL params change
  useEffect(() => {
    const urlCity = searchParams.get('city') || ''
    const urlSearch = searchParams.get('search') || ''
    setFilters((prev) => ({
      ...prev,
      city: urlCity,
      search: urlSearch,
    }))
  }, [searchParams])

  useEffect(() => {
    dispatch(fetchHotels(buildParams()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page])

  // Load recommended fallback stays if empty
  useEffect(() => {
    if (hotels.length === 0 && !loading) {
      dispatch(fetchHotels({ featured: true, limit: 3 }))
        .unwrap()
        .then((res) => setRecommendedHotels(res.hotels || []))
        .catch(() => setRecommendedHotels([]))
    }
  }, [hotels.length, loading, dispatch])

  const updateFilters = (next) => {
    setFilters(next)
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ ...emptyFilters })
    setSearchParams({})
    setPage(1)
    setDrawerOpen(false)
  }

  const removeFilter = (key, val) => {
    if (key === 'amenities') {
      const next = (filters.amenities || []).filter((a) => a !== val)
      updateFilters({ ...filters, amenities: next })
    } else {
      updateFilters({ ...filters, [key]: '' })
    }
  }

  const cityName = filters.city ? capitalize(filters.city) : ''
  const hasActiveFilters = Boolean(
    filters.city ||
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.rating ||
      filters.amenities.length > 0
  )

  return (
    <section className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-foreground">
          {cityName ? `Hotels in ${cityName}` : 'Explore Properties'}
        </h1>
        <p className="text-sm text-muted">
          {cityName
            ? `Showing ${total} verified stay${total === 1 ? '' : 's'} in ${cityName}`
            : `Showing ${total} available propert${total === 1 ? 'y' : 'ies'} worldwide`}
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input with location autocomplete support */}
        <div className="relative flex-1">
          <LocationAutocomplete
            value={filters.search || filters.city}
            onChange={(val) => updateFilters({ ...filters, search: val, city: '' })}
            onSelect={(loc) => updateFilters({ ...filters, city: loc.city || loc.name || '', search: '' })}
            placeholder="Search destination, hotel name or city..."
            inputClassName="h-11 pl-10 text-sm"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <select
            className="input h-11 w-full text-xs font-semibold sm:w-48 sm:text-sm"
            value={filters.sort}
            onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
            aria-label="Sort hotels by"
          >
            <option value="featured">Featured</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn-secondary h-11 shrink-0 gap-2 px-4 text-xs font-bold lg:hidden"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-muted">Active Filters:</span>
          {filters.city && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
              <span>City: {capitalize(filters.city)}</span>
              <button
                type="button"
                onClick={() => removeFilter('city')}
                aria-label="Remove city filter"
                className="hover:text-blue-950"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800">
              <span>Query: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => removeFilter('search')}
                aria-label="Remove search filter"
                className="hover:text-blue-950"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-800">
              <span>
                Price: {filters.minPrice ? formatPrice(filters.minPrice) : '0'} –{' '}
                {filters.maxPrice ? formatPrice(filters.maxPrice) : 'Any'}
              </span>
              <button
                type="button"
                onClick={() => {
                  removeFilter('minPrice')
                  removeFilter('maxPrice')
                }}
                aria-label="Remove price filter"
                className="hover:text-slate-950"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {filters.rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
              <span>Rating: {filters.rating}+ Stars</span>
              <button
                type="button"
                onClick={() => removeFilter('rating')}
                aria-label="Remove rating filter"
                className="hover:text-amber-950"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {filters.amenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-800"
            >
              <span>{amenity}</span>
              <button
                type="button"
                onClick={() => removeFilter('amenities', amenity)}
                aria-label={`Remove ${amenity} filter`}
                className="hover:text-slate-950"
              >
                <X size={13} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <RotateCcw size={12} />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar Filters + Hotel Results */}
      <div className="mt-7 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <Card className="sticky top-20 p-5 shadow-sm">
            <HotelFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
          </Card>
        </aside>

        {/* Results Container */}
        <div>
          {loading ? (
            <HotelSkeleton count={6} />
          ) : error ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted shadow-sm">
              <p className="text-base font-semibold text-red-600">Unable to load hotels</p>
              <p className="mt-1 text-sm">{error}</p>
              <button type="button" onClick={resetFilters} className="btn-primary mt-4 h-10 px-5">
                Retry
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="space-y-8">
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <MapPin size={28} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">No hotels matched your criteria</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  We couldn't find any stays matching your selected filters. Try broadening your location, price, or
                  rating range.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-primary mt-5 h-10 gap-2 px-6 text-sm font-semibold"
                >
                  <RotateCcw size={15} />
                  <span>Reset All Filters</span>
                </button>
              </div>

              {/* Recommended properties fallback */}
              {recommendedHotels.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="text-lg font-bold text-foreground">Recommended stays you might like</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {recommendedHotels.map((h) => (
                      <HotelCard key={h.id} hotel={h} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {hotels.map((h) => (
                  <HotelCard key={h.id} hotel={h} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setPage(currentPage - 1)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    aria-label="Previous page"
                    className="btn-secondary h-10 gap-1 rounded-xl px-4 text-xs font-bold disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span className="px-3 text-xs font-semibold text-muted">
                    Page <strong className="text-foreground">{currentPage}</strong> of{' '}
                    <strong className="text-foreground">{totalPages}</strong>
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setPage(currentPage + 1)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    aria-label="Next page"
                    className="btn-secondary h-10 gap-1 rounded-xl px-4 text-xs font-bold disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-drawer-in absolute right-0 top-0 h-full w-84 max-w-[85vw] overflow-y-auto bg-card p-6 shadow-2xl">
            <HotelFilters
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              onClose={() => setDrawerOpen(false)}
              showClose
            />
          </div>
        </div>
      )}
    </section>
  )
}
