import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users as UsersIcon,
  Wallet,
  RefreshCw,
  Trash2,
  Search,
  Upload,
  Edit2,
  X,
} from 'lucide-react'
import {
  getAdminStats,
  getAdminHotels,
  createAdminHotel,
  updateAdminHotel,
  deleteAdminHotel,
  getAdminBookings,
  updateBookingStatus,
  getAdminUsers,
} from '../app/api/adminApi'
import StatusBadge from '../components/ui/StatusBadge'
import UnsplashImage from '../components/ui/UnsplashImage'
import { formatPrice, capitalize } from '../services/location'
import { logout } from '../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'users', label: 'Users', icon: UsersIcon },
]

const fmt = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Admin dashboard. All data comes from the admin-only API; the backend
 * enforces the `admin` role on every call (route is guarded by RequireAdmin).
 */
export default function AdminPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Overview
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])

  // Hotels
  const [adminHotels, setAdminHotels] = useState([])
  const [hotelQuery, setHotelQuery] = useState('')
  const [savingHotelId, setSavingHotelId] = useState(null)

  // Bookings
  const [adminBookings, setAdminBookings] = useState([])
  const [bookingFilter, setBookingFilter] = useState('')
  const [changingStatusId, setChangingStatusId] = useState(null)

  // Users
  const [adminUsers, setAdminUsers] = useState([])

  const run = async (fn) => {
    setLoading(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const loadOverview = async () => {
    const [statsRes, bookingsRes] = await Promise.all([getAdminStats(), getAdminBookings()])
    setStats(statsRes.stats)
    setRecentBookings((bookingsRes.bookings || []).slice(0, 5))
  }

  const loadHotels = async () => {
    const res = await getAdminHotels(hotelQuery ? { search: hotelQuery } : undefined)
    setAdminHotels(res.hotels || [])
  }

  const loadBookings = async () => {
    const res = await getAdminBookings(bookingFilter ? { status: bookingFilter } : undefined)
    setAdminBookings(res.bookings || [])
  }

  const loadUsers = async () => {
    const res = await getAdminUsers()
    setAdminUsers(res.users || [])
  }

  useEffect(() => {
    if (tab === 'overview') run(loadOverview)
    if (tab === 'hotels') run(loadHotels)
    if (tab === 'bookings') run(loadBookings)
    if (tab === 'users') run(loadUsers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const toggleHotelActive = async (hotel) => {
    setSavingHotelId(hotel.id)
    try {
      const res = await updateAdminHotel(hotel.id, { isActive: !hotel.isActive })
      setAdminHotels((list) => list.map((h) => (h.id === hotel.id ? res.hotel : h)))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Update failed')
    } finally {
      setSavingHotelId(null)
    }
  }

  const handleUpdateHotel = async (id, data) => {
    setSavingHotelId(id)
    try {
      const res = await updateAdminHotel(id, data)
      setAdminHotels((list) => list.map((h) => (h.id === id ? res.hotel : h)))
      return { success: true }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Update failed')
      return { success: false, error: err?.response?.data?.message || err.message }
    } finally {
      setSavingHotelId(null)
    }
  }

  const handleDeleteHotel = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return
    setSavingHotelId(hotel.id)
    try {
      await deleteAdminHotel(hotel.id)
      setAdminHotels((list) => list.filter((h) => h.id !== hotel.id))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Delete failed')
    } finally {
      setSavingHotelId(null)
    }
  }

  const handleBookingStatus = async (booking, status) => {
    if (status === booking.status) return
    setChangingStatusId(booking.id)
    try {
      const res = await updateBookingStatus(booking.id, status)
      setAdminBookings((list) => list.map((b) => (b.id === booking.id ? res.booking : b)))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Update failed')
    } finally {
      setChangingStatusId(null)
    }
  }

  const refetch = () => {
    if (tab === 'overview') run(loadOverview)
    if (tab === 'hotels') run(loadHotels)
    if (tab === 'bookings') run(loadBookings)
    if (tab === 'users') run(loadUsers)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }


  const statCards = [
    { label: 'Total users', value: stats?.totalUsers ?? '—', icon: UsersIcon, tint: 'bg-primary-bg text-primary' },
    { label: 'Total hotels', value: stats?.totalHotels ?? '—', icon: Building2, tint: 'bg-accent/10 text-accent' },
    { label: 'Total bookings', value: stats?.totalBookings ?? '—', icon: CalendarDays, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Revenue', value: formatPrice(stats?.totalRevenue ?? 0), icon: Wallet, tint: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin dashboard</h1>
          <p className="text-sm text-muted">Manage your platform's hotels, bookings, and users.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            className="btn-ghost h-9 gap-1.5 px-3 text-sm"
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" onClick={handleLogout} className="btn-ghost h-9 px-3 text-sm">
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <nav
        className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"
        aria-label="Admin sections"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-primary-bg text-primary'
                : 'text-muted hover:bg-background-alt hover:text-foreground'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : tab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tint}`}>
                    <s.icon size={20} />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted">{s.label}</p>
                </div>
              ))}
            </div>


            {/* Recent bookings */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-semibold text-foreground">Recent bookings</h2>
                <button
                  type="button"
                  onClick={() => setTab('bookings')}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all
                </button>
              </div>
              {recentBookings.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                        <th className="px-5 py-3 font-medium">Guest</th>
                        <th className="px-5 py-3 font-medium">Hotel</th>
                        <th className="px-5 py-3 font-medium">Dates</th>
                        <th className="px-5 py-3 font-medium">Total</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-background-alt/60">
                          <td className="px-5 py-3 font-medium text-foreground">{b.user?.name || '—'}</td>
                          <td className="px-5 py-3 text-muted">{b.hotel?.name || '—'}</td>
                          <td className="px-5 py-3 text-muted">{fmt(b.checkIn)} → {fmt(b.checkOut)}</td>
                          <td className="px-5 py-3 font-medium text-foreground">{formatPrice(b.totalPrice)}</td>
                          <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : tab === 'hotels' ? (
          <HotelsPanel
            hotels={adminHotels}
            query={hotelQuery}
            setQuery={setHotelQuery}
            onSearch={loadHotels}
            onToggle={toggleHotelActive}
            onUpdate={handleUpdateHotel}
            onDelete={handleDeleteHotel}
            savingId={savingHotelId}
          />
        ) : tab === 'bookings' ? (
          <BookingsPanel
            bookings={adminBookings}
            filter={bookingFilter}
            setFilter={setBookingFilter}
            onChangeFilter={loadBookings}
            onChangeStatus={handleBookingStatus}
            changingId={changingStatusId}
          />
        ) : (
          <UsersPanel users={adminUsers} />
        )}
      </div>
    </div>
  )
}


/* ---------------------------------------------------------------------------
 * Hotels panel — searchable list, create, edit, toggle active, delete.
 * ------------------------------------------------------------------------- */
function HotelsPanel({ hotels, query, setQuery, onSearch, onToggle, onUpdate, onDelete, savingId }) {
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '', city: '', country: '', pricePerNight: '', thumbnail: '', description: '',
  })

  // Edit Hotel state
  const [editingHotel, setEditingHotel] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    name: '', city: '', country: '', pricePerNight: '', thumbnail: '', description: '',
  })

  const openEditModal = (hotel) => {
    setEditingHotel(hotel)
    setEditError('')
    setEditForm({
      name: hotel.name || '',
      city: hotel.city || '',
      country: hotel.country || 'Pakistan',
      pricePerNight: hotel.pricePerNight ?? '',
      thumbnail: hotel.thumbnail || '',
      description: hotel.description || '',
    })
  }

  const saveEditHotel = async () => {
    if (!editForm.name.trim() || !editForm.city.trim() || !editForm.pricePerNight) {
      setEditError('Name, city and price per night are required.')
      return
    }
    setUpdating(true)
    setEditError('')
    try {
      const res = await onUpdate(editingHotel.id, {
        name: editForm.name.trim(),
        city: editForm.city.trim(),
        country: editForm.country.trim() || 'Pakistan',
        pricePerNight: Number(editForm.pricePerNight),
        thumbnail: editForm.thumbnail.trim() || FALLBACK_IMG,
        description: editForm.description.trim(),
      })
      if (res?.success) {
        setEditingHotel(null)
      } else {
        setEditError(res?.error || 'Update failed')
      }
    } catch (err) {
      setEditError(err?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const createHotel = async () => {
    if (!form.name.trim() || !form.city.trim() || !form.pricePerNight) {
      setFormError('Name, city and price per night are required.')
      return
    }
    setCreating(true)
    setFormError('')
    try {
      await createAdminHotel({
        name: form.name.trim(),
        city: form.city.trim(),
        country: form.country.trim() || 'Pakistan',
        pricePerNight: Number(form.pricePerNight),
        thumbnail: form.thumbnail.trim() || FALLBACK_IMG,
        description: form.description.trim(),
      })
      setForm({ name: '', city: '', country: '', pricePerNight: '', thumbnail: '', description: '' })
      setShowCreate(false)
      onSearch()
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-foreground">Hotels ({hotels.length})</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="Search hotels…"
              aria-label="Search hotels"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="input h-9 w-full pl-9 sm:w-56"
            />
          </div>
          <button type="button" onClick={onSearch} className="btn-ghost h-9 px-3 text-sm">Search</button>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="btn-primary h-9 gap-1.5 px-3 text-sm"
          >
            <Upload size={15} /> Add hotel
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="animate-fade-in grid gap-3 border-b border-border bg-background-alt/60 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <input className="input" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Hotel name" />
          <input className="input" placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} aria-label="City" />
          <input className="input" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} aria-label="Country" />
          <input className="input" type="number" min="0" placeholder="Price / night *" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} aria-label="Price per night" />
          <input className="input sm:col-span-2" placeholder="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} aria-label="Thumbnail URL" />
          <textarea className="input sm:col-span-2 lg:col-span-3" rows={2} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-label="Description" />
          {formError && <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{formError}</p>}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <button type="button" onClick={createHotel} disabled={creating} className="btn-primary h-9 px-4">
              {creating ? 'Saving…' : 'Create hotel'}
            </button>
            <button type="button" onClick={() => { setShowCreate(false); setFormError('') }} className="btn-ghost h-9 px-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setEditingHotel(null)} />
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Edit Hotel</h3>
              <button
                type="button"
                onClick={() => setEditingHotel(null)}
                className="rounded-lg p-1.5 text-muted hover:bg-background-alt hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted">Hotel Name *</label>
                <input className="input mt-1" placeholder="Hotel Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">City *</label>
                <input className="input mt-1" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Country</label>
                <input className="input mt-1" placeholder="Country" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted">Price per Night (PKR) *</label>
                <input className="input mt-1" type="number" min="0" placeholder="Price" value={editForm.pricePerNight} onChange={(e) => setEditForm({ ...editForm, pricePerNight: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted">Thumbnail URL</label>
                <input className="input mt-1" placeholder="Thumbnail URL" value={editForm.thumbnail} onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted">Description</label>
                <textarea className="input mt-1" rows={3} placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              {editError && <p className="text-sm text-red-600 sm:col-span-2">{editError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-border">
              <button type="button" onClick={() => setEditingHotel(null)} className="btn-ghost h-9 px-4">
                Cancel
              </button>
              <button type="button" onClick={saveEditHotel} disabled={updating} className="btn-primary h-9 px-4">
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {hotels.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No hotels found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Hotel</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-background-alt/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <UnsplashImage
                        src={h.thumbnail || h.images?.[0]}
                        query={h.name}
                        alt=""
                        className="h-9 w-12 shrink-0 rounded-md object-cover"
                      />
                      <span className="font-medium text-foreground">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{capitalize(h.city)}</td>
                  <td className="px-5 py-3 text-muted">{formatPrice(h.pricePerNight)}</td>
                  <td className="px-5 py-3 text-muted">{h.rating || '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        h.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-background-alt text-muted'
                      }`}
                    >
                      {h.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(h)}
                        disabled={savingId === h.id}
                        aria-label={`Edit ${h.name}`}
                        title="Edit hotel"
                        className="rounded p-1.5 text-muted transition-colors hover:text-primary hover:bg-background-alt"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggle(h)}
                        disabled={savingId === h.id}
                        className={`btn-ghost h-8 px-2.5 text-xs ${h.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                        title={h.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {h.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(h)}
                        disabled={savingId === h.id}
                        aria-label={`Delete ${h.name}`}
                        title="Delete hotel"
                        className="rounded p-1.5 text-muted transition-colors hover:text-red-600 hover:bg-background-alt"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


/* ---------------------------------------------------------------------------
 * Bookings panel — filterable list with inline status updates.
 * ------------------------------------------------------------------------- */
const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

function BookingsPanel({ bookings, filter, setFilter, onChangeFilter, onChangeStatus, changingId }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-foreground">Bookings ({bookings.length})</h2>
        <div className="flex items-center gap-2">
          <select
            className="input h-9 w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onBlur={onChangeFilter}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
          <button type="button" onClick={onChangeFilter} className="btn-ghost h-9 px-3 text-sm">Apply</button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Hotel</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border items-center last:border-0 hover:bg-background-alt/60">
                  <td className="px-5 py-3 font-medium text-foreground">{b.user?.name || '—'}</td>
                  <td className="px-5 py-3 text-muted">{b.hotel?.name || '—'}</td>
                  <td className="px-5 py-3 text-muted">{fmt(b.checkIn)} → {fmt(b.checkOut)}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatPrice(b.totalPrice)}</td>
                  <td className="px-5 py-3">
                    <select
                      className="input h-9 w-auto"
                      value={b.status}
                      disabled={changingId === b.id}
                      onChange={(e) => onChangeStatus(b, e.target.value)}
                      aria-label="Update booking status"
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>{capitalize(s)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Users panel — read-only list of all accounts.
 * ------------------------------------------------------------------------- */
function UsersPanel({ users }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="font-semibold text-foreground">Users ({users.length})</h2>
      </div>
      {users.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background-alt/60">
                  <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'admin' ? 'bg-primary-bg text-primary' : 'bg-background-alt text-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{fmt(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
