import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${process.env.API_URL}/admin/leads/export`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const blob = await res.blob();

    return new NextResponse(blob, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=leads.csv",
        },
    });
}