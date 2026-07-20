import { useSelector } from 'react-redux'
import { Bookmark, Tag, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

function Sidebar() {
  const bookmarks = useSelector((state) => state.bookmarks.items)
  const categories = useSelector((state) => state.bookmarks.categories)

  return (
    <aside className="hidden lg:block w-64 sticky top-20 h-fit">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Bookmarks</span>
              <span className="font-medium text-gray-900 dark:text-white">{bookmarks.length}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-600" />
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-green-600" />
            Quick Links
          </h3>
          <Link
            to="/bookmarks"
            className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all bookmarks →
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar