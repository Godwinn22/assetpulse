// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ⏱ SAFETY NET: If loading takes more than 5 seconds, something is wrong.
        // We automatically sign the user out and reset — no DevTools needed.
        const timeout = setTimeout(async () => {
            console.warn("Loading timeout — clearing session automatically.");
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setLoading(false);
        }, 5000);

        // Check if there's an existing session when the app first loads
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, timeout);
            } else {
                clearTimeout(timeout); // session check done, cancel the timeout
                setLoading(false);
            }
        });

        // Listen for login/logout events
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id, timeout);
            } else {
                setProfile(null);
                clearTimeout(timeout);
                setLoading(false);
            }
        });

        return () => {
            clearTimeout(timeout); // always clean up the timer when component unmounts
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId, timeout) => {
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
            // If profile fetch fails, sign out cleanly instead of staying stuck
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } finally {
            clearTimeout(timeout); // profile loaded (or failed), cancel the timeout
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
