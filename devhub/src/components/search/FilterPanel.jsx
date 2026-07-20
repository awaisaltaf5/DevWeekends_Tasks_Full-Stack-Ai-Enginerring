import { useDispatch, useSelector } from 'react-redux'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

const languages = ['All', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP']
const sortOptions = [
  { value: 'stars', label: 'Most Stars' },
  { value: 'forks', label: 'Most Forks' },
  { value: 'updated', label: 'Recently Updated' },
]

function FilterPanel({ onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const filters = useSelector((state) => state.search.filters)
  const dispatch = useDispatch()

  const handleLanguageChange = (lang) => {
    onFilterChange({ language: lang === 'All' ? '' : lang })
  }

  const handleSortChange = (sort) => {
    onFilterChange({ sort })
  }

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {(filters.language || filters.sort !== 'stars') && (
          <span className="w-2 h-2 bg-blue-600 rounded-full" />
        )}
      </button>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-4`}>
        {/* Language Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Language</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  (lang === 'All' && !filters.language) || filters.language === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.sort === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.language || filters.sort !== 'stars') && (
          <button
            onClick={() => onFilterChange({ language: '', sort: 'stars' })}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel