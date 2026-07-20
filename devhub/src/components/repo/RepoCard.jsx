import { Link } from 'react-router-dom'
import { Star, GitFork, ExternalLink, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { addBookmark, removeBookmark } from '../../store/slices/bookmarksSlice.js'
import { useNotification } from '../../context/NotificationContext.jsx'
import { formatStars, formatDate } from '../../utils/formatters.js'

function RepoCard({ repo }) {
  const dispatch = useDispatch()
  const { showToast } = useNotification()
  const bookmarks = useSelector((state) => state.bookmarks.items)
  const isBookmarked = bookmarks.some((b) => b.id === repo.id)

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isBookmarked) {
      dispatch(removeBookmark(repo.id))
      showToast('Removed from bookmarks', 'info')
    } else {
      dispatch(addBookmark(repo))
      showToast('Added to bookmarks!', 'success')
    }
  }

  const handleCopyClone = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(repo.clone_url)
    showToast('Clone URL copied!', 'success')
  }

  return (
    <Link to={`/repo/${repo.owner.login}/${repo.name}`} className="block group">
      <Card hoverable className="h-full">
        <div className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
                loading="lazy"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {repo.full_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{repo.owner.login}</p>
              </div>
            </div>
            <button
              onClick={handleBookmark}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 active:scale-90"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-blue-600" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow leading-relaxed">
            {repo.description || 'No description available'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{formatStars(repo.stargazers_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              <span>{formatStars(repo.forks_count)}</span>
            </div>
            <span className="text-xs">{formatDate(repo.updated_at)}</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
            {repo.language && (
              <Badge variant="language" language={repo.language}>
                {repo.language}
              </Badge>
            )}
            <button
              onClick={handleCopyClone}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Copy clone URL
            </button>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default RepoCard