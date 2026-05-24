import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    const body = await request.json();

    const springResponse = await fetch("http://localhost:8080/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await springResponse.json();

    if (!springResponse.ok) {
        return NextResponse.json(
            { message: data.message ?? "Invalid credentials" },
            { status: 401 }
        );
    }

    const cookieStore = await cookies();

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

    return NextResponse.json({ success: true, role: data.role });
}