import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
	const navigate = useNavigate();

    // we can use the profile to redirect the user to the correct dashboard after login
	const { profile } = useAuth();
	
    // we can also use the profile to show different content on the login page if needed
    useEffect(() => {
        if (profile?.role === "admin") {
            navigate("/admin");
        }
        if (profile?.role === "staff") {
            navigate("/staff");
        }
    }, [profile, navigate]);

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error("Login failed");
            return;
        }

        if (data?.user) {
            toast.success("Login successful");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="p-8 bg-white shadow-xl rounded-2xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Assetpulse Login
                </h2>

                <input
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full border p-2 mb-5 rounded"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
