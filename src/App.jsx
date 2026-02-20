import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDevices from "./pages/AdminDevices";

import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashBoard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/devices"
                element={
                    <AdminRoute>
                        <AdminDevices />
                    </AdminRoute>
                }
            />
        </Routes>
    );
}

export default App;
