"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "user" | null;

interface User {
    username: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Load user from localStorage on mount (simple persistence for demo)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (username: string, role: UserRole) => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const newUser = { username, role };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        router.push("/dashboard");
    };

    const logout = async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUser(null);
        localStorage.removeItem("user");
        router.push("/login");
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
