import { SearchX } from 'lucide-react'

export default function EmptyState({ message = 'No recipes found', submessage = 'Try a different search or category' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-border dark:bg-dark-border flex items-center justify-center mb-4">
        <SearchX size={32} className="text-text-secondary dark:text-dark-text-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-1">
        {message}
      </h3>
      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
        {submessage}
      </p>
    </div>
  )
}