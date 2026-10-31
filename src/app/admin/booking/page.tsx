import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowRight, Download, Search } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  effectiveBookingStatus,
  formatDate,
  formatIDR,
  formatMonth,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/utils";
import { isAdminRole, isStaffRole } from "@/lib/roles";
import { BookingStatusSelect } from "@/components/booking-status-select";
import { BookingMonthFilter } from "@/components/booking-month-filter";
import {
  DeleteBookingButton,
  MarkPaidButton,
} from "@/components/booking-actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Terkonfirmasi" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "CANCELLED", label: "Dibatalkan" },
];

export default async function AdminBookingPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    month?: string;
    page?: string;
  }>;
}) {
  const user = await requireStaff();
  const canManage = isAdminRole(user.role);
  const canEditStatus = isStaffRole(user.role);

  const {
    status = "ALL",
    q = "",
    month: rawMonth = "",
    page = "1",
  } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : "";

  const psychologist =
    user.role === "PSYCHOLOGIST"
      ? await db.psychologist.findUnique({
          where: { userId: user.id },
          select: { id: true, name: true },
        })
      : null;

  const pageNumber = Math.max(1, Number(page) || 1);
  const perPage = 15;

  const where: Prisma.BookingWhereInput = {
    ...(status !== "ALL" ? { status } : {}),
    ...(month ? { date: { startsWith: month } } : {}),
    ...(user.role === "PSYCHOLOGIST"
      ? { psychologistId: psychologist?.id ?? "__none__" }
      : {}),
    ...(q
      ? {
          OR: [
            { guestName: { contains: q } },
            { guestEmail: { contains: q } },
            { code: { contains: q } },
          ],
        }
      : {}),
  };

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      include: { service: true, psychologist: true, invoice: true },
      orderBy: [{ date: "desc" }, { time: "desc" }],
      skip: (pageNumber - 1) * perPage,
      take: perPage,
    }),
    db.booking.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  function bookingHref(next: {
    status?: string;
    month?: string;
    q?: string;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? status;
    const nextMonth = next.month ?? month;
    const nextQuery = next.q ?? q;
    const nextPage = next.page ?? 1;

    if (nextStatus && nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextMonth) params.set("month", nextMonth);
    if (nextQuery) params.set("q", nextQuery);
    if (nextPage > 1) params.set("page", String(nextPage));

    const query = params.toString();
    return `/admin/booking${query ? `?${query}` : ""}`;
  }

  const exportHref = `/api/admin/bookings/export?status=${encodeURIComponent(
    status
  )}&q=${encodeURIComponent(q)}&month=${encodeURIComponent(month)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Operasional
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
            {user.role === "PSYCHOLOGIST" ? "Booking saya" : "Manajemen booking"}
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            {total} booking · {month ? `periode ${formatMonth(month)}` : "semua periode"}
            {psychologist ? ` · ${psychologist.name}` : ""} · ubah status untuk
            mengonfirmasi, menolak, atau menutup sesi.
          </p>
        </div>
        <a href={exportHref} className="btn-outline btn-sm w-fit">
          <Download className="h-3.5 w-3.5" /> Export Excel{" "}
          {month ? `· ${formatMonth(month)}` : "· semua periode"}
        </a>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter) => (
              <Link
                key={filter.key}
                href={bookingHref({ status: filter.key })}
                className={`rounded-full px-3 py-1.5 text-[10.5px] font-medium transition ${
                  status === filter.key
                    ? "bg-brand-dark text-white"
                    : "bg-surface text-ink/60 hover:text-brand-dark"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          <form
            className="relative w-full sm:w-64"
            action="/admin/booking"
          >
            <input type="hidden" name="status" value={status} />
            {month && <input type="hidden" name="month" value={month} />}
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama, email, atau kode..."
              className="field py-2 pl-9 text-[11px]"
            />
          </form>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
          <BookingMonthFilter value={month} status={status} q={q} />

          <p className="text-[10px] text-muted">
            Pilih bulan, lalu tombol Export Excel otomatis mengikuti periode,
            status, dan pencarian yang aktif.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-surface/70 text-[9px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-3 py-3 font-semibold">Klien</th>
                <th className="px-3 py-3 font-semibold">Layanan / Psikolog</th>
                <th className="px-3 py-3 font-semibold">Jadwal</th>
                <th className="px-3 py-3 font-semibold">Nominal</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Invoice</th>
                <th className="px-3 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[11px]">
              {bookings.map((booking) => {
                const effective = effectiveBookingStatus(
                  booking.status,
                  booking.date,
                  booking.time,
                  booking.service.duration
                );

                return (
                  <tr key={booking.id} className="align-top hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-mono text-[10px] font-semibold text-brand-dark">
                        {booking.code}
                      </p>
                      <p className="mt-0.5 text-[9px] text-muted">
                        {formatDate(booking.createdAt, {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{booking.guestName}</p>
                      <p className="text-[9px] text-muted">{booking.guestEmail}</p>
                      <p className="text-[9px] text-muted">{booking.guestPhone}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{booking.service.name}</p>
                      <p className="text-[9px] text-muted">
                        {booking.psychologist?.name ?? "Rekomendasi tim"}
                      </p>
                      <span className="mt-0.5 inline-block rounded bg-surface px-1.5 py-0.5 text-[8px] text-muted">
                        {booking.mode === "ONLINE" ? "Online" : "Tatap muka"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-ink">
                        {formatDate(booking.date, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[9px] text-muted">{booking.time} WIB</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{formatIDR(booking.amount)}</p>
                      <span
                        className={`chip mt-0.5 ring-1 ${STATUS_TONE[booking.paymentStatus]}`}
                      >
                        {STATUS_LABEL[booking.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {effective === "ONGOING" ? (
                        <span
                          className={`chip ring-1 ${STATUS_TONE.ONGOING}`}
                          title="Sesi sedang berlangsung pada jam ini"
                        >
                          {STATUS_LABEL.ONGOING}
                        </span>
                      ) : canEditStatus ? (
                        <BookingStatusSelect
                          bookingId={booking.id}
                          status={booking.status}
                        />
                      ) : (
                        <span className={`chip ring-1 ${STATUS_TONE[booking.status]}`}>
                          {STATUS_LABEL[booking.status]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {booking.invoice ? (
                        <Link
                          href={`/portal/tagihan/${booking.invoice.id}`}
                          className="inline-flex items-center gap-1 text-[9.5px] font-medium text-brand hover:underline"
                        >
                          {booking.invoice.number}
                          <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {canManage && booking.paymentStatus !== "PAID" && (
                          <MarkPaidButton bookingId={booking.id} />
                        )}
                        {canManage && (
                          <DeleteBookingButton
                            bookingId={booking.id}
                            code={booking.code}
                          />
                        )}
                        {!canManage && (
                          <span className="text-[9px] text-muted">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[11px] text-muted">
                    Tidak ada booking yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[10px] text-muted">
            <span>
              Halaman {pageNumber} dari {pages}
            </span>
            <div className="flex gap-2">
              {pageNumber > 1 && (
                <Link
                  href={bookingHref({ page: pageNumber - 1 })}
                  className="rounded-lg border border-line px-2.5 py-1.5 hover:text-brand"
                >
                  Sebelumnya
                </Link>
              )}
              {pageNumber < pages && (
                <Link
                  href={bookingHref({ page: pageNumber + 1 })}
                  className="rounded-lg border border-line px-2.5 py-1.5 hover:text-brand"
                >
                  Berikutnya
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
