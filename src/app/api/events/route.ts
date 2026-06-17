import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError, mapEvent } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const conditions = [];
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(ilike(events.title, pattern), ilike(events.description, pattern))
      );
    }
    if (category && category !== "all") {
      conditions.push(eq(events.category, category));
    }

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    let query = db.select().from(events).orderBy(desc(events.createdAt)).limit(100);
    if (where) query = query.where(where) as typeof query;

    const rows = await query;

    return NextResponse.json(rows.map(mapEvent));
  } catch (error) {
    console.error("Get events error:", error);
    return jsonError("Failed to fetch events", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const body = await request.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const date = String(body.date || "").trim();
    const category = String(body.category || "general");
    const imageUrl = body.image_url ? String(body.image_url) : null;

    if (!title || !description || !date) {
      return jsonError("Title, description, and date are required");
    }

    const [row] = await db
      .insert(events)
      .values({ title, description, date, category, imageUrl })
      .returning();

    return NextResponse.json(mapEvent(row));
  } catch (error) {
    console.error("Create event error:", error);
    return jsonError("Failed to create event", 500);
  }
}
