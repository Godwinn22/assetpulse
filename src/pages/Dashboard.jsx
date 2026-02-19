import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import "./Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>AssetPulse Dashboard</h2>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-card">
                    <p>
                        <strong>Logged in as:</strong> {user?.email}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
