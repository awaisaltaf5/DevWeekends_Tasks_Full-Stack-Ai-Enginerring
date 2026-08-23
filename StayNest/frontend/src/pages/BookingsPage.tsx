import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchBookings, cancelBooking } from '../features/bookings/bookingSlice'
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react'
import BookingCard from '../components/bookings/BookingCard'

const TABS = [
  { key: 'upcoming', label: 'Upcoming', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
]

export default function BookingsPage() {
  const dispatch = useDispatch()
  const { bookings, loading, error } = useSelector((s) => s.bookings)

  useEffect(() => {
    dispatch(fetchBookings())
  }, [dispatch])

  const now = new Date()
  const sections = {
    upcoming: bookings.filter(
      (b) => new Date(b.checkOut) > now && (b.status === 'pending' || b.status === 'confirmed')
    ),
    completed: bookings.filter(
      (b) => new Date(b.checkOut) <= now && (b.status === 'confirmed' || b.status === 'completed')
    ),
    cancelled: bookings.filter((b) => b.status === 'cancelled'),
  }

  const handleCancel = async (booking) => {
    await dispatch(cancelBooking(booking.id))
  }

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">My Bookings</h1>
          <p className="mt-1 text-sm text-muted">Manage your upcoming stays, view history, and cancel reservations.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Quick Stats Row */}
        {bookings.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Upcoming', count: sections.upcoming.length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Completed', count: sections.completed.length, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
              { label: 'Cancelled', count: sections.cancelled.length, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg}`}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
                <p className="text-xs font-medium text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarDays size={32} className="text-slate-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">No bookings yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Find a hotel you love and make your first reservation. Your upcoming and past stays will appear here.
            </p>
            <Link to="/hotels" className="btn-primary mt-6 inline-flex h-11 gap-2 rounded-xl px-6 text-sm font-bold shadow-md">
              Browse All Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {TABS.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <div className="mb-4 flex items-center gap-2.5">
                  <Icon
                    size={20}
                    className={
                      key === 'upcoming'
                        ? 'text-blue-600'
                        : key === 'completed'
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }
                  />
                  <h2 className="text-lg font-bold text-foreground">
                    {label}{' '}
                    <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-semibold text-slate-600">
                      {sections[key].length}
                    </span>
                  </h2>
                </div>

                {sections[key].length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-card px-5 py-8 text-center text-sm text-muted">
                    No {label.toLowerCase()} bookings.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections[key].map((booking) => (
                      <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
