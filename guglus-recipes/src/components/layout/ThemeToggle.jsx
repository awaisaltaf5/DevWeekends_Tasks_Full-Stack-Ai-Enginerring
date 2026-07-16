import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-card dark:bg-dark-card border border-border dark:border-dark-border flex items-center justify-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-all duration-200 hover:shadow-md"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}