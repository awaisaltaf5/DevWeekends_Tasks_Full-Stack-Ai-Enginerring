import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Star, 
  GitFork, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  ArrowLeft, 
  ExternalLink,
  Calendar,
  Code2,
  GitBranch
} from 'lucide-react'
import { getRepository } from '../services/githubAPI.js'
import { addBookmark, removeBookmark } from '../store/slices/bookmarksSlice.js'
import { useNotification } from '../context/NotificationContext.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { formatStars, formatDate } from '../utils/formatters.js'
import SEOHelmet, { getDynamicPageMetadata } from '../components/SEO/HelmetWrapper.jsx'

function RepoDetailPage() {
  const { owner, name } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showToast } = useNotification()
  
  const [repo, setRepo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const bookmarks = useSelector((state) => state.bookmarks.items)
  const isBookmarked = repo ? bookmarks.some((b) => b.id === repo.id) : false
  
  // Dynamic SEO metadata
  const dynamicMeta = repo ? getDynamicPageMetadata(repo) : null

  useEffect(() => {
    async function loadRepo() {
      try {
        setLoading(true)
        setError(null)
        const data = await getRepository(owner, name)
        setRepo(data)
      } catch (err) {
        setError('Failed to load repository details')
        showToast('Failed to load repository', 'error')
      } finally {
        setLoading(false)
      }
    }
    
    loadRepo()
  }, [owner, name, showToast])

  const handleBookmark = () => {
    if (!repo) return
    
    if (isBookmarked) {
      dispatch(removeBookmark(repo.id))
      showToast('Removed from bookmarks', 'info')
    } else {
      dispatch(addBookmark(repo))
      showToast('Added to bookmarks!', 'success')
    }
  }

  const handleCopyClone = () => {
    if (!repo) return
    navigator.clipboard.writeText(repo.clone_url)
    showToast('Clone URL copied!', 'success')
  }

  if (loading) {
    return (
      <>
        <SEOHelmet pageKey="search" />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !repo) {
    return (
      <>
        <SEOHelmet pageKey="search" />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error || 'Repository not found'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              The repository might have been removed or you may have followed an incorrect link.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate(-1)} variant="secondary">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/search')}>
                Search Repositories
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHelmet pageKey="search" dynamicData={dynamicMeta} />
      <div className="container mx-auto px-4 py-6 max-w-4xl animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Main Card */}
      <Card className="p-6 md:p-8 mb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0"
            />
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {repo.name}
              </h1>
              <a
                href={repo.owner.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mt-0.5"
              >
                {repo.owner.login}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={handleBookmark}
              variant={isBookmarked ? 'primary' : 'secondary'}
              size="sm"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
        </div>

        {/* Description */}
        {repo.description && (
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg mb-6 leading-relaxed">
            {repo.description}
          </p>
        )}

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {repo.topics.map((topic) => (
              <Badge key={topic} variant="tag">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard 
            icon={Star} 
            value={formatStars(repo.stargazers_count)} 
            label="Stars" 
          />
          <StatCard 
            icon={GitFork} 
            value={formatStars(repo.forks_count)} 
            label="Forks" 
          />
          <StatCard 
            icon={Eye} 
            value={formatStars(repo.watchers_count)} 
            label="Watchers" 
          />
          <StatCard 
            icon={Code2} 
            value={repo.language || 'N/A'} 
            label="Language" 
          />
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Created {formatDate(repo.created_at)}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Updated {formatDate(repo.updated_at)}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopyClone} variant="secondary">
          <GitBranch className="w-4 h-4" />
          Copy Clone URL
        </Button>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button>
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </Button>
        </a>
      </div>
    </div>
    </>
  )
}

// Helper component for stat cards
function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
      <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
      <div className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}

export default RepoDetailPage