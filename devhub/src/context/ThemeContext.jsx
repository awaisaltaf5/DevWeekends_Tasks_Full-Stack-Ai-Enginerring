import { createContext, useContext, useState, useEffect } from 'react'

// ============================================
// STEP 1: Create the Context
// ============================================
// createContext accepts a default value (used when component is outside Provider)
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

// ============================================
// STEP 2: Create the Provider Component
// ============================================
export function ThemeProvider({ children }) {
  // Initialize state from localStorage, or system preference, or default to 'light'
  const [theme, setTheme] = useState(() => {
    // Lazy initialization — runs once on mount
    const saved = localStorage.getItem('devhub-theme')
    if (saved) return saved
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  // Sync theme changes to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('devhub-theme', theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const saved = localStorage.getItem('devhub-theme')
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // The value object is what consumers receive
  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================
// STEP 3: Create the Custom Hook
// ============================================
export function useTheme() {
  const context = useContext(ThemeContext)
  
  // Safety check — prevents using context outside Provider
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}