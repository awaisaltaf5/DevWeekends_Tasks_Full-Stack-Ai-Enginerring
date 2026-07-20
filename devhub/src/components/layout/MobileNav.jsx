import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Bookmark } from 'lucide-react'

function MobileNav() {
  const location = useLocation()
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav