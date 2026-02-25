"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth-actions";

export type UserRole = "admin" | "user" | null;

export interface User {
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

export function AuthProvider({ children, initialUser }: { children: ReactNode, initialUser: User | null }) {
    const [user, setUser] = useState<User | null>(initialUser);
    const router = useRouter();

    const login = async (username: string, role: UserRole) => {
        // Handled by loginAction now, just setting local state for immediate UI reflection
        setUser({ username, role });
        router.push("/dashboard");
    };

    const logout = async () => {
        setUser(null);
        await logoutAction(); // Handles cookie deletion and redirect
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
