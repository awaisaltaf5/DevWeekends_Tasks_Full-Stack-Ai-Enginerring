// Use Unsplash API to get real images for hotels and restaurants
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

async function getPlaceImage(query, fallbackImages, index) {
  // If no API key, use fallback
  if (!UNSPLASH_ACCESS_KEY) {
    return fallbackImages[index % fallbackImages.length]
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular
    }
    
    return fallbackImages[index % fallbackImages.length]
  } catch (error) {
    return fallbackImages[index % fallbackImages.length]
  }
}

export const placesService = {
  async getHotels(location) {
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      )
      const geoData = await geoResponse.json()
      
      if (!geoData || geoData.length === 0) {
        return getFallbackHotels(location)
      }

      const { lat, lon } = geoData[0]
      
      const overpassQuery = `
        [out:json];
        (
          node["tourism"="hotel"](around:5000,${lat},${lon});
          way["tourism"="hotel"](around:5000,${lat},${lon});
          node["tourism"="guest_house"](around:5000,${lat},${lon});
          node["tourism"="hostel"](around:5000,${lat},${lon});
        );
        out center 10;
      `
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      })
      
      const data = await response.json()
      
      if (!data.elements || data.elements.length === 0) {
        return getFallbackHotels(location)
      }

      const hotels = data.elements.slice(0, 6).map((el, i) => ({
        id: el.id || `hotel-${i}`,
        name: el.tags?.name || `Hotel ${i + 1}`,
        rating: (3 + Math.random() * 2).toFixed(1),
        price: Math.floor(50 + Math.random() * 300),
        image: null, // Will be fetched
        address: el.tags?.['addr:street'] || 'Central Location',
        distance: (Math.random() * 3).toFixed(1) + ' km'
      }))

      // Fetch real images for each hotel
      const hotelImages = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop',
      ]

      // Fetch real images in parallel
      const imagePromises = hotels.map((hotel, i) => 
        getPlaceImage(`${hotel.name} hotel ${location}`, hotelImages, i)
      )
      
      const images = await Promise.all(imagePromises)
      
      return hotels.map((hotel, i) => ({
        ...hotel,
        image: images[i]
      }))
    } catch (error) {
      console.error('Hotels API error:', error)
      return getFallbackHotels(location)
    }
  },

  async getRestaurants(location) {
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      )
      const geoData = await geoResponse.json()
      
      if (!geoData || geoData.length === 0) {
        return getFallbackRestaurants(location)
      }

      const { lat, lon } = geoData[0]
      
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="restaurant"](around:5000,${lat},${lon});
          way["amenity"="restaurant"](around:5000,${lat},${lon});
          node["amenity"="cafe"](around:5000,${lat},${lon});
          node["amenity"="fast_food"](around:5000,${lat},${lon});
        );
        out center 10;
      `
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      })
      
      const data = await response.json()
      
      if (!data.elements || data.elements.length === 0) {
        return getFallbackRestaurants(location)
      }

      const restaurants = data.elements.slice(0, 6).map((el, i) => ({
        id: el.id || `rest-${i}`,
        name: el.tags?.name || `Restaurant ${i + 1}`,
        cuisine: el.tags?.cuisine || 'International',
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        priceLevel: ['$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 4)],
        image: null, // Will be fetched
        address: el.tags?.['addr:street'] || 'City Center',
        distance: (Math.random() * 3).toFixed(1) + ' km'
      }))

      // Fetch real images for each restaurant
      const restaurantImages = [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      ]

      // Fetch real images in parallel
      const imagePromises = restaurants.map((rest, i) => 
        getPlaceImage(`${rest.name} restaurant ${location} food`, restaurantImages, i)
      )
      
      const images = await Promise.all(imagePromises)
      
      return restaurants.map((rest, i) => ({
        ...rest,
        image: images[i]
      }))
    } catch (error) {
      console.error('Restaurants API error:', error)
      return getFallbackRestaurants(location)
    }
  }
}

// Fallback data when API fails
function getFallbackHotels(location) {
  return [
    { id: 1, name: `Grand ${location} Hotel`, rating: 4.8, price: 199, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', address: 'City Center', distance: '0.5 km' },
    { id: 2, name: `${location} Palace`, rating: 4.5, price: 149, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop', address: 'Downtown', distance: '1.2 km' },
    { id: 3, name: 'Royal Suites', rating: 4.7, price: 259, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop', address: 'Waterfront', distance: '2.1 km' },
    { id: 4, name: 'City View Inn', rating: 4.2, price: 89, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop', address: 'Old Town', distance: '0.8 km' },
    { id: 5, name: 'Luxury Resort & Spa', rating: 4.9, price: 399, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop', address: 'Beachfront', distance: '3.5 km' },
    { id: 6, name: 'Budget Stay', rating: 3.8, price: 49, image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop', address: 'Station Road', distance: '1.5 km' },
  ]
}

function getFallbackRestaurants(location) {
  return [
    { id: 1, name: `${location} Bistro`, cuisine: 'French', rating: 4.6, priceLevel: '$$$', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', address: 'Main Street', distance: '0.3 km' },
    { id: 2, name: 'Spice Garden', cuisine: 'Indian', rating: 4.4, priceLevel: '$$', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop', address: 'Market Square', distance: '0.7 km' },
    { id: 3, name: 'Ocean Catch', cuisine: 'Seafood', rating: 4.7, priceLevel: '$$$$', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop', address: 'Harbor View', distance: '1.8 km' },
    { id: 4, name: 'Pasta House', cuisine: 'Italian', rating: 4.3, priceLevel: '$$', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop', address: 'Old Quarter', distance: '0.9 km' },
    { id: 5, name: 'Sushi Master', cuisine: 'Japanese', rating: 4.8, priceLevel: '$$$', image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400&h=300&fit=crop', address: 'East Side', distance: '2.2 km' },
    { id: 6, name: 'Street Food Corner', cuisine: 'Local', rating: 4.1, priceLevel: '$', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', address: 'Night Market', distance: '1.1 km' },
  ]
}