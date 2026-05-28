import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    const res = await fetch(`${process.env.API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}