import { createContext, useContext, useState, useCallback } from 'react'
import { useSearch } from '../hooks/useSearch'

const SearchContext = createContext()

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { results, isLoading, error, performSearch, clearResults } = useSearch()

  const search = useCallback(async (query) => {
    // Always clear previous results first
    clearResults()
    setSearchQuery(query)
    await performSearch(query)
  }, [clearResults, performSearch])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    clearResults()
  }, [clearResults])

  return (
    <SearchContext.Provider value={{
      searchQuery,
      searchResults: results,
      isLoading,
      error,
      search,
      clearSearch,
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearchContext must be used within SearchProvider')
  return context
}