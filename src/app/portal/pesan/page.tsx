import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Send,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  effectiveBookingStatus,
  formatDate,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/utils";
import { sendSessionMessageAction } from "@/app/portal/actions";

export const dynamic = "force-dynamic";

export default async function PortalPesanPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireUser();
  const { ok, error } = await searchParams;

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: {
      service: true,
      psychologist: true,
      messages: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Komunikasi
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[32px]">
          Pesan sesi
        </h1>
        <p className="mt-1 text-[12.5px] text-muted">
          Kirim pertanyaan atau catatan untuk sesi Anda tanpa harus kembali ke
          beranda.
        </p>
      </div>

      {ok && (
        <p className="rounded-xl bg-brand-mint px-4 py-3 text-[11px] font-medium text-brand-dark">
          ✓ {ok}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-brand/40" />
          <p className="mt-3 text-[13px] font-medium text-ink">
            Belum ada sesi untuk dipesan
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Buat booking terlebih dahulu, lalu Anda dapat mengirim pesan sesi di
            sini.
          </p>
          <Link href="/klinik" className="btn-primary btn-sm mt-4">
            Cari layanan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = effectiveBookingStatus(
              booking.status,
              booking.date,
              booking.time,
              booking.service.duration
            );

            return (
              <div
                key={booking.id}
                className="rounded-3xl border border-line bg-white p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-lg font-semibold text-brand-deep">
                        {booking.service.name}
                      </h2>
                      <span className={`chip ring-1 ${STATUS_TONE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(booking.date, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span>{booking.time} WIB</span>
                      <span>
                        {booking.psychologist?.name ?? "Psikolog rekomendasi tim"}
                      </span>
                      <span className="font-mono text-[9.5px]">{booking.code}</span>
                    </p>
                  </div>
                  <Link
                    href="/portal/jadwal"
                    className="text-[10px] font-semibold text-brand hover:underline"
                  >
                    Lihat jadwal
                  </Link>
                </div>

                <div className="mt-4 space-y-2.5">
                  {booking.messages.length === 0 ? (
                    <p className="rounded-2xl bg-surface px-4 py-3 text-[10.5px] text-muted">
                      Belum ada pesan. Tulis pesan pertama untuk tim psikolog.
                    </p>
                  ) : (
                    booking.messages.map((message) => {
                      const mine = message.userId === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${
                            mine
                              ? "ml-auto bg-brand-dark text-white"
                              : "bg-brand-mint/70 text-brand-deep"
                          }`}
                        >
                          <p className="text-[8.5px] font-semibold uppercase tracking-wide opacity-70">
                            {mine ? "Anda" : message.user.name}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                          <p className="mt-1 text-[8px] opacity-60">
                            {new Intl.DateTimeFormat("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(message.createdAt)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  action={sendSessionMessageAction}
                  className="mt-4 flex items-end gap-2 border-t border-line pt-3"
                >
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <textarea
                    name="body"
                    required
                    maxLength={2000}
                    rows={2}
                    placeholder="Tulis pesan untuk sesi ini..."
                    className="field resize-none text-[11px]"
                  />
                  <button type="submit" className="btn-primary btn-sm shrink-0">
                    <Send className="h-3.5 w-3.5" /> Kirim
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
