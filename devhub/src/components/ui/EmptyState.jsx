import { SearchX, BookmarkX, AlertCircle } from 'lucide-react'

const icons = {
  search: SearchX,
  bookmarks: BookmarkX,
  error: AlertCircle,
}

function EmptyState({
  type = 'search',
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  action = null,
}) {
  const Icon = icons[type] || AlertCircle

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  )
}

export default EmptyState