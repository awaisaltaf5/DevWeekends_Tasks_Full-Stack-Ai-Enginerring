import { useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRepos, loadMoreRepos } from '../store/slices/reposSlice.js'
import { addRecentSearch } from '../store/slices/searchSlice.js'
import SearchBar from '../components/search/SearchBar.jsx'
import FilterPanel from '../components/search/FilterPanel.jsx'
import RepoList from '../components/repo/RepoList.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import useInfiniteScroll from '../hooks/useInfiniteScroll.js'

function SearchPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { 
    items, 
    status, 
    loadMoreStatus, 
    error, 
    totalCount, 
    currentPage,
    hasMore,
    currentQuery,
    currentFilters
  } = useSelector((state) => state.repos)
  const filters = useSelector((state) => state.search.filters)
  const query = searchParams.get('q') || ''
  
  const hasFetched = useRef(false)

  const performSearch = useCallback((searchQuery, searchFilters) => {
    const effectiveQuery = searchQuery.trim() || 'stars:>1000'
    if (!effectiveQuery) return
    
    dispatch(addRecentSearch(effectiveQuery))
    dispatch(fetchRepos({ 
      query: effectiveQuery, 
      filters: searchFilters 
    }))
  }, [dispatch])

  const handleSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return
    setSearchParams({ q: searchQuery })
    performSearch(searchQuery, filters)
  }, [setSearchParams, performSearch, filters])

  const handleFilterChange = useCallback((newFilters) => {
    performSearch(query, newFilters)
  }, [query, performSearch])

  const handleLoadMore = useCallback(() => {
    if (loadMoreStatus === 'loading' || !hasMore) return
    const effectiveQuery = currentQuery || 'stars:>1000'
    const nextPage = currentPage + 1
    
    dispatch(loadMoreRepos({
      query: effectiveQuery,
      filters: currentFilters,
      page: nextPage,
    }))
  }, [dispatch, currentQuery, currentFilters, currentPage, loadMoreStatus, hasMore])

  useInfiniteScroll(handleLoadMore, hasMore, loadMoreStatus === 'loading')

  useEffect(() => {
    if (query && !hasFetched.current) {
      hasFetched.current = true
      performSearch(query, filters)
    }
  }, [query, filters, performSearch])

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Fixed Header - Search + Info */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 z-30 px-4 sm:px-6 pt-4 pb-3 border-b border-gray-200/50 dark:border-gray-800/50">
        {/* Search Bar */}
        <div className="mb-3">
          <SearchBar onSearch={handleSearch} initialValue={query} />
        </div>

        {/* Search Info */}
        {(query || filters.language) && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {query ? (
                <>
                  Searching for: <span className="font-medium text-gray-900 dark:text-white">"{query}"</span>
                </>
              ) : (
                <>Showing popular repositories</>
              )}
              {filters.language && (
                <span> in <span className="font-medium text-blue-600 dark:text-blue-400">{filters.language}</span></span>
              )}
            </p>

            {/* Results Count */}
            {status === 'succeeded' && items.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">{totalCount.toLocaleString()}</span>
                <span className="hidden sm:inline"> results</span>
                <span className="ml-1 text-xs text-gray-400">({items.length} shown)</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex gap-6 px-4 sm:px-6 py-4">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden lg:block w-64 flex-shrink-0 h-full overflow-y-auto pr-2 scrollbar-thin">
            <div className="space-y-4 pb-4">
              <FilterPanel onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 min-w-0 h-full overflow-y-auto pr-2 scrollbar-thin">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-4">
              <FilterPanel onFilterChange={handleFilterChange} />
            </div>

            {/* Results */}
            <RepoList 
              repos={items} 
              status={status} 
              error={error}
              loadMoreStatus={loadMoreStatus}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden xl:block w-64 flex-shrink-0 h-full overflow-y-auto pr-2 scrollbar-thin">
            <div className="pb-4">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage