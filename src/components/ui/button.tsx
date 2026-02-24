import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white active:scale-[0.98]",
                    // Variants
                    variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
                    variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
                    variant === "danger" && "bg-red-600 text-white hover:bg-red-700 shadow-sm",
                    variant === "ghost" && "hover:bg-slate-100 hover:text-slate-900 text-slate-700",
                    // Sizes
                    size === "sm" && "h-8 px-3 text-xs",
                    size === "md" && "h-10 py-2 px-4 text-sm",
                    size === "lg" && "h-12 px-8 text-base",
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
