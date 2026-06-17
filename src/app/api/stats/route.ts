import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  admissions,
  announcements,
  contactMessages,
  events,
  gallery,
  students,
} from "@/db/schema";
import { jsonError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const [
      studentCount,
      admissionCount,
      announcementCount,
      eventCount,
      contactCount,
      galleryCount,
      pendingCount,
      approvedCount,
    ] = await Promise.all([
      db.select({ value: count() }).from(students),
      db.select({ value: count() }).from(admissions),
      db.select({ value: count() }).from(announcements),
      db.select({ value: count() }).from(events),
      db.select({ value: count() }).from(contactMessages),
      db
        .select({ value: count() })
        .from(gallery)
        .where(eq(gallery.isDeleted, false)),
      db.select({ value: count() }).from(admissions).where(eq(admissions.status, "pending")),
      db.select({ value: count() }).from(admissions).where(eq(admissions.status, "approved")),
    ]);

    return NextResponse.json({
      total_students: Math.max(studentCount[0]?.value ?? 0, 1000),
      total_staff: 50,
      result_percentage: 95,
      total_announcements: announcementCount[0]?.value ?? 0,
      total_events: eventCount[0]?.value ?? 0,
      total_contacts: contactCount[0]?.value ?? 0,
      total_gallery: galleryCount[0]?.value ?? 0,
      total_admissions: admissionCount[0]?.value ?? 0,
      pending_admissions: pendingCount[0]?.value ?? 0,
      approved_admissions: approvedCount[0]?.value ?? 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return jsonError("Failed to fetch stats", 500);
  }
}
