import RepoCard from './RepoCard.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import EmptyState from '../ui/EmptyState.jsx'

function RepoList({ repos, status, error }) {
  // Loading state
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
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

  // Success state
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}

export default RepoList