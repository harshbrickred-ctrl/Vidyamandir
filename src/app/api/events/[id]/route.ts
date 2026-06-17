import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin(_request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { id } = await context.params;
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    if (result.length === 0) return jsonError("Event not found", 404);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    return jsonError("Failed to delete event", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { id } = await context.params;
    const body = await request.json();
    const update: Partial<typeof events.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.title != null) update.title = String(body.title);
    if (body.description != null) update.description = String(body.description);
    if (body.date != null) update.date = String(body.date);
    if (body.category != null) update.category = String(body.category);
    if (body.image_url != null) update.imageUrl = String(body.image_url);

    const result = await db
      .update(events)
      .set(update)
      .where(eq(events.id, id))
      .returning();
    if (result.length === 0) return jsonError("Event not found", 404);
    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("Update event error:", error);
    return jsonError("Failed to update event", 500);
  }
}
