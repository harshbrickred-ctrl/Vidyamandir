import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { jsonError, mapGallery } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const conditions = [eq(gallery.isDeleted, false)];
    if (category && category !== "all") {
      conditions.push(eq(gallery.category, category));
    }

    const rows = await db
      .select()
      .from(gallery)
      .where(and(...conditions))
      .orderBy(desc(gallery.createdAt))
      .limit(100);

    return NextResponse.json(rows.map(mapGallery));
  } catch (error) {
    console.error("Get gallery error:", error);
    return jsonError("Failed to fetch gallery", 500);
  }
}
