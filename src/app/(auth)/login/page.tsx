"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setServerError(null);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setServerError(result.message ?? "Something went wrong");
                return;
            }

            router.push("/dashboard");

        } catch {
            setServerError("Unable to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 select-none">

            {/* Header Section (Logo & Titles) */}
            <div className="flex flex-col items-center mb-8">
                <div className="bg-[#f97316] p-3.5 rounded-xl mb-4 shadow-sm">
                    <Wrench className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
                    Repairo Admin
                </h1>
                <p className="text-gray-500 text-[15px] tracking-normal">
                    Sign in to manage your platform
                </p>
            </div>

            {/* Login Form Card */}
            <Card className="w-full max-w-[420px] rounded-2xl border-gray-200 shadow-sm">
                <CardContent className="pt-8 pb-8 px-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-gray-700">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="admin@repairo.com"
                                className="h-12 rounded-lg border-gray-300 px-4 text-[15px] placeholder:text-gray-400 focus-visible:ring-[#f97316]"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 rounded-lg border-gray-300 pl-4 pr-11 text-[15px] tracking-widest placeholder:tracking-widest focus-visible:ring-[#f97316]"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {serverError && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                                {serverError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-white text-[16px] font-semibold rounded-lg mt-2 transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>

                    </form>
                </CardContent>
            </Card>

            {/* Footer Text */}
            <div className="mt-8">
                <p className="text-[13px] font-medium text-gray-400 tracking-wide">
                    Repairo Admin Panel · Secure Access Only
                </p>
            </div>

        </div>
    );
}