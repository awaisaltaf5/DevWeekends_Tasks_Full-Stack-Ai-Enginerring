import { useEffect, useRef, useState } from 'react'
import { MapPin, Globe, Loader2, X } from 'lucide-react'
import { getLocationSuggestions } from '../../services/location'

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Where are you going?',
  className = '',
  inputClassName = '',
  autoFocus = false,
}) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasInteracted, setHasInteracted] = useState(false)

  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Keep internal query in sync if parent value changes externally
  useEffect(() => {
    if (value !== undefined && value !== query && !isOpen) {
      setQuery(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Debounced suggestion fetch
  useEffect(() => {
    if (!hasInteracted) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const trimmed = query.trim()
    if (!trimmed) {
      setLoading(false)
      // Show popular suggestions on focus if empty
      getLocationSuggestions('', 6).then((list) => setSuggestions(list || []))
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await getLocationSuggestions(trimmed, 6)
        setSuggestions(results || [])
      } catch (err) {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, hasInteracted])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setHasInteracted(true)
    setIsOpen(true)
    setActiveIndex(-1)
    if (onChange) onChange(val)
  }

  const handleFocus = async () => {
    setHasInteracted(true)
    setIsOpen(true)
    if (suggestions.length === 0) {
      setLoading(true)
      const initial = await getLocationSuggestions(query.trim(), 6)
      setSuggestions(initial || [])
      setLoading(false)
    }
  }

  const handleSelectSuggestion = (item) => {
    const cityName = item.city || item.name || ''
    setQuery(cityName)
    setIsOpen(false)
    setActiveIndex(-1)
    if (onChange) onChange(cityName)
    if (onSelect) onSelect(item)
  }

  const handleClear = () => {
    setQuery('')
    if (onChange) onChange('')
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault()
        handleSelectSuggestion(suggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <MapPin size={18} className="pointer-events-none absolute left-3 text-muted" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Destination location"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          autoFocus={autoFocus}
          className={`input pl-10 pr-9 ${inputClassName}`}
        />
        {loading ? (
          <Loader2 size={16} className="pointer-events-none absolute right-3 animate-spin text-primary" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded-full p-1 text-muted hover:bg-background-alt hover:text-foreground"
            aria-label="Clear location"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="animate-fade-up absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-md"
        >
          {loading && suggestions.length === 0 ? (
            <div className="flex items-center gap-2.5 px-3.5 py-4 text-sm text-muted">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span>Finding destinations...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-3.5 py-4 text-center text-sm text-muted">
              <p className="font-medium text-foreground">No destinations found</p>
              <p className="mt-0.5 text-xs">Try searching for a city, country, or region.</p>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted/70">
                {query.trim() ? 'Location Results' : 'Popular Destinations'}
              </div>
              {suggestions.map((item, idx) => {
                const isSelected = idx === activeIndex
                const mainName = item.name || item.city
                const subDetails = [item.city !== item.name ? item.city : null, item.state, item.country]
                  .filter(Boolean)
                  .join(', ')

                return (
                  <button
                    key={`${item.displayName || mainName}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-primary-bg text-primary' : 'text-foreground hover:bg-background-alt'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-primary text-white' : 'bg-background-alt text-muted'
                      }`}
                    >
                      {item.country ? <MapPin size={14} /> : <Globe size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{mainName}</p>
                      {subDetails && <p className="truncate text-xs text-muted">{subDetails}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
