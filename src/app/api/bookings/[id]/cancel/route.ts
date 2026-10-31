import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { logActivity } from "@/lib/integrations";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await db.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    if (booking.userId !== session.sub && !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Jadwal ini tidak dapat dibatalkan" },
        { status: 400 }
      );
    }

    const scheduled = new Date(`${booking.date}T${booking.time}:00`);
    if (scheduled.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Pembatalan hanya bisa dilakukan minimal 24 jam sebelum sesi." },
        { status: 400 }
      );
    }

    await db.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await logActivity(session.sub, "BOOKING_CANCELLED", booking.code);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("cancel error", error);
    return NextResponse.json({ error: "Gagal membatalkan jadwal" }, { status: 500 });
  }
}
