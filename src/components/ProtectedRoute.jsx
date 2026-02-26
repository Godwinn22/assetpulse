// this is a wrapper for protected routes
// it checks if the user is authenticated and if not, it redirects to the login page
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, role }) {
    const { user, profile, loading } = useAuth();

    if (loading) return <div className="p-6">Loading...</div>;

    if (!user) return <Navigate to="/" />;

    if (role && profile?.role !== role) return <Navigate to="/" />;

    return children;
}
