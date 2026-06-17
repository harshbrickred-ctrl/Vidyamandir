import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { jsonError } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const row = await db.query.gallery.findFirst({
      where: and(eq(gallery.id, id), eq(gallery.isDeleted, false)),
    });

    if (!row) return jsonError("Image not found", 404);
    return NextResponse.redirect(row.blobUrl);
  } catch (error) {
    console.error("Gallery image error:", error);
    return jsonError("Failed to retrieve image", 500);
  }
}
