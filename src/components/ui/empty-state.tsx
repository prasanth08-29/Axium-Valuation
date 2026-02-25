"use client";

import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface EmptyStateProps {
    title: string;
    description: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50",
                className
            )}
        >
            <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-slate-100 mb-4">
                {icon || <FolderOpen className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                {description}
            </p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </motion.div>
    );
}
