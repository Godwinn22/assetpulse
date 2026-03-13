// src/pages/staff/Dashboard.jsx
import { useAuth } from "../../contexts/AuthContext";
import { Monitor, LogOut } from "lucide-react";

export default function StaffDashboard() {
    const { profile, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">AssetPulse</span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                        Staff
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Hi,{" "}
                        <span className="font-semibold">
                            {profile?.full_name}
                        </span>
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Logged in as Staff!
                    </h2>
                    <p className="text-gray-500">
                        Day 2 complete. Your Staff Dashboard is coming soon.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm px-4 py-2 rounded-full">
                        Role: <strong>{profile?.role}</strong> · Department:{" "}
                        <strong>{profile?.department}</strong>
                    </div>
                </div>
            </main>
        </div>
    );
}
