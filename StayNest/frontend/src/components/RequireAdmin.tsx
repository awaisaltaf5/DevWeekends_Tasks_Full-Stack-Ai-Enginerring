import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Guards the admin dashboard. Requires an authenticated user whose role is
 * `admin`; everyone else is redirected to the home page (they shouldn't even
 * know the admin panel exists). The backend independently enforces the role.
 */
export default function RequireAdmin({ children }) {
  const { token, loading, currentUser } = useSelector((state) => state.auth)
  const location = useLocation()

  if (loading) return null

  if (!token || currentUser?.role !== 'admin') {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
