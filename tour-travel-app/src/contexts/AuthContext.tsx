import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const login = () => setShowLoginModal(true)
  const logout = () => setIsLoggedIn(false)
  const closeModal = () => setShowLoginModal(false)

  return (
    <AuthContext.Provider value={{ isLoggedIn, showLoginModal, login, logout, closeModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}