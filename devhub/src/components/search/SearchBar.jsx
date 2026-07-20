import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, ArrowUpDown } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setQuery, addRecentSearch } from '../../store/slices/searchSlice.js'
import Input from '../ui/Input.jsx'
import useDebounce from '../../hooks/useDebounce.js'

function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQueryLocal] = useState(initialValue)
  const [showRecent, setShowRecent] = useState(false)
  const recentSearches = useSelector((state) => state.search.recentSearches)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const dispatch = useDispatch()

  const debouncedQuery = useDebounce(query, 500)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowRecent(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Trigger search when debounced query changes (only if user is typing, not on initial load)
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery !== initialValue) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch, initialValue])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      dispatch(addRecentSearch(query))
      onSearch(query)
      setShowRecent(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setQueryLocal(value)
    dispatch(setQuery(value))
  }

  const handleRecentClick = (term) => {
    setQueryLocal(term)
    dispatch(setQuery(term))
    onSearch(term)
    setShowRecent(false)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setQueryLocal('')
    dispatch(setQuery(''))
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search repositories (e.g., react, python, machine learning)..."
              value={query}
              onChange={handleChange}
              icon={Search}
              onFocus={() => setShowRecent(true)}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-medium flex-shrink-0 shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 text-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-black/5 dark:shadow-black/20 z-50 animate-slideDown overflow-hidden"
        >
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5 font-medium">Recent searches</p>
            {recentSearches.slice(0, 5).map((term, index) => (
              <button
                key={index}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleRecentClick(term)}
                className="w-full flex items-center gap-2.5 px-2 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg text-left transition-colors"
              >
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar