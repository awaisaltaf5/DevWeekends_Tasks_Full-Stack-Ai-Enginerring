import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Star, 
  TrendingUp, 
  Compass, 
  Mountain, 
  Building2, 
  Waves,
  ArrowRight,
  Heart,
  Users,
  Clock,
  Filter,
  X,
  Search,
  AlertCircle,
  Loader2,
  Globe,
  MapPinned,
  Camera,
  ExternalLink
} from 'lucide-react'
import Heading from '../components/atoms/Heading'
import Button from '../components/atoms/Button'

// Unsplash API Access Key from environment
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

// Landmark-specific search queries for iconic photos
const landmarkQueries = {
  'paris': 'Eiffel Tower Paris landmark',
  'tokyo': 'Tokyo Tower Shibuya Japan',
  'new york': 'Statue of Liberty New York skyline',
  'london': 'Big Ben London Tower Bridge',
  'dubai': 'Burj Khalifa Dubai skyline',
  'rome': 'Colosseum Rome Italy',
  'sydney': 'Sydney Opera House Harbour',
  'bali': 'Bali temple rice terrace Indonesia',
  'santorini': 'Santorini blue dome Greece',
  'maldives': 'Maldives overwater bungalow',
  'machu picchu': 'Machu Picchu Peru ruins',
  'swiss alps': 'Matterhorn Swiss Alps',
  'barcelona': 'Sagrada Familia Barcelona',
  'cairo': 'Pyramids Giza Egypt',
  'rio': 'Christ the Redeemer Rio Brazil',
  'istanbul': 'Hagia Sophia Istanbul Turkey',
  'kyoto': 'Fushimi Inari Kyoto Japan',
  'petra': 'Petra Jordan Treasury',
  'agra': 'Taj Mahal Agra India',
  'grand canyon': 'Grand Canyon USA landscape',
}

// Default destination data
const defaultDestinations = [
  {
    id: 1,
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
    rating: 4.9,
    reviews: 2847,
    price: 899,
    category: 'city',
    description: 'The City of Light awaits with its iconic Eiffel Tower, world-class museums, and charming cafés.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
    bestTime: 'Apr - Jun',
    travelers: '2.5M+',
    featured: true,
    tags: ['Romance', 'Culture', 'Food']
  },
  {
    id: 2,
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    rating: 4.8,
    reviews: 3156,
    price: 649,
    category: 'beach',
    description: 'Tropical paradise with stunning temples, rice terraces, and pristine beaches.',
    highlights: ['Uluwatu Temple', 'Tegallalang Rice Terrace', 'Seminyak Beach'],
    bestTime: 'May - Sep',
    travelers: '1.8M+',
    featured: true,
    tags: ['Nature', 'Relaxation', 'Spiritual']
  },
  {
    id: 3,
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    rating: 4.9,
    reviews: 1923,
    price: 1099,
    category: 'city',
    description: 'Where ancient traditions meet futuristic innovation in a dazzling urban landscape.',
    highlights: ['Senso-ji Temple', 'Shibuya Crossing', 'Mount Fuji Day Trip'],
    bestTime: 'Mar - May',
    travelers: '3.2M+',
    featured: false,
    tags: ['Culture', 'Food', 'Shopping']
  },
  {
    id: 4,
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=800&h=600&fit=crop',
    rating: 4.9,
    reviews: 2156,
    price: 1199,
    category: 'beach',
    description: 'Whitewashed buildings, blue-domed churches, and breathtaking sunsets over the Aegean.',
    highlights: ['Oia Sunset', 'Red Beach', 'Wine Tasting'],
    bestTime: 'Jun - Sep',
    travelers: '900K+',
    featured: true,
    tags: ['Romance', 'Views', 'Luxury']
  },
  {
    id: 5,
    name: 'Swiss Alps',
    country: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
    rating: 4.8,
    reviews: 1456,
    price: 1299,
    category: 'mountain',
    description: 'Majestic peaks, crystal-clear lakes, and charming alpine villages await adventurers.',
    highlights: ['Matterhorn', 'Lake Geneva', 'Glacier Express'],
    bestTime: 'Jun - Sep',
    travelers: '1.5M+',
    featured: false,
    tags: ['Adventure', 'Nature', 'Skiing']
  },
  {
    id: 6,
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    rating: 4.7,
    reviews: 3421,
    price: 799,
    category: 'city',
    description: 'A dazzling metropolis of skyscrapers, luxury shopping, and desert adventures.',
    highlights: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall'],
    bestTime: 'Nov - Mar',
    travelers: '4.1M+',
    featured: false,
    tags: ['Luxury', 'Shopping', 'Adventure']
  },
  {
    id: 7,
    name: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
    rating: 4.9,
    reviews: 1876,
    price: 1599,
    category: 'beach',
    description: 'Crystal-clear waters, overwater villas, and untouched coral reefs in paradise.',
    highlights: ['Overwater Bungalow', 'Snorkeling', 'Bioluminescent Beach'],
    bestTime: 'Nov - Apr',
    travelers: '600K+',
    featured: true,
    tags: ['Luxury', 'Relaxation', 'Diving']
  },
  {
    id: 8,
    name: 'Machu Picchu',
    country: 'Peru',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
    rating: 4.9,
    reviews: 2234,
    price: 1399,
    category: 'mountain',
    description: 'Ancient Incan citadel set high in the Andes Mountains, a bucket-list wonder.',
    highlights: ['Inca Trail', 'Sun Gate', 'Sacred Valley'],
    bestTime: 'May - Oct',
    travelers: '1.2M+',
    featured: false,
    tags: ['History', 'Adventure', 'Hiking']
  },
  {
    id: 9,
    name: 'New York City',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    rating: 4.7,
    reviews: 4521,
    price: 999,
    category: 'city',
    description: 'The city that never sleeps, from Broadway to Central Park and everything between.',
    highlights: ['Central Park', 'Times Square', 'Statue of Liberty'],
    bestTime: 'Apr - Jun',
    travelers: '5.8M+',
    featured: false,
    tags: ['Culture', 'Food', 'Nightlife']
  }
]

