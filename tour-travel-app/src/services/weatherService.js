import apiClient from './apiClient'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export const weatherService = {
  async getCurrentWeather(city) {
    if (!API_KEY) {
      console.warn('OpenWeather API key missing. Using fallback data.')
      return getFallbackWeather(city)
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
        },
      })

      return {
        temp: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        city: response.data.name,
        country: response.data.sys.country,
      }
    } catch (error) {
      console.error('Weather API error:', error)
      return getFallbackWeather(city)
    }
  },

  async getForecast(city) {
    if (!API_KEY) {
      return getFallbackForecast(city)
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
        },
      })

      // Get one forecast per day (API returns every 3 hours)
      const dailyForecasts = []
      const seenDates = new Set()

      for (const item of response.data.list) {
        const date = new Date(item.dt * 1000).toLocaleDateString()
        if (!seenDates.has(date) && dailyForecasts.length < 5) {
          seenDates.add(date)
          dailyForecasts.push({
            date: new Date(item.dt * 1000),
            temp: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          })
        }
      }

      return dailyForecasts
    } catch (error) {
      console.error('Forecast API error:', error)
      return getFallbackForecast(city)
    }
  },
}

// Fallback weather data
function getFallbackWeather(city) {
  return {
    temp: 22,
    feelsLike: 24,
    humidity: 65,
    windSpeed: 12,
    description: 'partly cloudy',
    icon: '02d',
    city: city,
    country: 'Unknown',
  }
}

function getFallbackForecast(city) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i + 1)
    return {
      date,
      temp: 20 + Math.floor(Math.random() * 10),
      description: 'scattered clouds',
      icon: '03d',
    }
  })
}