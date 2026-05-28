import {NextResponse} from "next/server";
import {cookies} from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("admin_refresh_token")?.value;

    if (!refreshToken) {
        return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_access_token", data.accessToken, {
        httpOnly: true,
        path: "/",
        maxAge: 900,
        sameSite: "strict",
    });

    response.cookies.set("admin_refresh_token", data.refreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 604800,
        sameSite: "strict",
    });

    return response;
}