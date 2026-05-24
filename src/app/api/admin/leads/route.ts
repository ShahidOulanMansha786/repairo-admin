import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "10";
    const status = searchParams.get("status") ?? "";

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    console.log("token from cookie:", token); // debug line

    const params = new URLSearchParams({ page, size });
    if (status) params.append("status", status);

    const res = await fetch(
        `${process.env.API_URL}/admin/leads?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        }
    );

    const data = await res.json();
    return NextResponse.json(data);
}