// src/pages/admin/Dashboard.jsx
// This file is just a ROUTER — it decides which sub-page to show
// based on the URL path (/admin, /admin/devices, etc.)

import { Routes, Route } from "react-router-dom";
import AppLayout from "../../components/shared/AppLayout";
import Overview from "./Overview";
import Devices from "./Devices";
import AssignmentHistory from "./AssignmentHistory";
import Users from "./Users";

export default function AdminDashboard() {
    return (
        <AppLayout>
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
