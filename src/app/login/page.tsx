"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { loginSchema, LoginFormValues } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";
import { loginAction } from "@/app/actions/auth-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [globalError, setGlobalError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setGlobalError("");
        setIsLoading(true);

        try {
            const result = await loginAction(data.username, data.password);

            if (result.success && result.user) {
                await login(result.user.username, result.user.role);
                router.refresh(); // Ensure server components re-fetch session
            } else {
                setGlobalError(result.error || "Invalid username or password.");
            }
        } catch {
            setGlobalError("An error occurred during sign in.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-slate-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Valuation System
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access your dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input
                            id="username"
                            type="text"
                            placeholder="Username"
                            icon={<User className="h-5 w-5" />}
                            {...register("username")}
                            error={errors.username?.message}
                            autoComplete="username"
                        />

                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            icon={<Lock className="h-5 w-5" />}
                            {...register("password")}
                            error={errors.password?.message}
                            autoComplete="current-password"
                        />
                    </div>

                    {globalError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-sm text-red-600 text-center font-medium">
                                {globalError}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Sign in
                    </Button>

                    <div className="text-center text-xs text-slate-400 font-medium">
                        Demo Credentials: admin/admin or user/user
                    </div>
                </form>
            </div>
        </div>
    );
}
