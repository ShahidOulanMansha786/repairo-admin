import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const period = req.nextUrl.searchParams.get("period");
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // Build query params dynamically
    const params = new URLSearchParams();

    if (period) {
        params.set("period", period);
    }

    if (startDate) {
        params.set("startDate", startDate);
    }

    if (endDate) {
        params.set("endDate", endDate);
    }

    const res = await fetch(
        `${process.env.API_URL}/admin/analytics/export?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return NextResponse.json(
            { error: "Export failed" },
            { status: res.status }
        );
    }

    const csvBuffer = await res.arrayBuffer();

    let filename = "analytics-trend.csv";

    if (period) {
        filename = `analytics-trend-${period.toLowerCase()}.csv`;
    } else if (startDate && endDate) {
        filename = `analytics-trend-${startDate}-to-${endDate}.csv`;
    }

    return new NextResponse(csvBuffer, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=${filename}`,
        },
    });
}