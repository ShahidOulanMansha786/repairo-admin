import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;
    const { searchParams } = new URL(request.url);


    const params = new URLSearchParams();
    if (searchParams.get("role")) params.append("role", searchParams.get("role")!);
    if (searchParams.get("status")) params.append("status", searchParams.get("status")!);
    if (searchParams.get("search")) params.append("search", searchParams.get("search")!);
    if (searchParams.get("page")) params.append("page", searchParams.get("page")!);
    if (searchParams.get("size")) params.append("size", searchParams.get("size")!);

    const res = await fetch(`${process.env.API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}