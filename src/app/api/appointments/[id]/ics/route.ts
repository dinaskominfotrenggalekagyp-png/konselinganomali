import { db } from "@/lib/db";
import { buildICS } from "@/lib/integrations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: { service: true, psychologist: true },
  });

  if (!booking) {
    return new Response("Booking tidak ditemukan", { status: 404 });
  }

  const ics = buildICS({
    code: booking.code,
    title: `${booking.service.name} — Konseling Trenggalek`,
    description: [
      `Kode booking: ${booking.code}`,
      booking.psychologist ? `Psikolog: ${booking.psychologist.name}` : "",
      `Mode: ${booking.mode === "ONLINE" ? "Online (video call)" : "Tatap muka"}`,
      booking.notes ? `Catatan: ${booking.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    date: booking.date,
    time: booking.time,
    durationMinutes: booking.service.duration,
    location:
      booking.mode === "ONLINE"
        ? "Online — tautan dikirim sebelum sesi"
        : "Jl. Raya Trenggalek No. 123, Trenggalek",
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="konselingtrenggalek-${booking.code}.ics"`,
    },
  });
}
