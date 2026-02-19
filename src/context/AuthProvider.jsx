import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            const sessionUser = data.session?.user ?? null;
            setUser(sessionUser);
			// If there's a session, fetch the user's profile
            if (sessionUser) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", sessionUser.id)
                    .single();

                setProfile(profileData);
            }
            setLoading(false);
        };

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            },
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user,profile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
