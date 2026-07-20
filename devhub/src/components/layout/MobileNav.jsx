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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-all duration-200 ${
                isActive ? 'scale-110 -translate-y-0.5' : ''
              }`} />
              <span className={`text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'translate-y-0' : ''
              }`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav