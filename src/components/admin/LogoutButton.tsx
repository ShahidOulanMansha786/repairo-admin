"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);

        await fetch("/api/admin/logout", { method: "POST" });

        router.refresh();
        router.push("/login");
    };

    return (
        <Button
            variant="destructive"
            className="w-full"
            disabled={isLoading}
            onClick={handleLogout}
        >
            {isLoading ? "Logging out..." : "Logout"}
        </Button>
    );
}