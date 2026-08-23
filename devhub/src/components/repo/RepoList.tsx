import RepoCard from './RepoCard.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { Loader2, ChevronDown } from 'lucide-react'

function RepoList({ repos, status, error, loadMoreStatus, onLoadMore, hasMore }) {
  // Initial loading state
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (status === 'failed') {
    return (
      <EmptyState
        type="error"
        title="Something went wrong"
        description={error || 'Failed to fetch repositories. Please try again.'}
      />
    )
  }

  // Empty state
  if (status === 'idle' || repos.length === 0) {
    return (
      <EmptyState
        type="search"
        title="Start searching"
        description="Enter a keyword to discover amazing GitHub repositories."
      />
    )
  }

  // Success state with infinite scroll
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <div key={`${repo.id}-${repo.full_name}`} className="animate-fadeInUp" style={{ animationDelay: `${Math.random() * 100}ms` }}>
            <RepoCard repo={repo} />
          </div>
        ))}
      </div>
      
      {/* Load More Section */}
      {hasMore && (
        <div className="flex justify-center py-8">
          {loadMoreStatus === 'loading' ? (
            <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading more...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <ChevronDown className="w-4 h-4" />
              Load More
            </button>
          )}
        </div>
      )}
      
      {/* End of results */}
      {!hasMore && repos.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full text-sm text-gray-500 dark:text-gray-400">
            <span>You've reached the end</span>
            <span role="img" aria-label="party">🎉</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RepoList