import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema, fieldErrors } from "@/lib/validators";
import { logActivity } from "@/lib/integrations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data pendaftaran belum lengkap", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;
    const normalized = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk." },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        name,
        email: normalized,
        phone: phone || null,
        passwordHash: await hashPassword(password),
        role: "CLIENT",
      },
    });

    await createSession({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: "CLIENT",
    });

    await logActivity(user.id, "REGISTER", user.email);

    return NextResponse.json({ ok: true, redirect: "/portal" }, { status: 201 });
  } catch (error) {
    console.error("register error", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
