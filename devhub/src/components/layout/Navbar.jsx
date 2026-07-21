import { Link, useLocation } from 'react-router-dom'
import { 
  Code2, 
  Moon, 
  Sun, 
  Home, 
  Search, 
  Bookmark,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'

function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileMenuRef = useRef(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Handle scroll state for glass effect enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 border-b border-gray-200/60 dark:border-gray-700/60' 
          : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/40 dark:border-gray-700/40'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <div className="relative">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Code2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                  DevHub
                </span>
                <span className="text-[10px] lg:text-[11px] text-gray-500 dark:text-gray-400 -mt-0.5 tracking-wider uppercase hidden sm:block">
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
                    className="relative group px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      active
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800/40'
                    }`}>
                      <Icon className={`w-4 h-4 transition-transform duration-200 ${
                        active ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      {link.label}
                    </div>
                    {active && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-nav-indicator" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* GitHub Link */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-400">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23.975 1.635 2.55 1.185 3.195.9.105-.72.39-1.185.705-1.455-2.475-.285-5.07-1.245-5.07-5.55 0-1.23.435-2.235 1.23-3.045-.135-.345-.63-1.74.135-3.51 0 0 1.005-.315 3.3 1.17.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.485 3.3-1.17 3.3-1.17.765 1.77.27 3.165.135 3.51.795.81 1.23 1.815 1.23 3.045 0 4.32-2.61 5.28-5.07 5.55.405.36.765 1.065.765 2.145 0 1.545-.015 2.79-.015 3.165 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className="relative w-5 h-5">
                  <Sun 
                    className={`w-5 h-5 text-yellow-500 absolute inset-0 transition-all duration-500 ${
                      theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                  />
                  <Moon 
                    className={`w-5 h-5 text-blue-400 absolute inset-0 transition-all duration-500 ${
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
          ref={mobileMenuRef}
        >
          <div className="absolute inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm" />
          
          <div 
            className="absolute top-16 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 shadow-xl animate-slide-down rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 space-y-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-200">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23.975 1.635 2.55 1.185 3.195.9.105-.72.39-1.185.705-1.455-2.475-.285-5.07-1.245-5.07-5.55 0-1.23.435-2.235 1.23-3.045-.135-.345-.63-1.74.135-3.51 0 0 1.005-.315 3.3 1.17.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.485 3.3-1.17 3.3-1.17.765 1.77.27 3.165.135 3.51.795.81 1.23 1.815 1.23 3.045 0 4.32-2.61 5.28-5.07 5.55.405.36.765 1.065.765 2.145 0 1.545-.015 2.79-.015 3.165 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <span>GitHub</span>
              </a>

              {navLinks.map((link, index) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-up ${
                      active
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/40'
                    }`}
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      active
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {link.label}
                    {active && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-scale-in" />
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