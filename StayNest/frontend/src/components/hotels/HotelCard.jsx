import { Link } from 'react-router-dom'
import { Star, MapPin, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { capitalize, formatPrice } from '../../services/location'
import useSaved from '../../hooks/useSaved'
import UnsplashImage from '../ui/UnsplashImage'

export default function HotelCard({ hotel }) {
  const { isSaved, toggleSave, isSaving } = useSaved()
  const saved = isSaved(hotel.id)
  const saving = isSaving(hotel.id)

  return (
    <div className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <UnsplashImage
          src={hotel.thumbnail || hotel.images?.[0]}
          query={hotel.name}
          alt={hotel.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Featured Pill */}
        {hotel.featured && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-sm">
            <Sparkles size={12} />
            <span>Featured</span>
          </div>
        )}

        {/* Save Heart Button */}
        <button
          type="button"
          aria-label={saved ? 'Remove from saved' : 'Save hotel'}
          disabled={saving}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSave(hotel.id)
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-red-500 active:scale-95 disabled:opacity-50"
        >
          <Heart
            size={18}
            className={`transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
          />
        </button>
      </div>

      {/* Body content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/hotels/${hotel.id}`}
            className="line-clamp-1 text-base font-bold text-foreground transition-colors hover:text-primary"
          >
            {hotel.name}
          </Link>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>{hotel.rating ? Number(hotel.rating).toFixed(1) : 'New'}</span>
          </div>
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted">
          <MapPin size={13} className="shrink-0 text-slate-400" />
          <span className="truncate">{capitalize(hotel.city)}, {hotel.country}</span>
        </p>

        {hotel.description && (
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {hotel.description}
          </p>
        )}

        {/* Amenities Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(hotel.amenities || []).slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {a}
            </span>
          ))}
          {(hotel.amenities || []).length > 3 && (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              +{(hotel.amenities || []).length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between border-t border-border/70 pt-3">
            <div>
              <p className="text-xs text-muted">Starting from</p>
              <p className="text-lg font-extrabold text-primary">
                {formatPrice(hotel.pricePerNight)}
                <span className="text-xs font-normal text-muted"> / night</span>
              </p>
            </div>

            <Link
              to={`/hotels/${hotel.id}`}
              className="btn-primary group/btn h-9 gap-1 rounded-xl px-4 text-xs font-semibold"
            >
              <span>View Details</span>
              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
