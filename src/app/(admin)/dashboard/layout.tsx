import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import React from "react";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    if (!token) {
        redirect("/login");
    }

    return (
        <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1 p-8 min-h-screen bg-gray-50">
                {children}
            </main>
        </div>
    );
}