import { useState, useEffect } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import useDebounce from '../../hooks/useDebounce.js'

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const [showRecent, setShowRecent] = useState(false)
  const recentSearches = useSelector((state) => state.search.recentSearches)
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
      setShowRecent(false)
    }
  }

  const handleRecentClick = (term) => {
    setQuery(term)
    onSearch(term)
    setShowRecent(false)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search repositories (e.g., react, python, machine learning)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={Search}
              onFocus={() => setShowRecent(true)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="hidden sm:flex">
            Search
          </Button>
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">Recent searches</p>
            {recentSearches.slice(0, 5).map((term, index) => (
              <button
                key={index}
                onClick={() => handleRecentClick(term)}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-left"
              >
                <Clock className="w-4 h-4 text-gray-400" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar