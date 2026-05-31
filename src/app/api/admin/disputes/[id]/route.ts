import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    const res = await fetch(
        `${process.env.BACKEND_URL}/admin/disputes/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}