// Get API key from environment variable
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error('ERROR: VITE_OPENWEATHER_API_KEY is not defined in .env file');
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

const checkApiKey = () => {
  if (!API_KEY) {
    throw new Error('API key is missing. Please check your .env file.');
  }
};

// Fetch current weather by city name
export const fetchCurrentWeather = async (city) => {
  checkApiKey();

  const response = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('City not found. Please check the spelling and try again.');
    }
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your .env file.');
    }
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
  
  return response.json();
};

// Fetch 5-day / 3-hour forecast
export const fetchForecast = async (lat, lon) => {
  checkApiKey();

  const response = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch forecast data.');
  }
  
  return response.json();
};

// Fetch weather by coordinates
export const fetchWeatherByCoords = async (lat, lon) => {
  checkApiKey();

  const response = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather for your location.');
  }
  
  return response.json();
};

// Search cities
export const searchCities = async (query) => {
  checkApiKey();

  if (!query || query.length < 2) return [];
  
  const response = await fetch(
    `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to search cities.');
  }
  
  return response.json();
};

// Reverse geocode coordinates
export const reverseGeocode = async (lat, lon) => {
  checkApiKey();

  const response = await fetch(
    `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get location name.');
  }
  
  const data = await response.json();
  
  if (!data || data.length === 0) {
    throw new Error('Location not found.');
  }
  
  return data[0];
};