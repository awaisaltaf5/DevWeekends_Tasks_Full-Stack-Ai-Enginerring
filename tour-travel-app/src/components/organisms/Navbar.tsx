import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon, User, Compass } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../atoms/Button'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Packages', path: '/packages' },
  { name: 'About Us', path: '/about' },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()
  const { login, isLoggedIn, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-md border-b border-gray-100 dark:border-gray-800' 
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-primary dark:bg-primary-light rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Snap<span className="text-primary dark:text-primary-light">Trips</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-primary dark:text-primary-light bg-primary-bg dark:bg-primary/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary dark:bg-primary-light rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary-light transition-all"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-bg dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary dark:text-primary-light" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden lg:inline">Welcome back!</span>
                  </div>
                  <Button variant="ghost" size="small" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="small" onClick={login}>
                    Login
                  </Button>
                  <Button variant="primary" size="small" onClick={login}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU - FULL SCREEN OVERLAY outside nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-9 h-9 bg-primary dark:bg-primary-light rounded-xl flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Snap<span className="text-primary dark:text-primary-light">Trips</span>
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-primary-bg dark:bg-primary/10 text-primary dark:text-primary-light'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isActive(link.path) ? 'bg-primary dark:bg-primary-light' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 bg-primary-bg dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary dark:text-primary-light" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900 dark:text-white">Welcome back!</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Logged in</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center py-3 text-base" 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center py-3 text-base" 
                    onClick={() => { login(); setIsMobileMenuOpen(false); }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="primary" 
                    className="w-full justify-center py-3 text-base" 
                    onClick={() => { login(); setIsMobileMenuOpen(false); }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}