import { NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError, mapAnnouncement } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let rows;
    if (search) {
      const pattern = `%${search}%`;
      rows = await db
        .select()
        .from(announcements)
        .where(
          or(
            ilike(announcements.title, pattern),
            ilike(announcements.content, pattern)
          )
        )
        .orderBy(desc(announcements.createdAt))
        .limit(100);
    } else {
      rows = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.createdAt))
        .limit(100);
    }

    return NextResponse.json(rows.map(mapAnnouncement));
  } catch (error) {
    console.error("Get announcements error:", error);
    return jsonError("Failed to fetch announcements", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const body = await request.json();
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const priority = String(body.priority || "normal");

    if (!title || !content) return jsonError("Title and content are required");

    const [row] = await db
      .insert(announcements)
      .values({
        title,
        content,
        priority,
        createdBy: auth.user.email,
      })
      .returning();

    return NextResponse.json(mapAnnouncement(row));
  } catch (error) {
    console.error("Create announcement error:", error);
    return jsonError("Failed to create announcement", 500);
  }
}
