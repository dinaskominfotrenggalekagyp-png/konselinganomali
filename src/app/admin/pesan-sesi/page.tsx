import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  CalendarDays,
  MessageCircle,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  effectiveBookingStatus,
  formatDate,
  formatDateTime,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/utils";
import { replySessionMessageAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminPesanSesiPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const { ok, error } = await searchParams;

  const psychologist =
    user.role === "PSYCHOLOGIST"
      ? await db.psychologist.findUnique({
          where: { userId: user.id },
          select: { id: true, name: true },
        })
      : null;

  const where: Prisma.BookingWhereInput =
    user.role === "PSYCHOLOGIST"
      ? { psychologistId: psychologist?.id ?? "__none__" }
      : {};

  const bookings = await db.booking.findMany({
    where,
    include: {
      service: { select: { name: true, duration: true } },
      psychologist: { select: { name: true } },
      user: { select: { name: true, email: true } },
      messages: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 80,
  });

  const threads = [...bookings].sort((a, b) => {
    const lastA = a.messages.at(-1)?.createdAt.getTime() ?? 0;
    const lastB = b.messages.at(-1)?.createdAt.getTime() ?? 0;
    if (lastA !== lastB) return lastB - lastA;
    return `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`);
  });

  const withMessages = threads.filter((thread) => thread.messages.length > 0).length;
  const totalMessages = threads.reduce(
    (acc, thread) => acc + thread.messages.length,
    0
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Komunikasi
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
            Pesan sesi
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            {totalMessages} pesan dalam {withMessages} percakapan
            {psychologist ? ` · ${psychologist.name}` : ""} · balas pertanyaan
            klien tanpa meninggalkan admin console.
          </p>
        </div>
        {psychologist && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-mint px-3 py-1.5 text-[10px] font-semibold text-brand-dark">
            <ShieldCheck className="h-3 w-3" /> Hanya data Anda
          </span>
        )}
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

      {threads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-brand/40" />
          <p className="mt-3 text-[13px] font-medium text-ink">
            Belum ada sesi untuk dipantau
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Percakapan akan muncul setelah klien mengirim pesan dari portal.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((booking) => {
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
                        {booking.guestName}
                      </h2>
                      <span className={`chip ring-1 ${STATUS_TONE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                      {booking.messages.length === 0 && (
                        <span className="chip bg-surface text-[8px] text-muted ring-1 ring-line">
                          belum ada pesan
                        </span>
                      )}
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
                      <span>{booking.service.name}</span>
                      <span>
                        {booking.psychologist?.name ?? "Rekomendasi tim"}
                      </span>
                      <span className="font-mono text-[9.5px]">
                        {booking.code}
                      </span>
                    </p>
                  </div>
                  <Link
                    href="/admin/booking"
                    className="text-[10px] font-semibold text-brand hover:underline"
                  >
                    Kelola booking
                  </Link>
                </div>

                <div className="mt-4 space-y-2.5">
                  {booking.messages.length === 0 ? (
                    <p className="rounded-2xl bg-surface px-4 py-3 text-[10.5px] text-muted">
                      Belum ada pesan pada sesi ini. Anda dapat mengirim pesan
                      pembuka untuk klien.
                    </p>
                  ) : (
                    booking.messages.map((message) => {
                      const staffMessage =
                        message.user.role === "PSYCHOLOGIST" ||
                        message.user.role === "ADMIN" ||
                        message.user.role === "SUPERADMIN";
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${
                            staffMessage
                              ? "ml-auto bg-brand-dark text-white"
                              : "bg-brand-mint/70 text-brand-deep"
                          }`}
                        >
                          <p className="flex items-center gap-1 text-[8.5px] font-semibold uppercase tracking-wide opacity-70">
                            {message.user.name}
                            {staffMessage && (
                              <MessageCircle className="h-2.5 w-2.5" />
                            )}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">
                            {message.body}
                          </p>
                          <p className="mt-1 text-[8px] opacity-60">
                            {formatDateTime(message.createdAt)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  action={replySessionMessageAction}
                  className="mt-4 flex items-end gap-2 border-t border-line pt-3"
                >
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <textarea
                    name="body"
                    required
                    maxLength={2000}
                    rows={2}
                    placeholder="Tulis balasan untuk klien..."
                    className="field resize-none text-[11px]"
                  />
                  <button type="submit" className="btn-primary btn-sm shrink-0">
                    <Send className="h-3.5 w-3.5" /> Balas
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[10.5px] leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Akun psikolog hanya dapat membaca dan membalas percakapan pada booking
          miliknya. Admin dan Super Admin dapat memantau seluruh percakapan.
        </p>
      </div>
    </div>
  );
}
