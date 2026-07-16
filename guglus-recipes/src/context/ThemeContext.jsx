import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()
const STORAGE_KEY = 'guglu-theme'

// localStorage can throw (private/incognito mode, storage disabled, quota
// exceeded) - wrap every access so a storage failure never crashes the app
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore - theme just won't persist this session
  }
}

const getSystemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => safeGetItem(STORAGE_KEY) || getSystemTheme())

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Explicit user choice: persists and stops following the OS setting
  const setTheme = useCallback((next) => {
    setThemeState(next)
    safeSetItem(STORAGE_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      safeSetItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  // Keep in sync with the OS-level setting in real time, but only for users
  // who haven't explicitly picked a theme yet (no saved preference)
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    const handleChange = (e) => {
      if (!safeGetItem(STORAGE_KEY)) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  // Keep multiple open tabs in sync when the theme changes in one of them
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setThemeState(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}