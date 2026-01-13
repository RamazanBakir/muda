"use client";

import { useEffect, useState } from "react";
import { UserRole, UserSession } from "../model/types";
import { sessionStorage } from "./sessionStorage";
import { useRouter } from "next/navigation";

export const useSession = () => {
    const [session, setSession] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Initial load
        const saved = sessionStorage.get();
        if (saved) {
            setSession(saved);
        }
        setLoading(false);

        // Listen to storage events just in case (optional for single tab, but good for multi-tab MVP)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "muda_session_v1") {
                const newVal = sessionStorage.get();
                setSession(newVal);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const logout = () => {
        sessionStorage.clear();
        setSession(null);
        router.push("/login");
    };

    // Deprecated usage kept for compatibility with existing components if any remaining, but ideally we remove 'loginAs'
    // loginAs was for dev tool. We can keep it but route it through sessionStorage.
    const loginAs = (role: UserRole) => {
        // Stub for backward compat if RoleSwitcher still calls it. 
        // Ideally RoleSwitcher should be removed or updated to just redirect to login page.
        router.push("/login");
    };

    return { session, loading, loginAs, logout };
};
