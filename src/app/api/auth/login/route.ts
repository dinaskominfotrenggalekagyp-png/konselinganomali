import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema, fieldErrors } from "@/lib/validators";
import { logActivity } from "@/lib/integrations";
import { isStaffRole, normalizeRole } from "@/lib/roles";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const role = normalizeRole(user.role);

    await createSession({
      sub: user.id,
      name: user.name,
      email: user.email,
      role,
    });

    await logActivity(user.id, "LOGIN", `${user.email} · ${role}`);

    return NextResponse.json({
      ok: true,
      role,
      redirect:
        role === "PSYCHOLOGIST"
          ? "/admin/booking"
          : isStaffRole(role)
            ? "/admin"
            : "/portal",
    });
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
