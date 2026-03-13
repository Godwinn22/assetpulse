// src/components/admin/AdminLayout.jsx
// This is the "shell" of the admin app — sidebar on the left, content on the right.
// Every admin page is rendered INSIDE this layout.

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    Monitor,
    LayoutDashboard,
    Cpu,
    History,
    Users,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";

// Navigation items — each has a path, label, and icon
const navItems = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/devices", label: "Devices", icon: Cpu },
    { to: "/admin/history", label: "Assignment History", icon: History },
    { to: "/admin/users", label: "Staff Members", icon: Users },
];

// Add this small component ABOVE the AdminLayout function
function NavItem({ to, label, icon, end }) {
    const Icon = icon;
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
         transition-all duration-200
         ${
             isActive
                 ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                 : "text-slate-400 hover:bg-slate-800 hover:text-white"
         }`
            }
        >
            {({ isActive }) => (
                <>
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1">{label}</span>
                    {isActive && (
                        <ChevronRight className="w-4 h-4 opacity-60" />
                    )}
                </>
            )}
        </NavLink>
    );
}

export default function AdminLayout({ children }) {
    const { profile, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* ── Mobile overlay (dark backdrop when sidebar is open on small screens) ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside
                className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
            >
                {/* Logo area */}
                <div className="p-6 border-b border-slate-700/60">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-lg leading-none tracking-tight">
                                AssetPulse
                            </h1>
                            <p className="text-slate-400 text-xs mt-0.5">
                                IT Asset Management
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-4 mb-3">
                        Main Menu
                    </p>
                    {navItems.map((item) => (
                        <NavItem
                            key={item.to}
                            {...item}
                            onClick={() => setSidebarOpen(false)}
                        />
                    ))}
                </nav>

                {/* Bottom: user info + logout */}
                <div className="p-4 border-t border-slate-700/60">
                    <div className="bg-slate-800 rounded-xl p-3 mb-3">
                        <p className="text-white text-sm font-semibold truncate">
                            {profile?.full_name}
                        </p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">
                            {profile?.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Admin
                            </span>
                            <span className="text-slate-500 text-[10px]">
                                ·
                            </span>
                            <span className="text-slate-400 text-[10px]">
                                {profile?.department}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-400
                       hover:text-red-400 hover:bg-red-400/10 rounded-xl transition text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile top bar (only visible on small screens) */}
                <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">
                            AssetPulse
                        </span>
                    </div>
                </header>

                {/* The actual page content goes here */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
