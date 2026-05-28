import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    const { id } = await params;

    console.log("Token found:", !!token);
    console.log("Token value:", token?.substring(0, 20));

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
        `${process.env.API_URL}/admin/leads/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        }
    );

    console.log("Backend status:", response.status);
    console.log("API_URL:", process.env.API_URL);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}
