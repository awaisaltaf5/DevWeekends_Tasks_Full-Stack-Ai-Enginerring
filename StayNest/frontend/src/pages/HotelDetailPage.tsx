import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MapPin, Heart, CalendarCheck, BadgeCheck, Check } from 'lucide-react'
import { fetchHotelById } from '../features/hotels/hotelSlice'
import { fetchSaved } from '../features/saved/savedSlice'
import { capitalize, formatPrice } from '../services/location'
import Button from '../components/ui/Button'
import BookingForm from '../components/bookings/BookingForm'
import Star from '../components/ui/StarRating'
import ReviewsSection from '../components/reviews/ReviewsSection'
import UnsplashImage from '../components/ui/UnsplashImage'
import useSaved from '../hooks/useSaved'

export default function HotelDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { hotel, detailLoading, error } = useSelector((s) => s.hotels)
  const [activeImage, setActiveImage] = useState(0)
  const [showBooking, setShowBooking] = useState(false)
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { isSaved, isSaving, toggleSave } = useSaved()

  useEffect(() => {
    dispatch(fetchHotelById(id))
    setActiveImage(0)
  }, [dispatch, id])

  // Keep the save button in sync with the user's saved list.
  useEffect(() => {
    if (token) dispatch(fetchSaved())
  }, [dispatch, token])

  const saved = isSaved(id)

  const handleSave = () => toggleSave(id)

  const handleBookNow = () => {
    if (!token) {
      navigate('/login', { state: { from: `/hotels/${id}` } })
      return
    }
    setShowBooking(true)
  }

  if (detailLoading) {
    return (
      <div className="container-custom py-12">
        <div className="h-72 w-full animate-pulse rounded-xl bg-background-alt" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded bg-background-alt" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-background-alt" />
            <div className="h-24 w-full animate-pulse rounded bg-background-alt" />
          </div>
          <div className="h-48 animate-pulse rounded-2xl bg-background-alt" />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="container-custom py-12 text-center text-muted">{error}</div>
  }

  if (!hotel) return null

  const images = (hotel.images?.length ? hotel.images : [hotel.thumbnail]).filter(Boolean)
  const mainImage = images[activeImage] || hotel.thumbnail

  return (
    <div className="container-custom py-8">
      <Link to="/hotels" className="text-sm text-muted hover:text-foreground">
        Back to hotels
      </Link>

      {/* Image gallery */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="lg:col-span-3 overflow-hidden rounded-xl bg-background-alt">
          <UnsplashImage
            src={mainImage}
            query={hotel.name}
            alt={hotel.name}
            className="aspect-[16/9] w-full object-cover transition-opacity duration-500"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {images.slice(0, 3).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === activeImage}
              className={`overflow-hidden rounded-xl transition ${
                i === activeImage
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-70 hover:opacity-100 focus-visible:opacity-100'
              }`}
            >
              <UnsplashImage
                src={src}
                query={hotel.name}
                alt=""
                className="aspect-video w-full object-cover lg:aspect-[4/3]"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title + booking */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-foreground">{hotel.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted">
            <MapPin size={16} /> {capitalize(hotel.city)}, {hotel.country}
          </p>
          <p className="mt-2 flex items-center gap-1 text-foreground">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span className="font-medium">{hotel.rating || 'New'}</span>
            <span className="text-muted">({hotel.reviewCount} reviews)</span>
          </p>
          <p className="mt-4 leading-relaxed text-muted">{hotel.description}</p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Amenities</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(hotel.amenities || []).map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-muted">
                <Check size={16} className="text-primary" /> {a}
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-5 shadow-md lg:sticky lg:top-20">
          <p className="text-2xl font-bold text-primary">{formatPrice(hotel.pricePerNight)}</p>
          <p className="text-xs text-muted">per night</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-bg px-3 py-2 text-sm text-primary">
            <CalendarCheck size={16} /> Available now
          </div>
          <div className="mt-4 space-y-3">
                                   <Button className="w-full" onClick={handleBookNow}>Book Now</Button>
            <Button variant="secondary" className="w-full" onClick={handleSave} disabled={isSaving(id)}>
              <Heart size={16} className={saved ? 'mr-1 fill-red-500 text-red-500' : 'mr-1'} />
              {saved ? 'Saved' : 'Save Hotel'}
            </Button>
          </div>
        </div>
      </div>

      {/* Room options */}
      {hotel.roomTypes?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">Room options</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {hotel.roomTypes.map((rt) => (
              <div key={rt} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-primary" />
                  <span className="font-medium text-foreground">{rt}</span>
                </div>
                <span className="text-sm text-primary">{formatPrice(hotel.pricePerNight)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest reviews */}
      <ReviewsSection hotelId={hotel.id} />

      {showBooking && <BookingForm hotel={hotel} onClose={() => setShowBooking(false)} />}
    </div>
  )
}

