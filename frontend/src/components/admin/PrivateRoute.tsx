import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../../services/auth'

export default function PrivateRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}
