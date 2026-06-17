import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createAccessToken,
  ensureAdminUser,
  verifyPassword,
} from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    await ensureAdminUser();
    const body = await request.json();
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await createAccessToken(user.id, user.email);
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    });

    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return jsonError("Login failed", 500);
  }
}
