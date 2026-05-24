import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ shopId: string }> }
) {
    const { shopId } = await params;
    const token = (await cookies()).get("admin_access_token")?.value;

    const res = await fetch(
        `${process.env.API_URL}/admin/shops/${shopId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ shopId: string }> }
) {
    const { shopId } = await params;
    const token = (await cookies()).get("admin_access_token")?.value;
    const body = await req.json();
    const action = body.action;

    const endpoint =
        action === "approve"
            ? `/admin/shops/${shopId}/approve`
            : `/admin/shops/${shopId}/reject`;

    const res = await fetch(
        `${process.env.API_URL}${endpoint}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: action === "reject"
                ? JSON.stringify({ rejectionReason: body.rejectionReason })
                : undefined,
        }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}