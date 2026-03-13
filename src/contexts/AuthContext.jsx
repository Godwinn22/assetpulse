// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// 1. Create the context — think of this as a "global store" for auth info
const AuthContext = createContext({});

// 2. Custom hook — any component can call useAuth() to get user info
export const useAuth = () => useContext(AuthContext);

// 3. The Provider — wraps your whole app and shares auth state with everyone
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // the raw Supabase auth user
    const [profile, setProfile] = useState(null); // our profiles table row (has role, name, etc.)
    const [loading, setLoading] = useState(true); // true while we check if someone is logged in

    useEffect(() => {
        // When the app first loads, check if there's already a logged-in session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // This listener fires every time login or logout happens
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        // Cleanup: stop listening when the component is removed
        return () => subscription.unsubscribe();
    }, []);

    // Fetches the user's row from our profiles table (contains role, name, dept)
    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error("Could not load profile:", err.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    // Login function — called from the Login page
    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    // Logout function — called from dashboards
    const logout = async () => {
        await supabase.auth.signOut();
    };

    // Everything inside `value` is available to any component that calls useAuth()
    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
