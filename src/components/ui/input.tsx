import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, label, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "flex h-10 w-full rounded-md border text-slate-900 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                            icon && "pl-10",
                            error ? "border-red-500 focus-visible:ring-red-500" : "border-slate-300",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";
