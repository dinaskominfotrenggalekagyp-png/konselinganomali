import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  isAdminRole,
  isStaffRole,
  normalizeRole,
  type Role,
} from "@/lib/roles";

const COOKIE_NAME = "wc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: Role;
};

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "konseling-trenggalek-dev-secret-change-me"
  );
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

/**
 * Dibungkus `cache()` agar layout dan page pada request yang sama berbagi satu
 * query (sebelumnya masing-masing memanggil database sendiri-sendiri).
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/portal");
  return user;
}

/** Semua staf yang boleh membuka admin console. */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStaffRole(user.role)) redirect("/portal");
  return user;
}

/** Super Admin & Admin: untuk pengelolaan data operasional. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminRole(user.role)) redirect("/portal");
  return user;
}

/** Hanya Super Admin: untuk akun, artikel, gambar, dan soal asesmen. */
export async function requireSuperadmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "SUPERADMIN") {
    redirect("/admin?error=Akses+khusus+Super+Admin");
  }
  return user;
}
