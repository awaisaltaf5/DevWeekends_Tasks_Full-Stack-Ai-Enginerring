import apiClient from './apiClient'

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const BASE_URL = 'https://api.unsplash.com'

export const unsplashService = {
  async searchPhotos(query, perPage = 8) {
    // If no API key, return fallback images
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key missing. Using fallback images.')
      return getFallbackImages(query)
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/search/photos`, {
        params: {
          query: `${query} travel destination`,
          per_page: perPage,
          orientation: 'landscape',
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      })

      return response.data.results.map((photo) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.small,
        alt: photo.alt_description || `${query} travel photo`,
        author: photo.user.name,
        authorUrl: photo.user.links.html,
      }))
    } catch (error) {
      console.error('Unsplash API error:', error)
      return getFallbackImages(query)
    }
  },
}

// Fallback images when API fails or key is missing
function getFallbackImages(query) {
  const fallbacks = [
    `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop&q=80`,
    `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80`,
    `https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&h=600&fit=crop&q=80`,
    `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&q=80`,
    `https://images.unsplash.com/photo-1499678329328-0124a29abdbe?w=800&h=600&fit=crop&q=80`,
    `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop&q=80`,
  ]

  return fallbacks.map((url, i) => ({
    id: `fallback-${i}`,
    url,
    thumb: url,
    alt: `${query} travel photo`,
    author: 'Unsplash',
    authorUrl: 'https://unsplash.com',
  }))
}