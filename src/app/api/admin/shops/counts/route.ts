import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const token = (await cookies()).get("admin_access_token")?.value;

    const res = await fetch(
        `${process.env.API_URL}/admin/shops/counts`,
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