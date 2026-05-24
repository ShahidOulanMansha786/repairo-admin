// lib/auth.ts
import { cookies } from "next/headers";

export async function getAdminToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("admin_access_token")?.value;
}