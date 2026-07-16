import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme !== 'light'

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card dark:bg-dark-card border border-border dark:border-dark-border flex items-center justify-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary hover:shadow-md active:scale-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-dark-primary/60 shrink-0"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {/* Both icons are always mounted (no lazy swap = no re-render flash),
          just faded/rotated in and out with pure CSS - keeps this instant
          on click with zero extra JS work. */}
      <Sun
        size={17}
        className={`absolute sm:w-[18px] sm:h-[18px] transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        size={17}
        className={`absolute sm:w-[18px] sm:h-[18px] transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
    </button>
  )
}