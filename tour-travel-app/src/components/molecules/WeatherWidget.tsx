import { Droplets, Wind, Thermometer, Cloud, Sun } from 'lucide-react'

export default function WeatherWidget({ weather }) {
  const { current, forecast } = weather

  const getWeatherIcon = (iconCode) => {
    // Simple mapping - in production use actual weather icons
    if (iconCode?.includes('01') || iconCode?.includes('02')) return <Sun className="w-12 h-12 text-amber-400" />
    return <Cloud className="w-12 h-12 text-gray-400" />
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-primary dark:text-primary-light" />
        Weather
      </h3>

      {/* Current Weather */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-primary-bg dark:bg-primary/10 rounded-xl">
        {getWeatherIcon(current.icon)}
        <div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {current.temp}°C
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
            {current.description}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Feels like {current.feelsLike}°C
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span>Humidity: {current.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Wind className="w-4 h-4 text-teal-500" />
          <span>Wind: {current.windSpeed} m/s</span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">5-Day Forecast</h4>
        <div className="space-y-2">
          {forecast.map((day, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                {i === 0 ? 'Tomorrow' : formatDate(day.date)}
              </span>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {day.temp}°C
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize hidden sm:block">
                {day.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}