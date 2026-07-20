import { SearchX, BookmarkX, AlertCircle } from 'lucide-react'

const icons = {
  search: SearchX,
  bookmarks: BookmarkX,
  error: AlertCircle,
}

const iconBgColors = {
  search: 'bg-blue-50 dark:bg-blue-900/20',
  bookmarks: 'bg-purple-50 dark:bg-purple-900/20',
  error: 'bg-red-50 dark:bg-red-900/20',
}

const iconColors = {
  search: 'text-blue-400 dark:text-blue-500',
  bookmarks: 'text-purple-400 dark:text-purple-500',
  error: 'text-red-400 dark:text-red-500',
}

function EmptyState({
  type = 'search',
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  action = null,
}) {
  const Icon = icons[type] || AlertCircle
  const bgColor = iconBgColors[type] || iconBgColors.error
  const color = iconColors[type] || iconColors.error

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center mb-5`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  )
}

export default EmptyState