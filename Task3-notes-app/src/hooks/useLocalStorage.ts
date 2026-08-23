import { useState, useEffect } from 'react'

// Custom hook for persisting state to localStorage
// Demonstrates useEffect with cleanup and dependencies
export function useLocalStorage(key, initialValue) {
  // Lazy initialization - only runs once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // useEffect to sync with localStorage whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue]) // Dependency array - only runs when these change

  return [storedValue, setStoredValue]
}