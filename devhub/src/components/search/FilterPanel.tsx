import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SlidersHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react'
import { setFilter, resetFilters } from '../../store/slices/searchSlice.js'

const languages = ['All', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP']
const sortOptions = [
  { value: 'stars', label: 'Most Stars' },
  { value: 'forks', label: 'Most Forks' },
  { value: 'updated', label: 'Recently Updated' },
]

function FilterPanel({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const filters = useSelector((state) => state.search.filters)
  const dispatch = useDispatch()

  const handleLanguageChange = (lang) => {
    const newLang = lang === 'All' ? '' : lang
    const newFilters = { ...filters, language: newLang }
    dispatch(setFilter({ language: newLang }))
    onFilterChange(newFilters)
  }

  const handleSortChange = (sort) => {
    const newFilters = { ...filters, sort }
    dispatch(setFilter({ sort }))
    onFilterChange(newFilters)
    setShowSort(false)
  }

  const handleClearFilters = () => {
    dispatch(resetFilters())
    onFilterChange({ language: '', sort: 'stars', order: 'desc' })
  }

  const hasActiveFilters = filters.language || filters.sort !== 'stars'

  return (
    <div className="space-y-4">
      {/* Mobile: Compact horizontal scrollable filters */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {languages.slice(0, 6).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full transition-all duration-200 active:scale-95 ${
                (lang === 'All' && !filters.language) || filters.language === lang
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              {lang}
            </button>
          ))}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          >
            More <ChevronDown className={`w-3 h-3 inline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="px-3 py-1.5 text-sm rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Sort
            </button>
            
            {showSort && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-black/5 dark:shadow-black/20 z-50 p-1.5 animate-slideDown">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.sort === option.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="flex flex-wrap gap-2 mt-2 pb-2 animate-slideDown">
            {languages.slice(6).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 active:scale-95 ${
                  filters.language === lang
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Full filter panel */}
      <div className="hidden lg:block space-y-4">
        {/* Language Filter */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Language</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 active:scale-95 ${
                  (lang === 'All' && !filters.language) || filters.language === lang
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Sort By</h3>
          <div className="space-y-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  filters.sort === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 border border-red-200 dark:border-red-800/50 active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel