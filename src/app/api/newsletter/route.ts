import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await db.newsletter.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ message: "Anda sudah terdaftar. Terima kasih!" });
    }

    await db.newsletter.create({ data: { email } });
    await db.emailLog.create({
      data: {
        to: email,
        subject: "Selamat datang di newsletter Konseling Trenggalek",
        body: "Terima kasih telah berlangganan. Anda akan menerima insight kesehatan mental tiap dua minggu.",
        provider: "system",
        status: "SENT",
      },
    });

    return NextResponse.json({
      message: "Berhasil! Cek inbox Anda untuk konfirmasi.",
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
