import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;
    const body = await req.json();

    const res = await fetch(
        `${process.env.BACKEND_URL}/admin/disputes/${id}/resolve`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}