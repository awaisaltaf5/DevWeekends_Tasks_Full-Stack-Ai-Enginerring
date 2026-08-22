import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Guards protected routes. If there is no auth token in the Redux store, the
 * user is redirected to /login, preserving their original destination so they
 * can be sent back after a successful sign-in.
 */
export default function RequireAuth({ children }) {
  const { token, loading } = useSelector((state) => state.auth)
  const location = useLocation()

  // While the session is being restored on first load, render nothing.
  if (loading) return null

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
