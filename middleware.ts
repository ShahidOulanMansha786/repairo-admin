import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const accessToken  = request.cookies.get("admin_access_token")?.value;
    const refreshToken = request.cookies.get("admin_refresh_token")?.value;

    if (accessToken) return NextResponse.next();

    if (refreshToken) {
        const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });


        if (res.ok) {
            const data = await res.json();
            const response = NextResponse.next();

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
    }
    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
    matcher: ["/dashboard/:path*"],
};