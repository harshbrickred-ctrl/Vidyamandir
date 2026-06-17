import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError, mapGallery } from "@/lib/api-helpers";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title")?.trim();
    const category = searchParams.get("category") || "general";
    const description = searchParams.get("description") || "";

    if (!title) return jsonError("Title is required");

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return jsonError("Image file is required");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    if (file.size > MAX_SIZE) {
      return jsonError("File size exceeds 10MB limit");
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const pathname = `gallery/${crypto.randomUUID()}.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    const [row] = await db
      .insert(gallery)
      .values({
        title,
        category,
        description,
        blobUrl: blob.url,
        contentType: file.type,
        size: file.size,
      })
      .returning();

    return NextResponse.json(mapGallery(row));
  } catch (error) {
    console.error("Gallery upload error:", error);
    const message =
      error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")
        ? "Gallery storage is not configured. Set BLOB_READ_WRITE_TOKEN in environment variables."
        : "Failed to upload image";
    return jsonError(message, 500);
  }
}
