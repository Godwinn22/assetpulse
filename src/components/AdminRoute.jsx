import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/auth-context"

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useContext(AuthContext)

  if (loading) return <p>Loading...</p>

  if (!user) return <Navigate to="/login" replace />

  if (profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
