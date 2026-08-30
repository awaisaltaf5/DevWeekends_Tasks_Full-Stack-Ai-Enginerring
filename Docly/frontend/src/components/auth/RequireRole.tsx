import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface RequireRoleProps {
  allowed: UserRole | UserRole[];
  fallback?: string; // where to redirect when not authorized
}

/**
 * Guards a route for authenticated users with one of the allowed roles.
 * - Not logged in  → redirect to /login (preserving the intended destination)
 * - Logged in but wrong role → redirect to a sensible fallback page
 */
export default function RequireRole({ allowed, fallback = '/' }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const roles = Array.isArray(allowed) ? allowed : [allowed];
  if (!roles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
