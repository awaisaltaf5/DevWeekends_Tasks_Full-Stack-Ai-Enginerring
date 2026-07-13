import { useSearchContext } from '../../contexts/SearchContext'
import WeatherWidget from '../molecules/WeatherWidget'
import MapWidget from '../molecules/MapWidget'
import ImageGallery from '../molecules/ImageGallery'
import PlacesSection from './PlacesSection'
import Heading from '../atoms/Heading'
import Button from '../atoms/Button'
import { Loader2, SearchX, ArrowLeft } from 'lucide-react'

export default function SearchResults() {
  const { searchResults, isLoading, error, searchQuery, clearSearch } = useSearchContext()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary dark:text-primary-light animate-spin mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-300">Searching for {searchQuery}...</p>
        <p className="text-sm text-gray-400 mt-2">Fetching photos, weather, hotels, and restaurants</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <SearchX className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{error}</p>
        <Button variant="outline" onClick={clearSearch}>
          <ArrowLeft className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!searchResults) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <SearchX className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-300">Enter a destination to see results</p>
      </div>
    )
  }

  const { query, images, weather, mapUrl, hotels, restaurants } = searchResults

  return (
    <div className="py-8">
      {/* Results Header */}
      <div className="container-custom mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Heading level={2}>
              Results for <span className="text-primary dark:text-primary-light">{query}</span>
            </Heading>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Showing weather, photos, hotels, restaurants, and location
            </p>
          </div>
          <Button variant="ghost" size="small" onClick={clearSearch}>
            <ArrowLeft className="w-4 h-4" />
            New Search
          </Button>
        </div>
      </div>

      {/* Top Section: Images + Weather/Map */}
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images (spans 2 columns) */}
          <div className="lg:col-span-2">
            <ImageGallery images={images} query={query} />
          </div>

          {/* Right: Weather + Map */}
          <div className="space-y-8">
            <WeatherWidget weather={weather} />
            <MapWidget location={query} mapUrl={mapUrl} />
          </div>
        </div>

        {/* Bottom Section: Hotels & Restaurants */}
        <PlacesSection 
          hotels={hotels} 
          restaurants={restaurants} 
          location={query}
        />
      </div>
    </div>
  )
}