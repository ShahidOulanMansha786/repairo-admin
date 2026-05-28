import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const res = await fetch(
        `${process.env.API_URL}/admin/dashboard/stats`,
        {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}