// src/pages/admin/Dashboard.jsx
// This file is just a ROUTER — it decides which sub-page to show
// based on the URL path (/admin, /admin/devices, etc.)

import { Routes, Route } from "react-router-dom";
import AppLayout from "../../components/shared/AppLayout";
import {
    LayoutDashboard,
    Cpu,
    History,
    Users as UsersIcon,
} from "lucide-react";
import Overview from "./Overview";
import Devices from "./Devices";
import AssignmentHistory from "./AssignmentHistory";
import Users from "./Users";

const navItems = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/devices", label: "Devices", icon: Cpu },
    { to: "/admin/history", label: "Assignment History", icon: History },
    { to: "/admin/users", label: "Staff Members", icon: UsersIcon },
];

export default function AdminDashboard() {
    return (
        <AppLayout navItems={navItems}>
            <Routes>
                {/* /admin → Overview */}
                <Route index element={<Overview />} />
                {/* /admin/devices → Devices */}
                <Route path="devices" element={<Devices />} />
                {/* /admin/history → History */}
                <Route path="history" element={<AssignmentHistory />} />
                {/* /admin/users → Users */}
                <Route path="users" element={<Users />} />
            </Routes>
        </AppLayout>
    );
}
