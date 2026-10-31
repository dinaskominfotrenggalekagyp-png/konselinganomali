import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { isAdminRole, isSuperadminRole } from "@/lib/roles";
import { db } from "@/lib/db";
import {
  formatDate,
  formatDateTime,
  formatIDR,
  STATUS_LABEL,
  STATUS_TONE,
  todayISO,
} from "@/lib/utils";
import { BookingStatusSelect } from "@/components/booking-status-select";

export const dynamic = "force-dynamic";

const DAY_LABEL = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await requireStaff();
  const { error } = await searchParams;
  const canManage = isAdminRole(admin.role);
  if (!canManage) redirect("/admin/booking");
  const today = todayISO();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    pendingCount,
    confirmedCount,
    newMessages,
    userCount,
    resultCount,
    recentBookings,
    paidInvoices,
    topServices,
    messages,
    articleCount,
  ] = await Promise.all([
    db.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { status: "CONFIRMED", date: { gte: today } } }),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.user.count(),
    db.assessmentResult.count(),
    db.booking.findMany({
      include: { service: true, psychologist: true, invoice: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.invoice.findMany({
      where: { status: "PAID", paidAt: { gte: sevenDaysAgo } },
      select: { amount: true, paidAt: true },
    }),
    db.booking.groupBy({
      by: ["serviceId"],
      _count: { _all: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 4,
    }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    db.article.count(),
  ]);

  const revenue = revenueAgg._sum.amount ?? 0;

  const services = await db.service.findMany({
    where: { id: { in: topServices.map((s) => s.serviceId) } },
  });

  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const total = paidInvoices
      .filter((inv) => inv.paidAt?.toISOString().slice(0, 10) === key)
      .reduce((acc, inv) => acc + inv.amount, 0);
    return { key, label: DAY_LABEL[d.getDay()], total };
  });

  const maxRevenue = Math.max(...week.map((w) => w.total), 1);
  const totalWeek = week.reduce((acc, w) => acc + w.total, 0);

  const stats = [
    {
      label: "Total pendapatan",
      value: formatIDR(revenue),
      sub: `${formatIDR(totalWeek)} minggu ini`,
      icon: CircleDollarSign,
      tone: "bg-brand-mint text-brand-dark",
    },
    {
      label: "Booking pending",
      value: String(pendingCount),
      sub: `${confirmedCount} sesi terkonfirmasi`,
      icon: CalendarDays,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pesan baru",
      value: String(newMessages),
      sub: `${messages.length} pesan terbaru`,
      icon: Mail,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Pengguna & asesmen",
      value: `${userCount} / ${resultCount}`,
      sub: `${articleCount} artikel terbit`,
      icon: Users,
      tone: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Admin Console
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[32px]">
            Selamat datang, {admin.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            Ringkasan operasional Konseling Trenggalek ·{" "}
            {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-outline btn-sm w-fit">
          Buka situs publik <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-start justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}>
                <stat.icon className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-3 w-3 text-muted/30" />
            </div>
            <p className="mt-3 font-serif text-[22px] font-semibold leading-tight text-brand-deep">
              {stat.value}
            </p>
            <p className="text-[10.5px] font-medium text-ink/70">{stat.label}</p>
            <p className="text-[9px] text-muted">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Pendapatan 7 hari
              </h2>
              <p className="text-[10px] text-muted">Invoice berstatus lunas</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-brand-mint px-2.5 py-1 text-[9.5px] font-semibold text-brand">
              <TrendingUp className="h-3 w-3" /> {formatIDR(totalWeek)}
            </span>
          </div>

          <div className="mt-6 flex h-[180px] items-end gap-2 sm:gap-3">
            {week.map((day) => (
              <div key={day.key} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      day.total > 0 ? "bg-brand/80 group-hover:bg-brand" : "bg-surface"
                    }`}
                    style={{ height: `${Math.max((day.total / maxRevenue) * 100, 3)}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-deep px-2 py-1 text-[8px] text-white group-hover:block">
                    {formatIDR(day.total)}
                  </span>
                </div>
                <span className="text-[9px] text-muted">{day.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-[9px] text-muted">
            {formatDate(week[0].key, { day: "numeric", month: "short" })} —{" "}
            {formatDate(week[6].key, { day: "numeric", month: "short" })}
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Layanan terpopuler
            </h2>
            <ClipboardList className="h-4 w-4 text-brand/50" />
          </div>
          <div className="mt-4 space-y-3.5">
            {topServices.map((row) => {
              const service = services.find((s) => s.id === row.serviceId);
              const count = row._count._all;
              const max = topServices[0]?._count._all || 1;
              return (
                <div key={row.serviceId}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-medium text-ink">{service?.name ?? "Layanan"}</span>
                    <span className="text-muted">{count} booking</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl bg-brand-mint/60 p-3.5">
            <p className="text-[10px] font-semibold text-brand-deep">Tingkat konversi</p>
            <p className="mt-0.5 font-serif text-2xl font-semibold text-brand-deep">
              68%
            </p>
            <p className="text-[9px] text-muted">
              dari inquiry menjadi sesi terjadwal
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Booking terbaru
            </h2>
            <p className="text-[10px] text-muted">Perubahan status langsung tersimpan</p>
          </div>
          <Link
            href="/admin/booking"
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand hover:underline"
          >
            Kelola semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-surface/60 text-[9px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Kode / Klien</th>
                <th className="px-3 py-2.5 font-semibold">Layanan</th>
                <th className="px-3 py-2.5 font-semibold">Jadwal</th>
                <th className="px-3 py-2.5 font-semibold">Pembayaran</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[11px]">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface/40">
                  <td className="px-5 py-3">
                    <p className="font-mono text-[10px] text-brand-dark">{booking.code}</p>
                    <p className="font-medium text-ink">{booking.guestName}</p>
                    <p className="text-[9px] text-muted">{booking.guestEmail}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{booking.service.name}</p>
                    <p className="text-[9px] text-muted">
                      {booking.psychologist?.name.split(",")[0] ?? "Tim"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-ink">{formatDate(booking.date, { day: "numeric", month: "short" })}</p>
                    <p className="text-[9px] text-muted">
                      {booking.time} · {booking.mode === "ONLINE" ? "Online" : "Offline"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{formatIDR(booking.amount)}</p>
                    <span className={`chip mt-0.5 ring-1 ${STATUS_TONE[booking.paymentStatus]}`}>
                      {STATUS_LABEL[booking.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <BookingStatusSelect bookingId={booking.id} status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Pesan masuk terbaru
            </h2>
            <Link href="/admin/pesan" className="text-[10px] font-semibold text-brand hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-mint text-[10px] font-bold text-brand-dark">
                  {message.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[11.5px] font-medium text-ink">
                      {message.name}
                    </p>
                    <span className={`chip ring-1 ${STATUS_TONE[message.status]}`}>
                      {STATUS_LABEL[message.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-muted">
                    {message.message}
                  </p>
                  <p className="text-[8.5px] text-muted">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Aktivitas sistem
            </h2>
            <span className="flex items-center gap-1 text-[9px] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> live
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {[
              {
                icon: BookOpen,
                title: "Artikel edukasi tersedia",
                desc: `${articleCount} artikel terbit di halaman edukasi`,
                href: isSuperadminRole(admin.role) ? "/admin/artikel" : "/edukasi",
              },
              {
                icon: ClipboardList,
                title: "Asesmen tersimpan",
                desc: `${resultCount} hasil asesmen dari seluruh pengguna`,
                href: "/admin/asesmen",
              },
              {
                icon: Users,
                title: "Basis pengguna",
                desc: `${userCount} akun terdaftar (klien, psikolog & admin)`,
                href: canManage ? "/admin/akun" : "/admin/asesmen",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-start gap-3 rounded-xl border border-line/70 p-3 transition hover:border-brand/25 hover:bg-surface/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-dark">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-ink">{item.title}</p>
                  <p className="text-[9.5px] text-muted">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
