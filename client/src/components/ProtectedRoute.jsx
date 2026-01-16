import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, loading, user } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return <div className="center">Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access if roles are specified
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated and authorized
  return <Outlet />
}

export default ProtectedRoute
