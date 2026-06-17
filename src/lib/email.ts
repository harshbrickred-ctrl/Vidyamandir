import nodemailer from "nodemailer";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "srtvidyamandir2000@gmail.com").toLowerCase().trim();
}

async function sendSmtp(
  toEmail: string,
  subject: string,
  body: string,
  replyTo?: string
) {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();
  if (!smtpUser || !smtpPassword) {
    throw new Error("SMTP credentials not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser || getAdminEmail(),
    to: toEmail,
    subject,
    text: body,
    replyTo,
  });
}

export async function sendEmail(
  toEmail: string,
  subject: string,
  body: string,
  replyTo?: string
) {
  let status = "mock_sent";

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await sendSmtp(toEmail, subject, body, replyTo);
      status = "sent";
    } else {
      console.warn(`[EMAIL MOCK] To: ${toEmail} | Subject: ${subject}`);
    }
  } catch (error) {
    status = "failed";
    console.error(`Email send failed to ${toEmail}:`, error);
  }

  try {
    await db.insert(emailLogs).values({ to: toEmail, subject, body, status });
  } catch (error) {
    console.error("Failed to log email:", error);
  }

  return status;
}
