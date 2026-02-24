"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
                    <h2 className="text-xl font-semibold text-slate-800">Page not found</h2>
                    <p className="text-slate-500 text-sm">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-slate-400">
                Axium Valuation System &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
}
