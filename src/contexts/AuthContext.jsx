// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // This flag tells the auth listener to stay quiet during the initial load
    // Without this, getSession() and onAuthStateChange both fire on reload
    // and race each other — causing the infinite loading bug
    const initialized = useRef(false);

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
            await supabase.auth.signOut();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // STEP 1: Set up the auth listener FIRST
        // But it does nothing until initialized.current = true (set after getSession)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Ignore all events during initial load — getSession() handles that
            if (!initialized.current) return;

            if (session?.user) {
                setUser(session.user);
                setLoading(true);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        // STEP 2: Check for existing session on page load/reload
        const initSession = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Session init error:", err.message);
                setUser(null);
                setProfile(null);
                setLoading(false);
            } finally {
                // Only NOW allow the auth listener to respond to future events
                initialized.current = true;
            }
        };

        initSession();

        return () => subscription.unsubscribe();
    }, []);

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
