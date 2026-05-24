import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("admin_access_token")?.value;

    return NextResponse.json({ accessToken: accessToken ?? null });
}