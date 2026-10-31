import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Clock,
  Download,
  MapPin,
  MessageCircle,
  Video,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  effectiveBookingStatus,
  formatDate,
  formatIDR,
  STATUS_LABEL,
  STATUS_TONE,
  todayISO,
} from "@/lib/utils";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const dynamic = "force-dynamic";

export default async function PortalJadwalPage() {
  const user = await requireUser();
  const today = todayISO();

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: { service: true, psychologist: true, invoice: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });

  const upcoming = bookings
    .filter(
      (b) =>
        b.date >= today &&
        ["PENDING", "CONFIRMED", "ONGOING"].includes(b.status)
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Jadwal Sesi
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[32px]">
            Agenda konseling Anda
          </h1>
          <p className="mt-1 text-[12.5px] text-muted">
            Kelola sesi mendatang, unduh kalender, atau pesan jadwal baru.
          </p>
        </div>
        <Link href="/klinik" className="btn-primary btn-sm w-fit">
          <CalendarPlus className="h-3.5 w-3.5" /> Pesan sesi
        </Link>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-brand-deep">
            Akan datang
          </h2>
          <span className="chip bg-brand-mint text-brand">
            {upcoming.length} sesi
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
            <CalendarDays className="mx-auto h-7 w-7 text-brand/40" />
            <p className="mt-2 text-[12px] font-medium text-ink">
              Tidak ada sesi mendatang
            </p>
            <p className="mt-0.5 text-[10.5px] text-muted">
              Pilih layanan dan jadwal yang sesuai dengan Anda.
            </p>
            <Link href="/klinik" className="btn-primary btn-sm mt-3">
              Cari layanan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {upcoming.map((booking) => {
              const scheduled = new Date(`${booking.date}T${booking.time}:00+07:00`);
              const canCancel = scheduled.getTime() - Date.now() > 24 * 3600 * 1000;
              const status = effectiveBookingStatus(
                booking.status,
                booking.date,
                booking.time,
                booking.service.duration
              );

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-line/80 p-4 transition hover:border-brand/20"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-mint text-brand-deep">
                      <span className="text-[9px] font-semibold uppercase">
                        {formatDate(booking.date, { month: "short" })}
                      </span>
                      <span className="font-serif text-2xl font-semibold leading-none">
                        {booking.date.split("-")[2]}
                      </span>
                      <span className="text-[9px]">{booking.time}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[13px] font-semibold text-ink">
                          {booking.service.name}
                        </h3>
                        <span className={`chip ring-1 ${STATUS_TONE[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                        <span
                          className={`chip ring-1 ${
                            booking.paymentStatus === "PAID"
                              ? STATUS_TONE.PAID
                              : STATUS_TONE.UNPAID
                          }`}
                        >
                          {STATUS_LABEL[booking.paymentStatus]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {booking.psychologist?.name ?? "Psikolog rekomendasi tim"} ·{" "}
                        {formatDate(booking.date, { weekday: "long" })} · {booking.time} WIB
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-muted">
                        <span className="flex items-center gap-1">
                          {booking.mode === "ONLINE" ? (
                            <>
                              <Video className="h-3 w-3" /> Online
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3" /> Klinik Trenggalek
                            </>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {booking.service.duration} menit
                        </span>
                        <span className="font-mono text-[9.5px]">{booking.code}</span>
                        <span className="font-semibold text-brand-dark">
                          {formatIDR(booking.amount)}
                        </span>
                      </div>
                      {booking.notes && (
                        <p className="mt-2 rounded-lg bg-surface px-2.5 py-2 text-[10px] leading-relaxed text-muted">
                          Catatan: {booking.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                      <a
                        href={`/api/appointments/${booking.id}/ics`}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
                      >
                        <Download className="h-3 w-3" /> ICS
                      </a>
                      <Link
                        href="/portal/pesan"
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
                      >
                        <MessageCircle className="h-3 w-3" /> Pesan
                      </Link>
                      {booking.paymentStatus === "UNPAID" && (
                        <Link
                          href="/portal/tagihan"
                          className="text-[10px] font-semibold text-brand hover:underline"
                        >
                          Bayar tagihan
                        </Link>
                      )}
                      {canCancel && (
                        <CancelBookingButton bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-serif text-lg font-semibold text-brand-deep">
          Riwayat sesi
        </h2>
        <p className="text-[10.5px] text-muted">
          Termasuk sesi selesai, dibatalkan, dan yang sudah lewat.
        </p>

        {past.length === 0 ? (
          <p className="mt-4 rounded-xl bg-surface px-4 py-6 text-center text-[11px] text-muted">
            Belum ada riwayat sesi.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-line">
            {past.map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-brand-dark">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-ink">
                    {booking.service.name}
                  </p>
                  <p className="text-[10px] text-muted">
                    {formatDate(booking.date)} · {booking.time} ·{" "}
                    {booking.psychologist?.name.split(",")[0] ?? "Tim Konseling Trenggalek"}
                  </p>
                </div>
                <span
                  className={`chip ring-1 ${
                    STATUS_TONE[
                      effectiveBookingStatus(
                        booking.status,
                        booking.date,
                        booking.time,
                        booking.service.duration
                      )
                    ]
                  }`}
                >
                  {
                    STATUS_LABEL[
                      effectiveBookingStatus(
                        booking.status,
                        booking.date,
                        booking.time,
                        booking.service.duration
                      )
                    ]
                  }
                </span>
                <span className="hidden text-[10px] text-muted sm:block">
                  {formatIDR(booking.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-[10.5px] leading-relaxed text-amber-900">
        <strong>Kebijakan reschedule:</strong> gratis hingga 24 jam sebelum sesi.
        Pembatalan kurang dari 24 jam dikenakan biaya administrasi 25% dari harga
        layanan.
      </div>
    </div>
  );
}
