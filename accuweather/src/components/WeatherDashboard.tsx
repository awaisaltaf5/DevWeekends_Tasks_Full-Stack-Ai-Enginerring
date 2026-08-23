import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  CloudRain 
} from 'lucide-react';
import WeatherCard from './WeatherCard';
import WeatherDetail from './WeatherDetail';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';
import SkeletonLoader from './SkeletonLoader';
import ErrorMessage from './ErrorMessage';
import { 
  fetchCurrentWeather, 
  fetchForecast, 
  fetchWeatherByCoords,
  reverseGeocode
} from '../services/weatherApi';
import { getBackgroundImage } from '../services/backgroundService';
import { 
  msToKmh, 
  mToKm, 
  processDailyForecast, 
  processHourlyForecast,
  getCurrentDay 
} from '../utils/helpers';

function WeatherDashboard({ city, locationMode, onOpenSearch, onLocationMode }) {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bgImage, setBgImage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentDisplayCity, setCurrentDisplayCity] = useState(city);
  
  const isFirstLoad = useRef(true);
  const abortControllerRef = useRef(null);

  // Process and set weather data
  const processWeatherData = useCallback((current, forecast, cityName, countryCode) => {
    const processedWeather = {
      city: cityName,
      country: countryCode,
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      condition: current.weather[0].description,
      icon: current.weather[0].icon,
      date: getCurrentDay(),
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      windSpeed: msToKmh(current.wind.speed),
      visibility: mToKm(current.visibility || 10000),
      uvIndex: 5,
      rainChance: current.pop ? Math.round(current.pop * 100) : 0,
    };
    
    const processedHourly = processHourlyForecast(forecast.list);
    const processedDaily = processDailyForecast(forecast.list);
    
    const bg = getBackgroundImage(current.weather[0].description);
    
    setCurrentDisplayCity(cityName);
    setWeather(processedWeather);
    setHourly(processedHourly);
    setDaily(processedDaily);
    setError(null);
    
    // Preload background image
    const img = new Image();
    img.onload = () => {
      setBgImage(bg);
      setIsTransitioning(false);
      setLoading(false);
    };
    img.onerror = () => {
      setBgImage('');
      setIsTransitioning(false);
      setLoading(false);
    };
    img.src = bg;
  }, []);

  // Fetch weather by city name
  const fetchWeatherByCity = useCallback(async (cityName) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setIsTransitioning(true);
    
    try {
      const current = await fetchCurrentWeather(cityName);
      const forecast = await fetchForecast(current.coord.lat, current.coord.lon);
      
      processWeatherData(current, forecast, current.name, current.sys.country);
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsTransitioning(false);
        setLoading(false);
      }
    }
  }, [processWeatherData]);

  // Fetch weather by GPS coordinates
  const fetchWeatherByGPS = useCallback(async (latitude, longitude) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setIsTransitioning(true);
    
    try {
      // Get weather data from coordinates
      const current = await fetchWeatherByCoords(latitude, longitude);
      const forecast = await fetchForecast(latitude, longitude);
      
      // Try to get real city name from reverse geocoding
      let cityName = current.name;
      let countryCode = current.sys.country;
      
      try {
        const geoData = await reverseGeocode(latitude, longitude);
        if (geoData && geoData.name) {
          cityName = geoData.name;
        }
        if (geoData && geoData.country) {
          countryCode = geoData.country;
        }
      } catch (geoErr) {
        console.log('Using weather station name:', current.name);
      }
      
      processWeatherData(current, forecast, cityName, countryCode);
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setIsTransitioning(false);
        setLoading(false);
      }
    }
  }, [processWeatherData]);

  // Get current location using browser geolocation
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          let message = 'Unable to get your location.';
          if (err.code === 1) message = 'Location access denied. Please allow location access in your browser settings.';
          if (err.code === 2) message = 'Location information is unavailable.';
          if (err.code === 3) message = 'Location request timed out.';
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Main effect: handle location mode changes and initial load
  useEffect(() => {
    const loadWeather = async () => {
      if (locationMode === 'location') {
        // Try to get current location
        try {
          const coords = await getCurrentLocation();
          await fetchWeatherByGPS(coords.lat, coords.lon);
        } catch (err) {
          // Location failed, fallback to default city
          console.log('Location failed:', err.message);
          setError(err.message);
          fetchWeatherByCity('London');
        }
      } else {
        // Use city name
        fetchWeatherByCity(city);
      }
    };

    loadWeather();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [locationMode, city, fetchWeatherByCity, fetchWeatherByGPS, getCurrentLocation]);

  // Handle location button click
  const handleGetLocation = async () => {
    onLocationMode(); // Switch to location mode
    
    setLoading(true);
    setIsTransitioning(true);
    
    try {
      const coords = await getCurrentLocation();
      await fetchWeatherByGPS(coords.lat, coords.lon);
    } catch (err) {
      setError(err.message);
      setIsTransitioning(false);
      setLoading(false);
    }
  };

  // Build OpenWeatherMap icon URL
  const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-card/50 to-dark-bg" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  // Error state with no data
  if (error && !weather) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError(null);
            if (locationMode === 'location') {
              handleGetLocation();
            } else {
              fetchWeatherByCity(currentDisplayCity);
            }
          }} 
        />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Dynamic Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ 
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundColor: '#1a1a2e',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Content */}
      <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 transition-opacity duration-500 ${
        isTransitioning ? 'opacity-50' : 'opacity-100'
      }`}>
        
        {/* Error Banner */}
        {error && (
          <div className="glass rounded-xl p-3 flex items-center gap-3 text-rose-400 text-sm animate-fade-in">
            <CloudRain className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Main Weather Card */}
        <WeatherCard
          city={weather.city}
          country={weather.country}
          temp={weather.temp}
          feelsLike={weather.feelsLike}
          condition={weather.condition}
          iconUrl={getIconUrl(weather.icon)}
          date={weather.date}
          onOpenSearch={onOpenSearch}
          onGetLocation={handleGetLocation}
        />

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <WeatherDetail
            icon={Droplets}
            label="Humidity"
            value={weather.humidity}
            unit="%"
          />
          <WeatherDetail
            icon={Gauge}
            label="Air Pressure"
            value={weather.pressure}
            unit="hPa"
          />
          <WeatherDetail
            icon={CloudRain}
            label="Chance of Rain"
            value={weather.rainChance}
            unit="%"
          />
          <WeatherDetail
            icon={Wind}
            label="Wind Speed"
            value={weather.windSpeed}
            unit="km/h"
          />
        </div>

        {/* Hourly Forecast */}
        <HourlyForecast hourlyData={hourly} />

        {/* 5-Day Forecast */}
        <DailyForecast dailyData={daily} />

        {/* Footer */}
        <div className="text-center text-white/60 text-sm pt-8 pb-4">
          © 2026 Developed by Muhammad Awais Altaf
        </div>
      </div>
    </div>
  );
}

export default WeatherDashboard;