import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {

    const cookieStore = await cookies();

    const accessToken = cookieStore.get("admin_access_token")?.value;

    if (accessToken) {
        await fetch("http://13.233.250.42:8080/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
    }

    cookieStore.set("admin_access_token", "", { maxAge: 0, path: "/" });
    cookieStore.set("admin_refresh_token", "", { maxAge: 0, path: "/" });

    return NextResponse.json({ success: true });
}