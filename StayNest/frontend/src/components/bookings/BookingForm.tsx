import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  Bed,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react'
import { createBooking } from '../../features/bookings/bookingSlice'
import Button from '../ui/Button'
import Card from '../ui/Card'
import UnsplashImage from '../ui/UnsplashImage'
import { formatPrice, daysBetween } from '../../services/location'

export default function BookingForm({ hotel, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((s) => s.bookings)
  const formRef = useRef(null)

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState({
    checkIn: today,
    checkOut: tomorrow,
    guests: 2,
    numberOfRooms: 1,
    roomType: hotel?.roomTypes?.[0] || 'Standard Room',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleChange = (field) => (ev) => {
    const val = ev.target.type === 'number' ? Number(ev.target.value) : ev.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors((e) => {
        const c = { ...e }
        delete c[field]
        return c
      })
    }
  }

  // Calculate nights & price
  const nights = Math.max(0, daysBetween(form.checkIn, form.checkOut))
  const pricePerNight = hotel?.pricePerNight || 0
  const totalPrice = pricePerNight * nights * (form.numberOfRooms || 1)

  const validate = () => {
    const e = {}
    if (!form.checkIn) e.checkIn = 'Check-in date is required'
    if (!form.checkOut) e.checkOut = 'Check-out date is required'
    if (form.checkIn >= form.checkOut) e.checkOut = 'Check-out date must be after check-in'
    if (!Number.isFinite(form.guests) || form.guests < 1) e.guests = 'Must be at least 1 guest'
    if (!Number.isFinite(form.numberOfRooms) || form.numberOfRooms < 1)
      e.rooms = 'Must be at least 1 room'
    if (!form.roomType) e.roomType = 'Please select a room type'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const tomorrowStr = (dateStr) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (loading || !validate()) return

    const result = await dispatch(
      createBooking({
        hotel: hotel.id,
        roomType: form.roomType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        numberOfRooms: Number(form.numberOfRooms),
      })
    )

    if (createBooking.fulfilled.match(result) && result.payload?.booking?.id) {
      navigate(`/bookings/${result.payload.booking.id}/confirmation`)
    }
  }

  const img = hotel?.thumbnail || hotel?.images?.[0]

  return (
    <div ref={formRef} className="mt-8 scroll-mt-20">
      <div className="overflow-hidden rounded-2xl border border-blue-200/80 bg-card shadow-xl ring-1 ring-blue-500/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-blue-50 via-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Reserve Your Stay</h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-slate-200/60 hover:text-foreground"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Hotel snippet */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-border/80 bg-slate-50/70 p-3.5">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
              <UnsplashImage
                src={img}
                query={hotel?.name}
                alt={hotel?.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-foreground">{hotel?.name}</h3>
              <p className="text-xs text-muted">
                {hotel?.city}, {hotel?.country}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-primary">
                {formatPrice(hotel?.pricePerNight)}
                <span className="font-normal text-muted"> / night</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Check-in */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Check-in Date</label>
                <div className="relative">
                  <Calendar size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="date"
                    className="input h-10 pl-9 text-xs"
                    value={form.checkIn}
                    min={today}
                    onChange={handleChange('checkIn')}
                  />
                </div>
                {errors.checkIn && <p className="mt-1 text-[11px] text-red-500">{errors.checkIn}</p>}
              </div>

              {/* Check-out */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Check-out Date</label>
                <div className="relative">
                  <Calendar size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="date"
                    className="input h-10 pl-9 text-xs"
                    value={form.checkOut}
                    min={form.checkIn ? tomorrowStr(form.checkIn) : tomorrow}
                    onChange={handleChange('checkOut')}
                  />
                </div>
                {errors.checkOut && <p className="mt-1 text-[11px] text-red-500">{errors.checkOut}</p>}
              </div>

              {/* Guests */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Guests</label>
                <div className="relative">
                  <Users size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="input h-10 pl-9 text-xs"
                    value={form.guests}
                    onChange={handleChange('guests')}
                  />
                </div>
                {errors.guests && <p className="mt-1 text-[11px] text-red-500">{errors.guests}</p>}
              </div>

              {/* Number of Rooms */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Rooms</label>
                <div className="relative">
                  <Bed size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input h-10 pl-9 text-xs"
                    value={form.numberOfRooms}
                    onChange={handleChange('numberOfRooms')}
                  />
                </div>
                {errors.rooms && <p className="mt-1 text-[11px] text-red-500">{errors.rooms}</p>}
              </div>
            </div>

            {/* Room type picker */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Select Room Type</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(hotel?.roomTypes || ['Standard Room', 'Deluxe Room', 'Executive Suite']).map(
                  (rt) => {
                    const isSelected = form.roomType === rt
                    return (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, roomType: rt }))}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary-bg text-primary shadow-sm'
                            : 'border-border bg-card text-muted hover:border-slate-300 hover:text-foreground'
                        }`}
                      >
                        <Bed size={16} className={isSelected ? 'text-primary' : 'text-slate-400'} />
                        <span className="text-xs font-semibold">{rt}</span>
                      </button>
                    )
                  }
                )}
              </div>
              {errors.roomType && <p className="mt-1 text-[11px] text-red-500">{errors.roomType}</p>}
            </div>

            {/* Price Breakdown */}
            {nights > 0 ? (
              <div className="rounded-xl border border-border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <CreditCard size={15} className="text-primary" />
                  <span>Price Summary</span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>
                      {formatPrice(pricePerNight)} × {nights} night{nights > 1 ? 's' : ''} ×{' '}
                      {form.numberOfRooms} room{form.numberOfRooms > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Taxes & service fees</span>
                    <span className="font-medium text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                    <span className="text-foreground">Total Price</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  * Calculated server-side at reservation confirmation. Free cancellation available.
                </p>
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary h-11 flex-1 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || nights === 0}
                className="btn-primary h-11 flex-1 gap-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Book ({formatPrice(totalPrice)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
