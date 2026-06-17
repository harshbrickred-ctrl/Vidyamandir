import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { jsonError, mapStudent } from "@/lib/api-helpers";

export async function GET() {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(students)
      .where(
        and(eq(students.birthMonth, now.getMonth() + 1), eq(students.birthDay, now.getDate()))
      )
      .orderBy(asc(students.name))
      .limit(100);

    return NextResponse.json({ birthdays: rows.map(mapStudent) });
  } catch (error) {
    console.error("Birthdays error:", error);
    return jsonError("Failed to fetch birthdays", 500);
  }
}
