import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {

    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("admin_refresh_token")?.value;

    if (!refreshToken) {
        return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const springResponse = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!springResponse.ok) {
        cookieStore.set("admin_access_token", "", { maxAge: 0, path: "/" });
        cookieStore.set("admin_refresh_token", "", { maxAge: 0, path: "/" });
        return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const data = await springResponse.json();

    cookieStore.set("admin_access_token", data.accessToken, {
        httpOnly: true,
        path: "/",
        maxAge: 900,
        sameSite: "strict",
    });

    cookieStore.set("admin_refresh_token", data.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 604800,
        sameSite: "strict",
    });

    return NextResponse.json({ success: true });
}