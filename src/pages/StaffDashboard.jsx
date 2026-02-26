import { useAuth } from "../hooks/AuthContext";

export default function StaffDashboard() {
    const { profile, logout } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">Staff Dashboard</h1>
            <p className="mt-2">Welcome, {profile?.full_name}</p>

            <button
                onClick={logout}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
                Logout
            </button>
        </div>
    );
}
