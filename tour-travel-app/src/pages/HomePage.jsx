import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchContext } from '../contexts/SearchContext'
import Heading from '../components/atoms/Heading'
import Button from '../components/atoms/Button'
import DestinationGrid from '../components/organisms/DestinationGrid'
import TestimonialCarousel from '../components/organisms/TestimonialCarousel'
import { MapPin, Calendar, Users, Search, Plus, Minus, ChevronDown, AlertCircle, Globe } from 'lucide-react'
import destinationsData from '../data/destinations.json'
import testimonialsData from '../data/testimonials.json'

// Get today's date in YYYY-MM-DD format for min attribute
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Validate if date is today or future
const isValidDate = (dateString) => {
  if (!dateString) return false
  const selectedDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  selectedDate.setHours(0, 0, 0, 0)
  return selectedDate >= today
}

// Simple city validation using a free geocoding API
const validateCity = async (cityName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      const type = result.type?.toLowerCase() || ''
      const classType = result.class?.toLowerCase() || ''
      
      const validTypes = ['city', 'town', 'village', 'hamlet', 'place', 'administrative', 'boundary']
      const isValidPlace = validTypes.some(t => type.includes(t) || classType.includes(t))
      
      return {
        isValid: isValidPlace,
        displayName: result.display_name,
        lat: result.lat,
        lon: result.lon
      }
    }
    
    return { isValid: false, displayName: null }
  } catch (error) {
    console.error('Validation error:', error)
    return { isValid: true, displayName: cityName }
  }
}

