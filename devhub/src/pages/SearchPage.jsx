import { useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Search } from 'lucide-react'
import SearchBar from '../components/search/SearchBar.jsx'
import FilterPanel from '../components/search/FilterPanel.jsx'
import RepoList from '../components/repo/RepoList.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

function SearchPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, status, error, totalCount } = useSelector((state) => state.repos)
  const filters = useSelector((state) => state.search.filters)

  const query = searchParams.get('q') || ''

  const handleSearch = useCallback((searchQuery) => {
    setSearchParams({ q: searchQuery })
    // We'll dispatch the thunk here in Step 7
    console.log('Searching for:', searchQuery, 'with filters:', filters)
  }, [setSearchParams, filters])

  const handleFilterChange = (newFilters) => {
    // We'll dispatch filter changes here in Step 6
    console.log('Filter changed:', newFilters)
  }

  useEffect(() => {
    if (query) {
      handleSearch(query)
    }
  }, [query, handleSearch])

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Results Count */}
          {status === 'succeeded' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found <span className="font-medium text-gray-900 dark:text-white">{totalCount.toLocaleString()}</span> repositories
            </p>
          )}

          {/* Results */}
          <RepoList repos={items} status={status} error={error} />
        </div>

        {/* Right Sidebar */}
        <Sidebar />
      </div>
    </div>
  )
}

export default SearchPage