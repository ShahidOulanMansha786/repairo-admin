import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    if (searchParams.get("search")) params.set("search", searchParams.get("search")!);
    if (searchParams.get("status")) params.set("status", searchParams.get("status")!);
    params.set("page", searchParams.get("page") ?? "0");

    const res = await fetch(
        `${process.env.API_URL}/admin/leads?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
}