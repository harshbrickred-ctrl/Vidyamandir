import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { admissions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getAdminEmail, sendEmail } from "@/lib/email";
import { jsonError, mapAdmission } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const classFilter = searchParams.get("class_filter");

    const conditions = [];
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(admissions.studentName, pattern),
          ilike(admissions.parentName, pattern),
          ilike(admissions.email, pattern),
          ilike(admissions.phone, pattern)
        )
      );
    }
    if (status && status !== "all") conditions.push(eq(admissions.status, status));
    if (classFilter && classFilter !== "all") {
      conditions.push(eq(admissions.classApplying, classFilter));
    }

    const where = conditions.length > 1 ? and(...conditions) : conditions[0];

    let query = db.select().from(admissions).orderBy(desc(admissions.submittedAt)).limit(500);
    if (where) query = query.where(where) as typeof query;

    const rows = await query;

    return NextResponse.json(rows.map(mapAdmission));
  } catch (error) {
    console.error("Get admissions error:", error);
    return jsonError("Failed to fetch admissions", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const [row] = await db
      .insert(admissions)
      .values({
        studentName: String(body.student_name || "").trim(),
        parentName: String(body.parent_name || "").trim(),
        email: String(body.email || "").trim(),
        phone: String(body.phone || "").trim(),
        dateOfBirth: String(body.date_of_birth || "").trim(),
        gender: String(body.gender || "").trim(),
        address: String(body.address || "").trim(),
        previousSchool: body.previous_school ? String(body.previous_school) : null,
        classApplying: String(body.class_applying || "").trim(),
        stream: body.stream ? String(body.stream) : null,
        additionalInfo: body.additional_info ? String(body.additional_info) : null,
      })
      .returning();

    const mapped = mapAdmission(row);

    await sendEmail(
      row.email,
      "Application Received - S.R.T. Vidyamandir",
      `Dear ${row.parentName},\n\nThank you for submitting an admission application for ${row.studentName} to S.R.T. Vidyamandir High School & Junior College.\n\nClass Applied: ${row.classApplying}\nApplication ID: ${row.id}\n\nYour application is currently under review. We will contact you soon regarding the next steps.\n\nBest regards,\nS.R.T. Vidyamandir Admissions Team`
    );

    await sendEmail(
      getAdminEmail(),
      `New Admission Application - ${row.studentName}`,
      `A new admission application has been received:\n\nApplication ID: ${row.id}\nStudent Name: ${row.studentName}\nParent/Guardian: ${row.parentName}\nEmail: ${row.email}\nPhone: ${row.phone}\nDate of Birth: ${row.dateOfBirth}\nGender: ${row.gender}\nClass Applying: ${row.classApplying}\nPrevious School: ${row.previousSchool || "N/A"}\nAddress: ${row.address}\nAdditional Info: ${row.additionalInfo || "N/A"}\n\nPlease review the application in the admin dashboard.`,
      row.email
    );

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Submit admission error:", error);
    return jsonError("Failed to submit application", 500);
  }
}
