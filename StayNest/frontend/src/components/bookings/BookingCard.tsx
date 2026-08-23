import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, CreditCard, Bed, ChevronRight, AlertTriangle, X, Loader2 } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import UnsplashImage from '../ui/UnsplashImage'
import { formatPrice, capitalize } from '../../services/location'

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const nights = (checkIn, checkOut) =>
  Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))

export default function BookingCard({ booking, onCancel }) {
  const hotel = booking.hotel || {}
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const [showModal, setShowModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleConfirmCancel = async () => {
    setCancelling(true)
    await onCancel(booking)
    setCancelling(false)
    setShowModal(false)
  }

  const stayNights = nights(booking.checkIn, booking.checkOut)

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          {/* Hotel Thumbnail */}
          <div className="aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-48 md:w-56">
            <UnsplashImage
              src={hotel.thumbnail || hotel.images?.[0]}
              query={hotel.name}
              alt={hotel.name || 'Hotel'}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{hotel.name || 'Hotel'}</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {capitalize(hotel.city || '')}, {hotel.country || ''}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Details */}
            <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-muted sm:grid-cols-2">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>{fmt(booking.checkIn)} → {fmt(booking.checkOut)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>{stayNights} night{stayNights !== 1 ? 's' : ''}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-slate-400" />
                <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''} · {booking.numberOfRooms} room{booking.numberOfRooms !== 1 ? 's' : ''}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Bed size={13} className="text-slate-400" />
                <span>{booking.roomType || '—'}</span>
              </span>
            </div>

            {/* Price & Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <CreditCard size={14} className="text-primary" />
                <span className="font-extrabold text-primary">{formatPrice(booking.totalPrice)}</span>
                <span className="text-xs text-muted">total</span>
              </div>
              <div className="flex items-center gap-3">
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="text-xs font-semibold text-red-600 transition-colors hover:text-red-800"
                  >
                    Cancel
                  </button>
                )}
                <Link
                  to={`/bookings/${booking.id}/confirmation`}
                  className="btn-primary flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold"
                >
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-modal-in w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="mt-3 text-lg font-bold text-foreground">Cancel Booking?</h2>
            <p className="mt-1.5 text-sm text-muted">
              Are you sure you want to cancel your booking at <strong>{hotel.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary h-10 flex-1 rounded-xl text-xs font-bold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
