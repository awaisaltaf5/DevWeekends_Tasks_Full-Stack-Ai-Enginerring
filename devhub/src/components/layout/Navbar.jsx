import { Link } from 'react-router-dom'
import { Moon, Sun, Code2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <Code2 className="w-8 h-8 text-blue-600" />
          <span>DevHub</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/search" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Search
          </Link>
          <Link to="/bookmarks" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Bookmarks
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar