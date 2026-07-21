import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Bookmark } from 'lucide-react'

function MobileNav() {
  const location = useLocation()
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/bookmarks', icon: Bookmark, label: 'Saved' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/80 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className="group relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
            >
              {/* Active background indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-2xl transition-all duration-200" />
              )}
              
              {/* Icon with smooth animation */}
              <div className={`relative transition-all duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                <Icon className={`w-6 h-6 transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`} />
                
                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-scale-in" />
                )}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav