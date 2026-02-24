"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, UserPlus, Shield, Key } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock user data for the UI
const MOCK_USERS = [
    { id: 1, name: "Admin User", username: "admin", role: "admin", status: "active", lastLogin: "2 hours ago" },
    { id: 2, name: "Standard User", username: "user", role: "user", status: "active", lastLogin: "1 day ago" },
    { id: 3, name: "Demo User", username: "demo", role: "user", status: "inactive", lastLogin: "1 week ago" },
];

export default function AdminUsersPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/dashboard");
        }
    }, [isAuthenticated, user, router]);

    if (!mounted || !user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage system access and roles</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/20">
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Users</p>
                            <h3 className="text-2xl font-bold text-slate-900">{MOCK_USERS.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Admins</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {MOCK_USERS.filter(u => u.role === "admin").length}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Sessions</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {MOCK_USERS.filter(u => u.status === "active").length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900">System Users</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Name</th>
                                <th scope="col" className="px-6 py-4 font-medium">Username</th>
                                <th scope="col" className="px-6 py-4 font-medium">Role</th>
                                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                                <th scope="col" className="px-6 py-4 font-medium">Last Login</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {MOCK_USERS.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs">
                                                {u.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                        {u.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                            u.role === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                u.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                                            )} />
                                            <span className="text-slate-600 capitalize">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                        {u.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors">Edit</button>
                                        <button className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
