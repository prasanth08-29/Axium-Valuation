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
        ...(user?.role === "admin"
            ? [
                { name: "Users", href: "/dashboard/users", icon: Users },
                { name: "Sectors", href: "/admin/sectors", icon: Building2 },
                { name: "Templates", href: "/admin/templates", icon: FileText },
            ]
            : []),
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 z-50 flex w-64 flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                        <h1 className="text-white text-xl font-bold">Valuation App</h1>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    pathname === item.href
                                                        ? "bg-gray-800 text-white"
                                                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                                )}
                                            >
                                                <item.icon
                                                    className="h-6 w-6 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-white bg-gray-800 rounded-md px-4 mb-2">
                                    <User className="h-5 w-5 rounded-full bg-gray-50 text-gray-900 p-0.5" />
                                    <span aria-hidden="true">{user?.username} ({user?.role})</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white w-full text-left"
                                >
                                    <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                                    Sign out
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
