import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { moodSchema } from "@/lib/validators";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = moodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data mood tidak valid" }, { status: 400 });
    }

    const date = todayISO();
    const entry = await db.moodEntry.upsert({
      where: { userId_date: { userId: session.sub, date } },
      update: { mood: parsed.data.mood, note: parsed.data.note || null },
      create: {
        userId: session.sub,
        date,
        mood: parsed.data.mood,
        note: parsed.data.note || null,
      },
    });

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    console.error("mood error", error);
    return NextResponse.json({ error: "Gagal menyimpan mood" }, { status: 500 });
  }
}
