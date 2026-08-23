import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Star, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { fetchSaved, removeSaved } from '../features/saved/savedSlice'
import { capitalize, formatPrice } from '../services/location'
import UnsplashImage from '../components/ui/UnsplashImage'

function SavedHotelSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="aspect-[16/10] w-full animate-pulse bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  )
}

export default function SavedPage() {
  const dispatch = useDispatch()
  const { savedHotels, loading, error, savingId } = useSelector((s) => s.saved)

  useEffect(() => {
    dispatch(fetchSaved())
  }, [dispatch])

  const handleRemove = (hotelId) => {
    dispatch(removeSaved(hotelId))
  }

  if (loading && savedHotels.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-extrabold text-foreground">Saved Hotels</h1>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SavedHotelSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
              <Heart size={14} className="fill-red-500" />
              <span>Wishlist</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-foreground">Saved Hotels</h1>
            <p className="mt-1 text-sm text-muted">
              {savedHotels.length > 0
                ? `${savedHotels.length} propert${savedHotels.length === 1 ? 'y' : 'ies'} in your wishlist`
                : 'Properties you have bookmarked for later'}
            </p>
          </div>
          {savedHotels.length > 0 && (
            <Link
              to="/hotels"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <span>Browse more hotels</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {savedHotels.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <Heart size={32} className="text-red-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">Your wishlist is empty</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Browse hotels and tap the heart icon to save the ones you love. They will appear here instantly.
            </p>
            <Link
              to="/hotels"
              className="btn-primary mt-6 inline-flex h-11 gap-2 rounded-xl px-6 text-sm font-bold shadow-md"
            >
              Discover Hotels
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedHotels.map((entry) => {
              const hotel = entry.hotel || {}
              const imgSrc = hotel.thumbnail || hotel.images?.[0]
              const isRemoving = savingId === hotel.id

              return (
                <div
                  key={entry.id}
                  className={`card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all ${isRemoving ? 'pointer-events-none opacity-60' : ''}`}
                >
                  {/* Image */}
                  <Link
                    to={`/hotels/${hotel.id}`}
                    className="relative block aspect-[16/10] w-full overflow-hidden bg-slate-100"
                  >
                    <UnsplashImage
                      src={imgSrc}
                      query={hotel.name}
                      alt={hotel.name || 'Hotel'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm">
                      <Heart size={12} className="fill-red-500 text-red-500" />
                      <span>Saved</span>
                    </span>
                  </Link>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="line-clamp-1 text-base font-bold text-foreground transition-colors hover:text-primary"
                    >
                      {hotel.name || 'Untitled Hotel'}
                    </Link>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <MapPin size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{capitalize(hotel.city || '')}, {hotel.country || ''}</span>
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{hotel.rating ? Number(hotel.rating).toFixed(1) : 'New'}</span>
                      <span className="text-muted">({hotel.reviewCount || 0} reviews)</span>
                    </div>

                    <div className="mt-3 text-lg font-extrabold text-primary">
                      {formatPrice(hotel.pricePerNight)}
                      <span className="text-xs font-normal text-muted"> / night</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="btn-primary h-9 flex-1 justify-center rounded-xl text-xs font-bold"
                      >
                        View Hotel
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(hotel.id)}
                        disabled={isRemoving}
                        aria-label="Remove from saved"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        {isRemoving ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
