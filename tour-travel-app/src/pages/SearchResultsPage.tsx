import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearchContext } from '../contexts/SearchContext'
import SearchResults from '../components/organisms/SearchResults'
import Heading from '../components/atoms/Heading'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const { search, searchResults, isLoading, searchQuery } = useSearchContext()
  const query = searchParams.get('q')

  useEffect(() => {
    // Only search if:
    // 1. We have a query
    // 2. Either no results OR the results are for a different query
    if (query && (!searchResults || searchResults.query !== query) && !isLoading) {
      search(query)
    }
  }, [query, search, searchResults, isLoading])

  return (
    <div>
      {/* Page Header */}
      <section className="bg-primary dark:bg-primary-dark py-12">
        <div className="container-custom">
          <Heading level={1} className="text-white">
            {query ? `Exploring ${query}` : 'Search Results'}
          </Heading>
          <p className="text-white/80 mt-2">
            {query 
              ? `Discover ${query} with real-time weather, photos, and maps` 
              : 'Discover your next destination with real-time information'}
          </p>
        </div>
      </section>

      {/* Results */}
      <SearchResults />
    </div>
  )
}