import { NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getAdminEmail, sendEmail } from "@/lib/email";
import { jsonError, mapContact } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let rows;
    if (search) {
      const pattern = `%${search}%`;
      rows = await db
        .select()
        .from(contactMessages)
        .where(
          or(
            ilike(contactMessages.name, pattern),
            ilike(contactMessages.email, pattern),
            ilike(contactMessages.subject, pattern)
          )
        )
        .orderBy(desc(contactMessages.submittedAt))
        .limit(500);
    } else {
      rows = await db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.submittedAt))
        .limit(500);
    }

    return NextResponse.json(rows.map(mapContact));
  } catch (error) {
    console.error("Get contacts error:", error);
    return jsonError("Failed to fetch contact messages", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!name || !email || !subject || !message) {
      return jsonError("Name, email, subject, and message are required");
    }

    const [row] = await db
      .insert(contactMessages)
      .values({ name, email, phone, subject, message })
      .returning();

    await sendEmail(
      email,
      "Message Received - S.R.T. Vidyamandir",
      `Dear ${name},\n\nThank you for contacting S.R.T. Vidyamandir. We have received your message regarding "${subject}" and will respond as soon as possible.\n\nBest regards,\nS.R.T. Vidyamandir`
    );

    await sendEmail(
      getAdminEmail(),
      `New Contact Message - ${subject}`,
      `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nSubject: ${subject}\n\nMessage:\n${message}`,
      email
    );

    return NextResponse.json(mapContact(row));
  } catch (error) {
    console.error("Submit contact error:", error);
    return jsonError("Failed to send message", 500);
  }
}
