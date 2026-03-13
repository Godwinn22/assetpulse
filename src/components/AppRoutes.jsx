// src/components/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import StaffDashboard from "../pages/staff/Dashboard";
import LoadingScreen from "./LoadingScreen";

export default function AppRoutes() {
    const { user, profile, loading } = useAuth();

    // Always show spinner while auth is being checked
    if (loading) return <LoadingScreen />;

    // Not logged in — show login page only
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // User is logged in but profile is missing — only show AFTER loading is done
    // This prevents the flash since we now only reach here when loading = false
    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow text-center max-w-sm">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-xl">⚠️</span>
                    </div>
                    <p className="text-red-600 font-semibold mb-2">
                        Profile Not Found
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                        Your account exists but has no profile assigned. Please
                        contact your IT administrator.
                    </p>
                    {/* Give user a way out without needing DevTools */}
                    <button
                        onClick={() => window.location.reload()}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // Route based on role
    if (profile.role === "admin") {
        return (
            <Routes>
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/staff/*" element={<StaffDashboard />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
    );
}
