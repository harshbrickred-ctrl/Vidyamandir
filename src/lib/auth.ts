import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const JWT_ALGORITHM = "HS256";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAccessToken(userId: string, email: string) {
  return new SignJWT({ sub: userId, email, type: "access" })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setExpirationTime("1h")
    .sign(getJwtSecret());
}

export function getTokenFromRequest(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "access" || typeof payload.sub !== "string") return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export type AdminResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; status: number };

export async function requireAdmin(request: Request): Promise<AdminResult> {
  const user = await getCurrentUser(request);
  if (!user) return { ok: false, error: "Not authenticated", status: 401 };
  if (user.role !== "admin") return { ok: false, error: "Admin access required", status: 403 };
  return { ok: true, user };
}

export async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@srtvidyamandir.com")
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!existing) {
    const passwordHash = await hashPassword(adminPassword);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "admin",
    });
    return;
  }

  const valid = await verifyPassword(adminPassword, existing.passwordHash);
  if (!valid) {
    const passwordHash = await hashPassword(adminPassword);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, existing.id));
  }
}
