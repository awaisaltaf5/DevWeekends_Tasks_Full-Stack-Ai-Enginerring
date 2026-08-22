import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Calendar,
  Users,
  Star,
  BadgeCheck,
  Headphones,
  Shield,
  Sparkles,
  MapPin,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { fetchHotels } from '../features/hotels/hotelSlice'
import HotelCard from '../components/hotels/HotelCard'
import HotelSkeleton from '../components/hotels/HotelSkeleton'
import UnsplashImage from '../components/ui/UnsplashImage'
import LocationAutocomplete from '../components/ui/LocationAutocomplete'

const POPULAR_CITIES = [
  { name: 'Islamabad', tag: 'Capital & Margalla Hills', count: '8+ stays' },
  { name: 'Lahore', tag: 'Heart of Culture & Heritage', count: '6+ stays' },
  { name: 'Karachi', tag: 'City of Lights & Arabian Sea', count: '5+ stays' },
  { name: 'Murree', tag: 'Scenic Hill Station', count: '4+ stays' },
  { name: 'Hunza', tag: 'Mountain Paradise', count: '3+ stays' },
  { name: 'Dubai', tag: 'Luxury & Modern Skyline', count: 'Top Global' },
]

const WHY_CHOOSE = [
  {
    icon: BadgeCheck,
    title: 'Verified & Curated Stays',
    text: 'Every property is hand-reviewed with honest guest feedback and verified amenities.',
  },
  {
    icon: Star,
    title: 'Best Price Guarantee',
    text: 'Transparent pricing with server-authoritative rates and zero hidden booking fees.',
  },
  {
    icon: Shield,
    title: 'Secure & Instant Confirmation',
    text: 'End-to-end encrypted reservations with immediate booking references and cancellation support.',
  },
  {
    icon: Headphones,
    title: '24/7 Dedicated Support',
    text: 'Professional assistance before, during, and after your stay for complete peace of mind.',
  },
]

export default function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { hotels, loading } = useSelector((s) => s.hotels)

  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)

  useEffect(() => {
    dispatch(fetchHotels({ featured: true, limit: 6, sort: 'featured' }))
  }, [dispatch])

  const handleSearch = (e) => {
    e?.preventDefault()
    const qs = new URLSearchParams()
    if (location.trim()) qs.set('city', location.trim().toLowerCase())
    if (checkIn) qs.set('checkIn', checkIn)
    if (checkOut) qs.set('checkOut', checkOut)
    if (guests) qs.set('guests', guests)
    if (rooms) qs.set('rooms', rooms)
    navigate(`/hotels?${qs.toString()}`)
  }

  const handleSelectLocation = (locObj) => {
    const city = locObj.city || locObj.name || ''
    setLocation(city)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pb-16 pt-12 md:pb-24 md:pt-20">
        <UnsplashImage
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
          query="luxury hotel resort aerial"
          alt="Luxury Resort"
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950/90" />

        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-blue-200 backdrop-blur-md">
              <Sparkles size={14} className="text-amber-400" />
              <span>Discover Hand-Picked Boutique & Luxury Stays</span>
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Where will your next journey take you?
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Find premium hotels, serene mountain retreats, and vibrant city escapes with transparent pricing.
            </p>
          </div>

          {/* Search Box Card */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-5xl rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-md md:p-5"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
              {/* Location Autocomplete */}
              <div className="lg:col-span-4">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Destination</label>
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  onSelect={handleSelectLocation}
                  placeholder="Where are you going?"
                  inputClassName="h-11 border-slate-200 bg-white text-sm"
                />
              </div>

              {/* Check-in Date */}
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Check-in</label>
                <div className="relative">
                  <Calendar size={17} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    aria-label="Check-in date"
                    className="input h-11 border-slate-200 bg-white pl-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Check-out</label>
                <div className="relative">
                  <Calendar size={17} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(e) => setCheckOut(e.target.value)}
                    aria-label="Check-out date"
                    className="input h-11 border-slate-200 bg-white pl-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Guests</label>
                <div className="relative">
                  <Users size={17} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                    aria-label="Number of guests"
                    className="input h-11 border-slate-200 bg-white pl-9 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end lg:col-span-2">
                <button
                  type="submit"
                  className="btn-primary h-11 w-full gap-2 rounded-xl text-sm font-semibold shadow-md"
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="font-medium text-slate-400">Popular searches:</span>
            {['Islamabad', 'Lahore', 'Karachi', 'Murree', 'Hunza', 'Dubai'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setLocation(city)
                  navigate(`/hotels?city=${city.toLowerCase()}`)
                }}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-medium transition-colors hover:border-white/30 hover:bg-white/20"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section className="container-custom py-14">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
              <TrendingUp size={14} />
              <span>Trending Destinations</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Explore Top Locations</h2>
            <p className="mt-1 text-sm text-muted">Hand-selected travel destinations with high guest satisfaction.</p>
          </div>
          <Link
            to="/hotels"
            className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:mt-0"
          >
            <span>View all destinations</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_CITIES.map((c) => (
            <Link
              key={c.name}
              to={`/hotels?city=${c.name.toLowerCase()}`}
              className="card-hover group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">{c.name}</h3>
                  <p className="text-xs text-muted">{c.tag}</p>
                </div>
              </div>
              <span className="rounded-full bg-background-alt px-2.5 py-1 text-xs font-medium text-muted transition-colors group-hover:bg-primary-bg group-hover:text-primary">
                {c.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="border-t border-border bg-slate-50/60 py-14">
        <div className="container-custom">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Star size={14} className="fill-primary text-primary" />
                <span>Curated Selection</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Featured Properties</h2>
              <p className="mt-1 text-sm text-muted">Experience luxury, comfort, and top-tier hospitality.</p>
            </div>
            <Link
              to="/hotels"
              className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:mt-0"
            >
              <span>Explore all stays</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <HotelSkeleton count={6} />
            ) : hotels.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <p className="font-medium text-foreground">No featured properties available.</p>
                <Link to="/hotels" className="btn-primary mt-4 h-10 px-5">
                  Browse catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.slice(0, 6).map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose StayNest */}
      <section className="container-custom py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
            <BadgeCheck size={15} />
            <span>The StayNest Standard</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-foreground">Why Book With StayNest?</h2>
          <p className="mt-2 text-sm text-muted">
            We simplify hotel discovery and booking with verified listings and dedicated support.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map((item) => (
            <div
              key={item.title}
              className="card-hover flex flex-col items-start rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <item.icon size={24} />
              </div>
              <h3 className="mt-5 text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter & Host Banner */}
      <section className="container-custom pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Plan your perfect getaway today</h2>
            <p className="mt-3 text-sm text-blue-200 sm:text-base">
              Join thousands of happy travelers booking verified stays across the world with complete confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/hotels" className="btn-primary bg-white text-blue-900 hover:bg-blue-50 px-6 py-2.5 font-bold">
                Browse All Hotels
              </Link>
              <Link to="/register" className="btn-secondary border-white/30 text-white hover:bg-white/10 px-6 py-2.5">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
