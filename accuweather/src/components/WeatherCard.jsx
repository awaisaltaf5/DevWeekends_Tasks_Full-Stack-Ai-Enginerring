import { MapPin, Navigation } from 'lucide-react';

function WeatherCard({ 
  city, 
  country, 
  temp, 
  feelsLike, 
  condition, 
  iconUrl, 
  date,
  onOpenSearch,
  onGetLocation 
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8 animate-fade-in">
      
      {/* Top bar: Location button + Day + Search button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onGetLocation}
          className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
          title="Use current location"
        >
          <Navigation className="w-5 h-5 text-white" />
        </button>
        
        <p className="text-white font-medium">{date}</p>
        
        <button
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
          title="Search city"
        >
          <MapPin className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Weather Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        
        {/* Left: Icon + Condition */}
        <div className="flex items-center gap-4">
          {iconUrl && (
            <img 
              src={iconUrl} 
              alt={condition}
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          )}
          <div>
            <p className="text-xl sm:text-2xl font-semibold text-white capitalize">
              {condition}
            </p>
            <p className="text-slate-400 text-sm sm:text-base">
              {city}, {country}
            </p>
          </div>
        </div>

        {/* Right: Temperature */}
        <div className="sm:ml-auto">
          <div className="flex items-start">
            <span className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tighter">
              {Math.round(temp)}
            </span>
            <span className="text-2xl sm:text-3xl text-white mt-2">°C</span>
          </div>
        </div>
      </div>

      {/* Feels Like */}
      <p className="text-slate-400 mt-4 text-sm sm:text-base">
        Feels like {Math.round(feelsLike)}°C
      </p>

      {/* Change Location Button */}
      <button
        onClick={onOpenSearch}
        className="mt-6 flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        Change Location
      </button>
    </div>
  );
}

export default WeatherCard;