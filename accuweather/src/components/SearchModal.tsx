import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { searchCities } from '../services/weatherApi';

function SearchModal({ onClose, onCitySelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Get recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : ['London', 'Paris', 'Tokyo', 'New York'];
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle click outside to close
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Search cities when query changes (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const cities = await searchCities(query);
        setResults(cities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle city selection
  const handleSelectCity = (cityName) => {
    const updated = [cityName, ...recentSearches.filter(c => c !== cityName)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    onCitySelect(cityName);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md animate-slide-up"
      >
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Search Location</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city name..."
              className="w-full bg-dark-input border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-rose-400 text-sm text-center py-2">{error}</p>
          )}

          {/* Search Results */}
          {results.length > 0 && !loading && (
            <div className="mb-6 space-y-1 max-h-60 overflow-y-auto">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 px-3">
                Results
              </p>
              {results.map((city, index) => (
                <button
                  key={`${city.name}-${index}`}
                  onClick={() => handleSelectCity(city.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                >
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-white font-medium">{city.name}</p>
                    <p className="text-slate-400 text-sm">
                      {city.state ? `${city.state}, ` : ''}{city.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !loading && results.length === 0 && !error && (
            <p className="text-slate-400 text-center py-4">No cities found</p>
          )}

          {/* Recent Searches */}
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
              Recent Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectCity(city)}
                  className="px-4 py-2 rounded-full glass text-slate-300 text-sm hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SearchModal;