import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return jsonError("Not authenticated", 401);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return jsonError("Authentication check failed", 500);
  }
}
