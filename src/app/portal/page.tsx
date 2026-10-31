import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  Download,
  HeartPulse,
  MapPin,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  effectiveBookingStatus,
  formatDate,
  formatIDR,
  MOOD_LABEL,
  moodEmoji,
  STATUS_LABEL,
  STATUS_TONE,
  todayISO,
} from "@/lib/utils";
import { MoodCheckin } from "@/components/mood-checkin";
import { PayInvoiceButton } from "@/components/pay-invoice-button";
import { sendSessionMessageAction } from "@/app/portal/actions";

export const dynamic = "force-dynamic";

export default async function PortalDashboard() {
  const user = await requireUser();
  const today = todayISO();

  const [upcoming, results, moods, unpaid, articles, completedCount, assessmentCount] =
    await Promise.all([
      db.booking.findMany({
        where: {
          userId: user.id,
          date: { gte: today },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: { service: true, psychologist: true, invoice: true },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        take: 3,
      }),
      db.assessmentResult.findMany({
        where: { userId: user.id },
        include: { assessment: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      db.moodEntry.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 7,
      }),
      db.invoice.findMany({
        where: { booking: { userId: user.id }, status: "UNPAID" },
        include: { booking: { include: { service: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 2,
      }),
      db.booking.count({ where: { userId: user.id, status: "COMPLETED" } }),
      db.assessmentResult.count({ where: { userId: user.id } }),
    ]);

  const next = upcoming[0];
  const nextStatus = next
    ? effectiveBookingStatus(
        next.status,
        next.date,
        next.time,
        next.service.duration
      )
    : null;
  const todayMood = moods.find((m) => m.date === today) ?? null;
  const firstName = user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
  const moodAvg = moods.length
    ? (moods.reduce((acc, m) => acc + m.mood, 0) / moods.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            {formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[34px]">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 text-[12.5px] text-muted">
            Ini ringkasan perjalanan wellness Anda hari ini.
          </p>
        </div>
        <Link href="/klinik" className="btn-primary btn-sm w-fit">
          <CalendarPlus className="h-3.5 w-3.5" /> Pesan sesi baru
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Sesi mendatang",
            value: upcoming.length,
            sub: next ? formatDate(next.date, { day: "numeric", month: "short" }) : "Belum ada",
            icon: CalendarDays,
          },
          {
            label: "Sesi selesai",
            value: completedCount,
            sub: "sepanjang waktu",
            icon: HeartPulse,
          },
          {
            label: "Asesmen",
            value: assessmentCount,
            sub: "hasil tersimpan",
            icon: ClipboardList,
          },
          {
            label: "Rata-rata mood",
            value: moodAvg,
            sub: "7 check-in terakhir",
            icon: Sparkles,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mint text-brand-dark">
                <stat.icon className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted/30" />
            </div>
            <p className="mt-3 font-serif text-[26px] font-semibold leading-none text-brand-deep">
              {stat.value}
            </p>
            <p className="mt-1 text-[10.5px] font-medium text-ink/70">{stat.label}</p>
            <p className="text-[9.5px] text-muted">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {next ? (
            <div className="relative overflow-hidden rounded-3xl bg-brand-deep p-5 text-white sm:p-6">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 90% 10%, #7dd3fc 0, transparent 40%), radial-gradient(circle at 5% 100%, #0ea5e9 0, transparent 45%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-brand-accent">
                    Sesi berikutnya
                  </p>
                  <span
                    className={`chip ring-1 ${
                      next.status === "CONFIRMED"
                        ? "bg-brand-accent/20 text-brand-accent ring-brand-accent/30"
                        : "bg-white/10 text-white/70 ring-white/20"
                    }`}
                  >
                    {STATUS_LABEL[next.status]}
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                    <span className="text-[9px] uppercase text-white/50">
                      {formatDate(next.date, { month: "short" })}
                    </span>
                    <span className="font-serif text-xl font-semibold leading-none">
                      {next.date.split("-")[2]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif text-xl font-semibold leading-tight">
                      {next.service.name}
                    </h2>
                    <p className="mt-0.5 text-[11.5px] text-white/60">
                      {next.psychologist?.name ?? "Psikolog rekomendasi tim"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-white/60">
                      <span>
                        {formatDate(next.date)} · {next.time} WIB
                      </span>
                      <span className="flex items-center gap-1">
                        {next.mode === "ONLINE" ? (
                          <>
                            <Video className="h-3 w-3" /> Online
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3" /> Tatap muka
                          </>
                        )}
                      </span>
                      <span className="font-mono text-white/40">{next.code}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {next.mode === "ONLINE" ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-brand-accent pl-4 pr-4 py-2.5 text-[11px] font-semibold text-brand-deep opacity-70"
                      title="Tautan aktif 15 menit sebelum sesi"
                    >
                      <Video className="h-3.5 w-3.5" /> Gabung sesi
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-[11px] font-medium text-white/70">
                      <MapPin className="h-3.5 w-3.5" /> Klinik Trenggalek
                    </span>
                  )}
                  <a
                    href={`/api/appointments/${next.id}/ics`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2.5 text-[11px] font-medium text-white transition hover:bg-white/10"
                  >
                    <Download className="h-3.5 w-3.5" /> Simpan ke kalender
                  </a>
                  <Link
                    href="/portal/jadwal"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2.5 text-[11px] font-medium text-white transition hover:bg-white/10"
                  >
                    Detail jadwal
                  </Link>
                </div>

                {next.status === "PENDING" && (
                  <p className="mt-3 rounded-xl bg-amber-400/15 px-3 py-2 text-[10px] text-amber-100">
                    Menunggu konfirmasi admin. Anda akan menerima email setelah jadwal
                    dikonfirmasi.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-brand/25 bg-white p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint text-brand">
                <CalendarPlus className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-serif text-lg font-semibold text-brand-deep">
                Belum ada sesi mendatang
              </h2>
              <p className="mx-auto mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted">
                Mulai dengan asesmen gratis atau langsung pilih psikolog yang sesuai.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/klinik" className="btn-primary btn-sm">
                  Cari psikolog
                </Link>
                <Link href="/psikotes" className="btn-outline btn-sm">
                  Ikuti asesmen
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Asesmen terakhir
              </h2>
              <Link
                href="/portal/asesmen"
                className="text-[10.5px] font-semibold text-brand hover:underline"
              >
                Lihat semua
              </Link>
            </div>

            {results.length === 0 ? (
              <p className="mt-3 rounded-xl bg-surface px-4 py-6 text-center text-[11.5px] text-muted">
                Belum ada hasil asesmen.{" "}
                <Link href="/psikotes" className="font-semibold text-brand">
                  Mulai sekarang
                </Link>
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/psikotes/hasil/${result.id}`}
                    className="flex items-center justify-between rounded-xl border border-line/70 px-3.5 py-3 transition hover:border-brand/25 hover:bg-surface/50"
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-ink">
                        {result.assessment.title}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatDate(result.createdAt, { day: "numeric", month: "short" })} ·{" "}
                        {result.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-semibold text-brand-dark">
                        {result.score}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-brand/40" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/edukasi/${article.slug}`}
                className="group flex gap-3 rounded-2xl border border-line bg-white p-3 transition hover:border-brand/25 hover:shadow-soft"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={article.cover} alt={article.title} fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand">
                    {article.category}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[11px] font-semibold leading-snug text-ink">
                    {article.title}
                  </span>
                  <span className="mt-1 block text-[9.5px] text-muted">
                    {article.readMinutes} menit baca
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-brand-deep">
                  Check-in hari ini
                </h2>
                <p className="text-[10px] text-muted">
                  Bagaimana perasaan Anda?
                </p>
              </div>
              <span className="text-2xl">{todayMood ? moodEmoji(todayMood.mood) : "🫧"}</span>
            </div>

            <div className="mt-3">
              <MoodCheckin
                current={todayMood ? { mood: todayMood.mood, note: todayMood.note } : null}
              />
            </div>

            {moods.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  7 hari terakhir
                </p>
                <div className="mt-2 flex items-end justify-between gap-1">
                  {[...moods].reverse().map((m) => (
                    <div key={m.id} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-brand/70"
                        style={{ height: `${m.mood * 7}px` }}
                        title={`${m.date}: ${MOOD_LABEL[m.mood - 1]}`}
                      />
                      <span className="text-[8px] text-muted">
                        {m.date.slice(8, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Tagihan
              </h2>
              <CreditCard className="h-4 w-4 text-brand/50" />
            </div>

            {unpaid.length === 0 ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-mint/60 px-3.5 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand">
                  ✓
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-brand-deep">
                    Semua tagihan lunas
                  </p>
                  <p className="text-[9.5px] text-muted">Terima kasih!</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {unpaid.slice(0, 2).map((inv) => (
                  <div key={inv.id} className="rounded-xl bg-surface p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-ink">
                          {inv.booking.service.name}
                        </p>
                        <p className="text-[9.5px] text-muted">
                          {inv.number} · {formatDate(inv.booking.date, { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-brand-dark">
                        {formatIDR(inv.amount)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`chip ring-1 ${STATUS_TONE.UNPAID}`}>
                        Belum dibayar
                      </span>
                      <PayInvoiceButton
                        invoiceId={inv.id}
                        amount={inv.amount}
                        number={inv.number}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/portal/tagihan"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[10.5px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
            >
              Lihat semua tagihan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl bg-brand-mint/60 p-5">
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="mt-2 font-serif text-lg font-semibold leading-snug text-brand-deep">
              Butuh teman bicara hari ini?
            </h2>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              Sesi darurat 30 menit tersedia dengan psikolog jaga, tanpa perlu jadwal
              panjang.
            </p>
            <Link href="/kontak" className="btn-primary btn-sm mt-3 w-full">
              Hubungi layanan darurat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
