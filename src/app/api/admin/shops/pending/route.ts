import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const token = (await cookies()).get("admin_access_token")?.value;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "10";

    const res = await fetch(
        `${process.env.API_URL}/admin/shops/pending?page=${page}&size=${size}`,
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