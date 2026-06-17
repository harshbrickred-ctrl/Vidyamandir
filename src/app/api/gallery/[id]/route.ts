import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin(_request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { id } = await context.params;
    const result = await db
      .update(gallery)
      .set({ isDeleted: true })
      .where(eq(gallery.id, id))
      .returning();

    if (result.length === 0) return jsonError("Gallery item not found", 404);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete gallery error:", error);
    return jsonError("Failed to delete gallery item", 500);
  }
}
