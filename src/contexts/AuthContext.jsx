// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // useRef lets us track a value without causing re-renders
    // We use this to prevent the auth listener from running during timeout cleanup
    const isTimingOut = useRef(false);
    const timeoutRef = useRef(null);

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
            // Sign out silently if profile can't be loaded
            await supabase.auth.signOut();
            setUser(null);
        } finally {
            // Clear the safety timeout since we finished successfully (or with error)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true; // prevents state updates if component unmounts

        const initialize = async () => {
            try {
                // ⏱ Safety timeout — if ANYTHING takes over 6 seconds, reset cleanly
                timeoutRef.current = setTimeout(async () => {
                    if (!mounted) return;
                    isTimingOut.current = true; // flag so auth listener ignores this signout
                    console.warn("Timeout — resetting session.");
                    await supabase.auth.signOut();
                    if (mounted) {
                        setUser(null);
                        setProfile(null);
                        setLoading(false); // ← this was the bug, loading wasn't set to false
                    }
                    isTimingOut.current = false;
                }, 6000);

                // Check for existing session on app load
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    clearTimeout(timeoutRef.current);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Init error:", err.message);
                if (mounted) {
                    clearTimeout(timeoutRef.current);
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
            }
        };

        initialize();

        // Listen for login/logout events AFTER initial load
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Ignore events triggered by our own timeout cleanup
            if (isTimingOut.current || !mounted) return;

            if (session?.user) {
                setUser(session.user);
                setLoading(true); // show spinner while fetching profile
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutRef.current);
            subscription.unsubscribe();
        };
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
