import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBooking, cancelBooking } from '../features/bookings/bookingSlice'
import StatusBadge from '../components/ui/StatusBadge'
import UnsplashImage from '../components/ui/UnsplashImage'
import {
  Calendar,
  Users,
  MapPin,
  ClipboardCheck,
  Bed,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Phone,
  CreditCard,
} from 'lucide-react'
import { formatPrice, capitalize, formatDate } from '../services/location'

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

const nights = (checkIn, checkOut) => {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  return Math.max(0, Math.round((b - a) / 86400000))
}

export default function BookingConfirmationPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { booking, loading, error } = useSelector((s) => s.bookings)
  const [cancelling, setCancelling] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    dispatch(fetchBooking(id))
  }, [dispatch, id])

  const handleCancel = async () => {
    setCancelling(true)
    const res = await dispatch(cancelBooking(id))
    setCancelling(false)
    setShowConfirmModal(false)
    if (cancelBooking.fulfilled.match(res)) navigate('/bookings')
  }

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded bg-slate-200" style={{ width: `${80 - i * 5}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">Booking not found</h2>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link to="/bookings" className="btn-primary mt-6 inline-flex h-10 gap-2 px-5 text-sm font-semibold">
          <ArrowLeft size={15} />
          Back to My Bookings
        </Link>
      </div>
    )
  }

  if (!booking) return null

  const hotel = booking.hotel || {}
  const img = hotel.thumbnail || hotel.images?.[0]
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const stayNights = nights(booking.checkIn, booking.checkOut)

  return (
    <div className="min-h-screen bg-slate-50/60 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span>Back to My Bookings</span>
        </Link>

        {/* Status Banner */}
        {booking.status === 'confirmed' && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3.5 text-sm font-semibold text-green-800">
            <CheckCircle2 size={18} className="text-green-600" />
            <span>Your booking is confirmed! See you soon.</span>
          </div>
        )}
        {booking.status === 'cancelled' && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-800">
            <AlertTriangle size={18} className="text-red-600" />
            <span>This booking has been cancelled.</span>
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-5">
          {/* Hotel Image */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <UnsplashImage
                src={img}
                query={hotel.name}
                alt={hotel.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {/* Hotel Quick Info */}
            <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">{hotel.name || '—'}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={14} />
                {capitalize(hotel.city || '')}, {hotel.country || '—'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-muted">Check-in</p>
                  <p className="mt-1 text-xs font-bold text-foreground">{fmt(booking.checkIn)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-muted">Check-out</p>
                  <p className="mt-1 text-xs font-bold text-foreground">{fmt(booking.checkOut)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-foreground">Booking Confirmation</h1>
                <StatusBadge status={booking.status} />
              </div>

              {/* Reference */}
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <ClipboardCheck size={18} className="shrink-0 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Booking Reference</p>
                  <p className="font-mono text-xs font-bold text-primary">{booking.id}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-5 space-y-0 divide-y divide-border rounded-xl border border-border overflow-hidden">
                {[
                  { icon: MapPin, label: 'Hotel', value: hotel.name || '—' },
                  { icon: MapPin, label: 'Location', value: `${capitalize(hotel.city || '')}, ${hotel.country || '—'}` },
                  { icon: Calendar, label: 'Check-in', value: fmt(booking.checkIn) },
                  { icon: Calendar, label: 'Check-out', value: fmt(booking.checkOut) },
                  { icon: Calendar, label: 'Duration', value: `${stayNights} night${stayNights !== 1 ? 's' : ''}` },
                  { icon: Users, label: 'Guests', value: `${booking.guests} guest${booking.guests !== 1 ? 's' : ''}` },
                  { icon: Bed, label: 'Room Type', value: booking.roomType || '—' },
                  { icon: Bed, label: 'Rooms', value: `${booking.numberOfRooms} room${booking.numberOfRooms !== 1 ? 's' : ''}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 px-4 py-3.5 text-sm">
                    <div className="flex w-36 shrink-0 items-center gap-2 text-muted">
                      <Icon size={14} className="shrink-0" />
                      <span>{label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <CreditCard size={14} className="text-primary" />
                  <span>Payment Summary</span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>{formatPrice(hotel.pricePerNight || 0)} × {stayNights} nights × {booking.numberOfRooms} room{booking.numberOfRooms !== 1 ? 's' : ''}</span>
                    <span className="font-medium text-foreground">{formatPrice(booking.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-bold">
                    <span className="text-foreground">Total Paid</span>
                    <span className="text-primary">{formatPrice(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/hotels" className="btn-secondary h-10 gap-2 rounded-xl px-5 text-sm font-semibold">
                  Browse More Hotels
                </Link>
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="h-10 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-modal-in w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-foreground">Cancel this booking?</h2>
            <p className="mt-2 text-sm text-muted">
              This action cannot be undone. Your booking for <strong>{hotel.name}</strong> will be permanently cancelled.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary h-10 flex-1 rounded-xl text-sm font-bold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
