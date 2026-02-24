"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Global boundary caught error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Something went wrong</h1>
                    <p className="text-slate-500 text-sm">
                        An unexpected error has occurred in the application. Please try again.
                    </p>
                </div>

                {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-red-500 border border-slate-200">
                        {error.message}
                    </div>
                )}

                <div className="pt-4">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-[0.98]"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );
}
