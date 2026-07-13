import { useState, useCallback } from 'react'
import { unsplashService } from '../services/unsplashService'
import { weatherService } from '../services/weatherService'
import { mapService } from '../services/mapService'
import { placesService } from '../services/placesService'

export function useSearch() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setError('Please enter a destination')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [images, currentWeather, forecast, hotels, restaurants] = await Promise.all([
        unsplashService.searchPhotos(query),
        weatherService.getCurrentWeather(query),
        weatherService.getForecast(query),
        placesService.getHotels(query),
        placesService.getRestaurants(query),
      ])

      setResults({
        query,
        images,
        weather: {
          current: currentWeather,
          forecast,
        },
        hotels,
        restaurants,
        mapUrl: mapService.getEmbedUrl(query),
        timestamp: Date.now(),
      })
    } catch (err) {
      setError('Failed to fetch search results. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    results,
    isLoading,
    error,
    performSearch,
    clearResults,
  }
}