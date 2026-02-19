import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import "./Login.css";

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const { error } = await login(email, password);

        if (error) {
            setError(error.message);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>AssetPulse Login</h2>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        className="login-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button className="login-button" type="submit">
                        Login
                    </button>
                </form>

                {error && <p className="login-error">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
