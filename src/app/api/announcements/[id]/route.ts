import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin(_request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { id } = await context.params;
    const result = await db.delete(announcements).where(eq(announcements.id, id)).returning();
    if (result.length === 0) return jsonError("Announcement not found", 404);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return jsonError("Failed to delete announcement", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { id } = await context.params;
    const body = await request.json();
    const update: Partial<typeof announcements.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.title != null) update.title = String(body.title);
    if (body.content != null) update.content = String(body.content);
    if (body.priority != null) update.priority = String(body.priority);

    const result = await db
      .update(announcements)
      .set(update)
      .where(eq(announcements.id, id))
      .returning();
    if (result.length === 0) return jsonError("Announcement not found", 404);
    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("Update announcement error:", error);
    return jsonError("Failed to update announcement", 500);
  }
}
