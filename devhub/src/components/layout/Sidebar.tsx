import { useSelector } from 'react-redux'
import { Bookmark, Tag, TrendingUp, ExternalLink, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function Sidebar() {
  const bookmarks = useSelector((state) => state.bookmarks.items)
  const categories = useSelector((state) => state.bookmarks.categories)
  
  // Count bookmarks per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = cat === 'All' 
      ? bookmarks.length 
      : bookmarks.filter(b => b.category === cat).length
    return acc
  }, {})

  // Get top languages from bookmarks
  const languageCounts = bookmarks.reduce((acc, b) => {
    if (b.language) {
      acc[b.language] = (acc[b.language] || 0) + 1
    }
    return acc
  }, {})

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <aside className="hidden xl:block w-64 flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Quick Stats
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Bookmarks</span>
              <span className="font-medium text-gray-900 dark:text-white tabular-nums">{bookmarks.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">With Notes</span>
              <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                {bookmarks.filter(b => b.notes).length}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
            <Bookmark className="w-4 h-4 text-green-600" />
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <div key={cat} className="flex justify-between items-center text-sm py-1">
                <span className="text-gray-600 dark:text-gray-400">{cat}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs tabular-nums bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                  {categoryCounts[cat] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Languages */}
        {topLanguages.length > 0 && (
          <div className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-purple-600" />
              Top Languages
            </h3>
            <div className="space-y-2.5">
              {topLanguages.map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{lang}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Quick Links</h3>
          <div className="space-y-2">
            <Link
              to="/bookmarks"
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
            >
              <span className="flex items-center gap-1.5">
                View all bookmarks
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <a
              href="https://github.com/trending"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              GitHub Trending
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar