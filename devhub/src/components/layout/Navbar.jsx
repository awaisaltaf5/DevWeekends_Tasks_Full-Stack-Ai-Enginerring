import { Link, useLocation } from 'react-router-dom'
import { 
  Code2, 
  Moon, 
  Sun, 
  Home, 
  Search, 
  Bookmark,
  Menu,
  X,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'

function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  DevHub
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 -mt-1 tracking-wider uppercase hidden sm:block">
                  Discover • Bookmark • Learn
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className="relative w-5 h-5">
                  <Sun 
                    className={`w-5 h-5 text-yellow-500 absolute inset-0 transition-all duration-300 ${
                      theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                  />
                  <Moon 
                    className={`w-5 h-5 text-blue-400 absolute inset-0 transition-all duration-300 ${
                      theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`} 
                  />
                </div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 absolute inset-0 transition-all duration-300 ${
                      mobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                  />
                  <X 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 absolute inset-0 transition-all duration-300 ${
                      mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[70] md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
          
          <div 
            className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link, index) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                    {active && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-scaleIn" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar