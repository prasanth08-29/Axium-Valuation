"use client";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Building2, Home, LogOut, User, Users, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "All Valuations", href: "/valuations", icon: FileText },
        ...(user?.role === "admin"
            ? [
                { name: "Users", href: "/admin/users", icon: Users },
                { name: "Sectors", href: "/admin/sectors", icon: Building2 },
                { name: "Templates", href: "/admin/templates", icon: FileText },
            ]
            : []),
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <div className="fixed inset-y-0 z-50 flex w-64 flex-col print:hidden">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#0f172a] px-6 pb-4 ring-1 ring-white/5">
                    <div className="flex h-20 shrink-0 items-center border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-white text-lg font-bold tracking-tight">Axium Val</h1>
                        </div>
                    </div>
                    <nav className="flex flex-1 flex-col pt-4">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1.5">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        isActive
                                                            ? "bg-indigo-600/10 text-indigo-400"
                                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
                                                        "group relative flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-medium transition-all duration-200"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                                                    )}
                                                    <item.icon
                                                        className={cn(
                                                            isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300",
                                                            "h-5 w-5 shrink-0 transition-colors"
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                            <li className="mt-auto pt-6 border-t border-slate-800">
                                <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-slate-300 px-2 mb-2">
                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-sm font-semibold text-white truncate">{user?.username}</span>
                                        <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium leading-6 text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full text-left transition-all"
                                >
                                    <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                                    <span>Sign out</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64 print:pl-0">
                <main className="py-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 print:px-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