export default function HomePage() {
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    guests: 2,
  })
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState({})
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const { search } = useSearchContext()
  const navigate = useNavigate()
  const guestRef = useRef(null)
  const dateRef = useRef(null)

  const todayDate = getTodayDate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setShowGuestDropdown(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Validate all fields including real place validation
  const validateFields = async () => {
    const newErrors = {}
    
    if (!searchData.destination.trim()) {
      newErrors.destination = 'Please enter a destination'
    }
    
    if (!searchData.date) {
      newErrors.date = 'Please pick a date'
    } else if (!isValidDate(searchData.date)) {
      newErrors.date = 'Please select today or a future date. Past dates are not allowed.'
    }
    
    if (!searchData.guests || searchData.guests < 1) {
      newErrors.guests = 'Please select number of guests'
    }

    // If basic fields are filled, validate if it's a real place
    if (searchData.destination.trim() && !newErrors.date && !newErrors.guests) {
      setIsValidating(true)
      const validation = await validateCity(searchData.destination.trim())
      setIsValidating(false)
      
      if (!validation.isValid) {
        newErrors.destination = `"${searchData.destination}" is not a valid place. Please enter a real city or destination.`
      }
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 4000)
      return false
    }
    
    return true
  }

  const handleSearch = async () => {
    const isValid = await validateFields()
    if (!isValid) {
      return
    }

    search(searchData.destination)
    navigate(`/search?q=${encodeURIComponent(searchData.destination)}`)
  }

  const adjustGuests = (delta) => {
    setSearchData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(20, prev.guests + delta))
    }))
    if (errors.guests) {
      setErrors(prev => ({ ...prev, guests: null }))
    }
  }

  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    
    // Check if date is valid (today or future)
    if (selectedDate && !isValidDate(selectedDate)) {
      setErrors(prev => ({ 
        ...prev, 
        date: 'Past dates are not allowed. Please select today or a future date.' 
      }))
      setSearchData(prev => ({ ...prev, date: '' }))
      setShowErrorPopup(true)
      setTimeout(() => setShowErrorPopup(false), 4000)
      return
    }
    
    setSearchData(prev => ({ ...prev, date: selectedDate }))
    setShowDatePicker(false)
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: null }))
    }
  }

  const handleDestinationChange = (e) => {
    const value = e.target.value
    setSearchData(prev => ({ ...prev, destination: value }))
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: null }))
    }
  }

  const getInputStyles = (fieldName) => {
    const baseStyles = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
    const errorStyles = errors[fieldName] 
      ? "border-2 border-red-400 focus:ring-red-300 focus:border-red-400" 
      : "border border-gray-200 dark:border-gray-600 focus:ring-primary/30 focus:border-primary dark:focus:ring-primary-light/30"
    return `${baseStyles} ${errorStyles}`
  }

  const labelStyles = "flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1"

  return (
    <div>
      {/* 
        HERO SECTION - ONLY THESE CLASSES CHANGED:
        1. min-h-screen → min-h-[100dvh] (accounts for mobile browser chrome)
        2. flex items-start pt-20 md:pt-28 → flex flex-col justify-center pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-20
        3. Added leading-tight to Heading
      */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop"
            alt="Travel background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="container-custom relative z-10 pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-20 w-full">
          <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
            {/* Added leading-tight to prevent tall line spacing on mobile */}
            <Heading level={1} className="mb-4 md:mb-6 text-white leading-tight">
              Discover Your Next{' '}
              <span className="text-primary-light">Adventure</span>
            </Heading>
            <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
              Explore breathtaking destinations, plan unforgettable journeys, and create memories that last a lifetime.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 md:p-6 border border-white/20">
              
              {/* Error Popup */}
              {showErrorPopup && Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    {Object.values(errors).map((err, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span>•</span> {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3 md:gap-2">
                
                {/* Destination */}
                <div className="flex-[1.3] min-w-0">
                  <label className={labelStyles}>
                    <MapPin className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                    Destination
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={searchData.destination}
                      onChange={handleDestinationChange}
                      className={getInputStyles('destination')}
                    />
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.destination && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.destination}
                    </p>
                  )}
                </div>

                <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 self-stretch my-2" />

                {/* Date */}
                <div className="flex-1 min-w-0 relative" ref={dateRef}>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    <Calendar className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayDate}
                      value={searchData.date}
                      onChange={(e) => {
                        setSearchData(prev => ({ ...prev, date: e.target.value }))
                        if (errors.date) {
                          setErrors(prev => ({ ...prev, date: null }))
                        }
                      }}
                      onBlur={(e) => {
                        const selectedDate = e.target.value
                        if (selectedDate && !isValidDate(selectedDate)) {
                          setErrors(prev => ({ 
                            ...prev, 
                            date: 'Please select today or a future date.' 
                          }))
                          setSearchData(prev => ({ ...prev, date: '' }))
                        }
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.date 
                          ? "border-2 border-red-400 focus:ring-red-300" 
                          : "border border-gray-200 dark:border-gray-600 focus:ring-primary/30"
                      }`}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.date && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.date}
                    </p>
                  )}
                </div>

                <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 self-stretch my-2" />

                {/* Guests */}
                <div className="flex-1 min-w-0 relative" ref={guestRef}>
                  <label className={labelStyles}>
                    <Users className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                    Guests
                  </label>
                  <button
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                    className={`${getInputStyles('guests')} flex items-center justify-between text-left`}
                  >
                    <span className={searchData.guests ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                      {searchData.guests} {searchData.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {errors.guests && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.guests}
                    </p>
                  )}

                  {showGuestDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 z-[9999]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Adults</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => adjustGuests(-1)}
                            disabled={searchData.guests <= 1}
                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">{searchData.guests}</span>
                          <button
                            onClick={() => adjustGuests(1)}
                            disabled={searchData.guests >= 20}
                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Max 20 guests per booking</p>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="md:self-end">
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleSearch}
                    disabled={isValidating}
                    className="w-full md:w-auto h-[46px] px-8"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span className="hidden md:inline">Search</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-white/70">Popular:</span>
              {['Paris', 'Bali', 'Tokyo', 'Dubai', 'London'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchData(prev => ({ ...prev, destination: city }))
                    if (errors.destination) {
                      setErrors(prev => ({ ...prev, destination: null }))
                    }
                    search(city)
                    navigate(`/search?q=${encodeURIComponent(city)}`)
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DestinationGrid
        destinations={destinationsData}
        title="Popular Destinations"
        subtitle="Explore our handpicked destinations and start planning your next adventure today"
      />

      <TestimonialCarousel
        testimonials={testimonialsData}
        title="What Travelers Say"
        subtitle="Real stories from real adventurers who explored the world with SnapTrips"
      />
    </div>
  )
}