const categories = [
  { id: 'all', name: 'All Destinations', icon: Compass },
  { id: 'city', name: 'City Escapes', icon: Building2 },
  { id: 'beach', name: 'Beach & Island', icon: Waves },
  { id: 'mountain', name: 'Mountains & Nature', icon: Mountain },
  { id: 'trending', name: 'Trending Now', icon: TrendingUp },
]

const sortOptions = [
  { id: 'popular', name: 'Most Popular' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
]

const fallbackImages = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
]

const getFallbackImage = () => fallbackImages[Math.floor(Math.random() * fallbackImages.length)]

const getLandmarkQuery = (locationName) => {
  const normalized = locationName.toLowerCase().trim()
  if (landmarkQueries[normalized]) return landmarkQueries[normalized]
  for (const [key, query] of Object.entries(landmarkQueries)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return query
    }
  }
  return `${locationName} iconic landmark famous place`
}

const validateLocation = async (query) => {
  if (!query.trim() || query.trim().length < 2) return { isValid: false, data: null }
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en`,
      { headers: { 'User-Agent': 'SnapTrips/1.0' } }
    )
    
    if (!response.ok) throw new Error('API error')
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      const type = (result.type || '').toLowerCase()
      const classType = (result.class || '').toLowerCase()
      const displayName = result.display_name || ''
      
      const validTypes = ['city', 'town', 'village', 'hamlet', 'place', 'administrative', 'boundary', 'county', 'region', 'country', 'island', 'archipelago']
      const isValidPlace = validTypes.some(t => type.includes(t) || classType.includes(t))
      
      const parts = displayName.split(',')
      const country = parts[parts.length - 1]?.trim() || 'Unknown'
      
      return {
        isValid: isValidPlace,
        data: {
          name: result.name || query,
          country: country,
          lat: result.lat,
          lon: result.lon,
          displayName: result.display_name
        }
      }
    }
    
    return { isValid: false, data: null }
  } catch (error) {
    console.error('Validation error:', error)
    return { isValid: true, data: null, uncertain: true }
  }
}

const fetchIconicPhotos = async (locationName, count = 6) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured. Using fallback images.')
    return Array(count).fill(null).map(() => ({ url: getFallbackImage(), photographer: 'Unknown', attribution: '#' }))
  }
  
  const searchQuery = getLandmarkQuery(locationName)
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    )
    
    if (!response.ok) throw new Error(`Unsplash API error: ${response.status}`)
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results.map(photo => ({
        url: photo.urls.regular + '&w=800&h=600&fit=crop',
        fullUrl: photo.urls.full,
        thumb: photo.urls.small,
        photographer: photo.user?.name || 'Unknown',
        photographerUrl: photo.user?.links?.html || '#',
        attribution: photo.links?.html || '#',
        description: photo.description || photo.alt_description || `${locationName} landmark`,
        likes: photo.likes || 0
      }))
    }
    
    return Array(count).fill(null).map(() => ({ 
      url: getFallbackImage(), 
      photographer: 'Unknown', 
      attribution: '#' 
    }))
  } catch (error) {
    console.error('Unsplash fetch error:', error)
    return Array(count).fill(null).map(() => ({ 
      url: getFallbackImage(), 
      photographer: 'Unknown', 
      attribution: '#' 
    }))
  }
}

const generatePrice = () => Math.floor(750 + Math.random() * 800)
const generateRating = () => (4.5 + Math.random() * 0.5).toFixed(1)

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [favorites, setFavorites] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchedLocation, setSearchedLocation] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [locationPhotos, setLocationPhotos] = useState([])
  const searchTimeoutRef = useRef(null)

  // ==================== AUTO-SCROLL FUNCTIONALITY ====================
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const autoScrollRef = useRef(null)
  const resumeTimeoutRef = useRef(null)
  const scrollSpeed = 0.8 // pixels per frame (slow speed)

  // Start auto-scroll on mount
  useEffect(() => {
    const startAutoScroll = () => {
      if (!isAutoScrolling) return
      
      autoScrollRef.current = requestAnimationFrame(() => {
        if (window.scrollY < document.body.scrollHeight - window.innerHeight - 100) {
          window.scrollBy(0, scrollSpeed)
        } else {
          // Reached bottom, stop
          setIsAutoScrolling(false)
        }
        startAutoScroll()
      })
    }

    startAutoScroll()

    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current)
    }
  }, [isAutoScrolling])

  // Pause auto-scroll on user interaction
  const pauseAutoScroll = useCallback(() => {
    setIsAutoScrolling(false)
    
    // Clear existing resume timeout
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    
    // Resume after 5 seconds
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoScrolling(true)
    }, 5000)
  }, [])

  // Event listeners for user interaction
  useEffect(() => {
    const handleInteraction = () => pauseAutoScroll()
    
    // Pause on: scroll (manual), click, touch, keypress, mousewheel
    window.addEventListener('wheel', handleInteraction, { passive: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true })
    window.addEventListener('keydown', handleInteraction)
    document.addEventListener('click', handleInteraction)

    return () => {
      window.removeEventListener('wheel', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('click', handleInteraction)
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [pauseAutoScroll])
  // ==================================================================

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value)
    setSearchError('')
    pauseAutoScroll() // Pause on search interaction
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    
    if (!value.trim()) {
      setSearchedLocation(null)
      setSearchResults([])
      setLocationPhotos([])
      return
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      if (value.trim().length < 2) return
      
      setIsSearching(true)
      setIsLoadingImages(true)
      
      try {
        const validation = await validateLocation(value)
        
        if (!validation.isValid) {
          setSearchError(`"${value}" is not a valid location. Please enter a real city, country, or destination name.`)
          setSearchedLocation(null)
          setSearchResults([])
          setLocationPhotos([])
          setIsSearching(false)
          setIsLoadingImages(false)
          return
        }
        
        setSearchError('')
        const locationData = validation.data
        const searchTerm = locationData.name
        
        const photos = await fetchIconicPhotos(searchTerm, 6)
        setLocationPhotos(photos)
        
        const mainPhoto = photos[0] || { url: getFallbackImage(), photographer: 'Unknown' }
        
        const newDestination = {
          id: `search-${Date.now()}`,
          name: locationData.name,
          country: locationData.country,
          image: mainPhoto.url,
          rating: parseFloat(generateRating()),
          reviews: Math.floor(Math.random() * 3000) + 500,
          price: generatePrice(),
          category: 'city',
          description: `Discover ${locationData.name}, a beautiful destination in ${locationData.country}. Explore its iconic landmarks, unique culture, and hidden gems.`,
          highlights: ['Iconic Landmarks', 'Local Culture', 'Must-See Sights'],
          bestTime: 'Year Round',
          travelers: '500K+',
          featured: false,
          tags: ['Culture', 'Adventure', 'Discovery'],
          isSearchResult: true,
          lat: locationData.lat,
          lon: locationData.lon,
          photos: photos
        }
        
        setSearchedLocation(newDestination)
        setSearchResults([newDestination])
        
      } catch (error) {
        console.error('Search error:', error)
        setSearchError('Something went wrong. Please try again.')
      } finally {
        setIsSearching(false)
        setIsLoadingImages(false)
      }
    }, 800)
  }, [pauseAutoScroll])

  const clearSearch = () => {
    setSearchQuery('')
    setSearchError('')
    setSearchedLocation(null)
    setSearchResults([])
    setLocationPhotos([])
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    pauseAutoScroll()
  }

  const displayDestinations = useMemo(() => {
    if (searchResults.length > 0) return searchResults
    
    let result = [...defaultDestinations]
    
    if (activeCategory === 'trending') {
      result = result.filter(d => d.featured)
    } else if (activeCategory !== 'all') {
      result = result.filter(d => d.category === activeCategory)
    }
    
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      default:
        result.sort((a, b) => b.reviews - a.reviews)
    }
    
    return result
  }, [searchResults, activeCategory, sortBy])

  const featuredDestinations = defaultDestinations.filter(d => d.featured).slice(0, 3)

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current)
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=800&fit=crop"
            alt="Destinations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="container-custom relative z-10 pt-24 md:pt-32 pb-12 md:pb-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-primary-light" />
              <span className="text-sm font-medium text-primary-light uppercase tracking-wider">Explore the World</span>
            </div>
            <Heading level={1} className="text-white mb-4 text-3xl md:text-5xl lg:text-6xl">
              Find Your Perfect{' '}
              <span className="text-primary-light">Destination</span>
            </Heading>
            <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
              Search any city or landmark. We fetch iconic photos from Unsplash photographers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-8 md:py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search city, landmark, or destination..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 rounded-xl text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none transition-all ${
                    searchError 
                      ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30' 
                      : searchedLocation 
                        ? 'border-green-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/30'
                        : 'border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-light focus:ring-4 focus:ring-primary/10'
                  }`}
                />
                {(isSearching || isLoadingImages) && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                )}
                {!isSearching && !isLoadingImages && searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="mt-3 min-h-[1.5rem]">
                {searchError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
                {searchedLocation && !searchError && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm animate-fade-in">
                    <MapPinned className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Found: <strong>{searchedLocation.name}</strong>, {searchedLocation.country} 
                      {' — '}
                      <Camera className="w-3 h-3 inline mx-1" />
                      {locationPhotos.length} iconic photos loaded
                    </span>
                  </div>
                )}
                {(isSearching || isLoadingImages) && !searchError && !searchedLocation && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isLoadingImages ? 'Fetching iconic photos...' : 'Validating location...'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Iconic Photo Gallery */}
      {searchedLocation && locationPhotos.length > 0 && (
        <section className="bg-gray-100 dark:bg-gray-950 py-8 md:py-12 border-b border-gray-200 dark:border-gray-800">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Heading level={2} className="text-xl md:text-2xl mb-1">
                  Iconic Photos of {searchedLocation.name}
                </Heading>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real photos from Unsplash photographers
                </p>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-4 aspect-[21/9]">
              <img
                src={locationPhotos[0].url}
                alt={`${searchedLocation.name} iconic view`}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{searchedLocation.name}</h3>
                  <p className="text-white/80 text-sm">{locationPhotos[0].description}</p>
                </div>
                <a 
                  href={locationPhotos[0].attribution} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white/80 text-xs hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
                >
                  <Camera className="w-3 h-3" />
                  Photo by {locationPhotos[0].photographer}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {locationPhotos.slice(1, 6).map((photo, index) => (
                <div 
                  key={index} 
                  className="relative rounded-xl overflow-hidden shadow-md group aspect-[4/3]"
                >
                  <img
                    src={photo.url}
                    alt={`${searchedLocation.name} photo ${index + 2}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <a 
                    href={photo.attribution}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <span className="text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {photo.photographer}
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Destinations */}
      {!searchedLocation && (
        <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-16 border-b border-gray-200 dark:border-gray-800">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Heading level={2} className="text-xl md:text-2xl mb-1">Featured This Month</Heading>
                <p className="text-sm text-gray-500 dark:text-gray-400">Handpicked by our travel experts</p>
              </div>
              <Link to="/packages" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary dark:text-primary-light hover:underline">
                View All Packages <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDestinations.map((dest) => (
                <div key={dest.id} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-medium">{dest.rating}</span>
                      <span className="text-white/60 text-xs">({dest.reviews.toLocaleString()})</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{dest.name}</h3>
                    <p className="text-white/80 text-sm mb-3">{dest.country}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-light font-bold text-lg">${dest.price}</span>
                      <span className="text-white/60 text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">{dest.bestTime}</span>
                    </div>
                  </div>
                  {dest.featured && (
                    <div className="absolute top-4 left-4 bg-primary-light text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Destinations Grid */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Heading level={2} className="text-xl md:text-2xl mb-1">
                {searchedLocation ? 'Search Results' : 'All Destinations'}
              </Heading>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchedLocation 
                  ? `Showing results for "${searchQuery}"` 
                  : `${displayDestinations.length} destinations available`
                }
              </p>
            </div>
            
            {!searchedLocation && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!searchedLocation && (
            <div className={`flex flex-wrap gap-2 mb-8 ${showFilters ? 'block' : 'hidden md:flex'}`}>
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id)
                      setShowFilters(false)
                      pauseAutoScroll()
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}

          {displayDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayDestinations.map((dest) => (
                <div 
                  key={dest.id} 
                  className={`group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    dest.isSearchResult ? 'ring-2 ring-primary/20 dark:ring-primary-light/20' : ''
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {isLoadingImages && dest.isSearchResult ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : (
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getFallbackImage()
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <button
                      onClick={() => toggleFavorite(dest.id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(dest.id) ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-300'}`} 
                      />
                    </button>

                    {dest.isSearchResult && (
                      <div className="absolute top-3 left-3 bg-primary-light text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Live Result
                      </div>
                    )}
                    
                    {!dest.isSearchResult && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 dark:text-gray-200 capitalize">
                          {dest.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                          {dest.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {dest.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{dest.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {dest.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {dest.highlights.slice(0, 2).map((highlight) => (
                        <span 
                          key={highlight} 
                          className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md"
                        >
                          {highlight}
                        </span>
                      ))}
                      {dest.highlights.length > 2 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-1">
                          +{dest.highlights.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {dest.bestTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {dest.travelers}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">from</span>
                        <div className="text-2xl font-bold text-primary dark:text-primary-light">
                          ${dest.price}
                        </div>
                      </div>
                      <Link to={`/packages?destination=${dest.name}`}>
                        <Button variant="primary" size="small">
                          Explore
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Compass className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No destinations found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
              <Button 
                variant="outline" 
                onClick={() => { clearSearch(); setActiveCategory('all'); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Travel Inspiration Banner */}
      <section className="py-16 md:py-20 bg-primary dark:bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Heading level={2} className="text-white mb-4 text-2xl md:text-3xl">
              Not Sure Where to Go?
            </Heading>
            <p className="text-white/80 mb-8 leading-relaxed">
              Let our travel experts help you plan the perfect trip. Browse our curated packages or get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/packages">
                <Button variant="secondary" size="large">
                  View All Packages
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="outline" 
                  size="large" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Contact Experts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}