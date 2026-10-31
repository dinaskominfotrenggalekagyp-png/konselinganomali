import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, moodEmoji, MOOD_LABEL } from "@/lib/utils";
import { isSuperadminRole } from "@/lib/roles";
import { toggleAssessmentAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminAsesmenPage({
  searchParams,
}: {
  searchParams: Promise<{ assessment?: string; ok?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const { assessment = "ALL", ok, error } = await searchParams;
  const isSuperadmin = isSuperadminRole(user.role);

  const psychologist =
    user.role === "PSYCHOLOGIST"
      ? await db.psychologist.findUnique({
          where: { userId: user.id },
          select: { id: true, name: true },
        })
      : null;

  const scopedBookings = psychologist
    ? await db.booking.findMany({
        where: { psychologistId: psychologist.id, userId: { not: null } },
        select: { userId: true },
        distinct: ["userId"],
      })
    : null;

  const clientIds = scopedBookings
    ? scopedBookings
        .map((row) => row.userId)
        .filter((id): id is string => Boolean(id))
    : null;

  const scopeWhere = clientIds ? { userId: { in: clientIds } } : {};

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [assessments, participationRows, results, totalResults, weekResults, moods] =
    await Promise.all([
      db.assessment.findMany({ orderBy: { title: "asc" } }),
      db.assessmentResult.groupBy({
        by: ["assessmentId"],
        where: scopeWhere,
        _count: { _all: true },
      }),
      db.assessmentResult.findMany({
        where: {
          ...scopeWhere,
          ...(assessment === "ALL" ? {} : { assessmentId: assessment }),
        },
        include: {
          assessment: { select: { title: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      db.assessmentResult.count({ where: scopeWhere }),
      db.assessmentResult.count({
        where: { ...scopeWhere, createdAt: { gte: sevenDaysAgo } },
      }),
      db.moodEntry.groupBy({
        by: ["mood"],
        where: clientIds ? { userId: { in: clientIds } } : {},
        _count: { _all: true },
      }),
    ]);

  const participation = new Map(
    participationRows.map((row) => [row.assessmentId, row._count._all])
  );
  const countFor = (id: string) => participation.get(id) ?? 0;

  const filteredTotal =
    assessment === "ALL" ? totalResults : countFor(assessment);

  const avgScore =
    results.length > 0
      ? Math.round(
          (results.reduce((acc, item) => acc + item.score, 0) / results.length) * 10
        ) / 10
      : 0;

  const maxCount = Math.max(
    ...assessments.map((item) => countFor(item.id)),
    1
  );

  const categoryCounts = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const categoryRows = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const moodTotal = moods.reduce((acc, row) => acc + row._count._all, 0);
  const moodAverage =
    moodTotal > 0
      ? Math.round(
          (moods.reduce((acc, row) => acc + row.mood * row._count._all, 0) / moodTotal) * 10
        ) / 10
      : 0;

  const stats = [
    {
      label: "Total hasil asesmen",
      value: totalResults.toLocaleString("id-ID"),
      sub: `${assessments.length} instrumen tersedia`,
      icon: ClipboardList,
      tone: "bg-brand-mint text-brand-dark",
    },
    {
      label: "7 hari terakhir",
      value: weekResults.toLocaleString("id-ID"),
      sub: "hasil masuk baru",
      icon: TrendingUp,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Rata-rata skor",
      value: String(avgScore),
      sub: assessment === "ALL" ? "dari hasil terbaru" : "pada filter aktif",
      icon: BarChart3,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Mood check-in",
      value: `${moodTotal}`,
      sub: `rata-rata ${moodAverage || "-"} / 5`,
      icon: Activity,
      tone: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Insight Klinis
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
            Asesmen &amp; well-being
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            {psychologist
              ? `Hasil asesmen dan mood klien yang pernah menjadwalkan sesi dengan ${psychologist.name}.`
              : "Pantau hasil psikotes mandiri dan tren mood pengguna portal."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {psychologist && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-mint px-3 py-1.5 text-[10px] font-semibold text-brand-dark">
              <Users className="h-3 w-3" /> Hanya klien Anda
            </span>
          )}
          {isSuperadmin && (
            <Link href="/admin/asesmen/buat" className="btn-primary btn-sm w-fit">
              <Plus className="h-3.5 w-3.5" /> Buat soal asesmen
            </Link>
          )}
        </div>
      </div>

      {psychologist && clientIds && clientIds.length === 0 && (
        <p className="rounded-xl border border-dashed border-line bg-white px-4 py-3 text-[11px] text-muted">
          Belum ada klien yang terhubung dengan akun Anda. Data akan muncul
          setelah klien membuat booking dengan Anda.
        </p>
      )}

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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-4">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone}`}>
              <stat.icon className="h-3.5 w-3.5" />
            </span>
            <p className="mt-2.5 font-serif text-xl font-semibold text-brand-deep">
              {stat.value}
            </p>
            <p className="text-[10px] font-medium text-ink/70">{stat.label}</p>
            <p className="text-[9px] text-muted">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Partisipasi per instrumen
              </h2>
              <p className="text-[10px] text-muted">Total hasil yang tersimpan</p>
            </div>
            <ClipboardList className="h-4 w-4 text-brand/50" />
          </div>

          <div className="mt-4 space-y-3">
            {assessments.map((item) => (
              <div
                key={item.id}
                className="rounded-xl px-1 py-1 transition hover:bg-surface/50"
              >
                <Link href={`/admin/asesmen?assessment=${item.id}`} className="block">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="flex items-center gap-1.5 font-medium text-ink">
                      {item.title}
                      {!item.isActive && (
                        <span className="chip bg-amber-50 text-[8px] text-amber-700">nonaktif</span>
                      )}
                    </span>
                    <span className="text-muted">{countFor(item.id)} hasil</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(countFor(item.id) / maxCount) * 100}%` }}
                    />
                  </div>
                </Link>
                {isSuperadmin && (
                  <form action={toggleAssessmentAction} className="mt-1.5">
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-[9px] font-semibold text-muted transition hover:text-brand"
                    >
                      {item.isActive ? "Nonaktifkan asesmen" : "Aktifkan asesmen"}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/psikotes"
            target="_blank"
            className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
          >
            Buka halaman psikotes publik <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-serif text-lg font-semibold text-brand-deep">
            Distribusi kategori
          </h2>
          <p className="text-[10px] text-muted">
            {assessment === "ALL" ? "Seluruh hasil terbaru" : "Hasil pada filter aktif"}
          </p>

          <div className="mt-4 space-y-2.5">
            {categoryRows.map(([category, count]) => {
              const pct = results.length > 0 ? Math.round((count / results.length) * 100) : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-medium text-ink">{category}</span>
                    <span className="text-muted">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-brand-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {categoryRows.length === 0 && (
              <p className="rounded-xl border border-dashed border-line p-6 text-center text-[10.5px] text-muted">
                Belum ada hasil asesmen.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-brand-mint/60 p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-deep">
              <Sparkles className="h-3 w-3" /> Mood pengguna
            </p>
            <div className="mt-2 flex items-end gap-1.5">
              {[1, 2, 3, 4, 5].map((mood) => {
                const row = moods.find((item) => item.mood === mood);
                const count = row?._count._all ?? 0;
                const pct = moodTotal > 0 ? (count / moodTotal) * 100 : 0;
                return (
                  <div key={mood} className="flex-1 text-center">
                    <div className="flex h-14 items-end justify-center">
                      <div
                        className="w-full rounded-t-md bg-brand/70"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                        title={`${count} check-in`}
                      />
                    </div>
                    <p className="mt-1 text-[11px]" title={MOOD_LABEL[mood - 1]}>
                      {moodEmoji(mood)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Hasil terbaru
            </h2>
            <p className="text-[10px] text-muted">
              {filteredTotal} hasil total · menampilkan {results.length} terbaru
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/admin/asesmen"
              className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition ${
                assessment === "ALL"
                  ? "bg-brand-dark text-white"
                  : "bg-surface text-ink/60 hover:text-brand-dark"
              }`}
            >
              Semua
            </Link>
            {assessments.map((item) => (
              <Link
                key={item.id}
                href={`/admin/asesmen?assessment=${item.id}`}
                className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition ${
                  assessment === item.id
                    ? "bg-brand-dark text-white"
                    : "bg-surface text-ink/60 hover:text-brand-dark"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-surface/60 text-[9px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Peserta</th>
                <th className="px-3 py-2.5 font-semibold">Instrumen</th>
                <th className="px-3 py-2.5 font-semibold">Skor</th>
                <th className="px-3 py-2.5 font-semibold">Kategori</th>
                <th className="px-3 py-2.5 font-semibold">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[11px]">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-surface/40">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">
                      {result.user?.name ?? result.guestName ?? "Anonim"}
                    </p>
                    <p className="text-[9px] text-muted">
                      {result.user?.email ?? result.guestEmail ?? "tanpa email"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-ink/70">{result.assessment.title}</td>
                  <td className="px-3 py-3 font-serif text-[15px] font-semibold text-brand-deep">
                    {result.score}
                  </td>
                  <td className="px-3 py-3">
                    <span className="chip bg-brand-mint/70 text-brand-dark">
                      {result.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[9.5px] text-muted">
                    {formatDateTime(result.createdAt)}
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[11px] text-muted">
                    Belum ada hasil asesmen pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[10.5px] leading-relaxed text-muted">
        <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Hasil asesmen bersifat skrining awal, bukan diagnosis klinis. Gunakan data
          ini untuk memahami kebutuhan calon klien sebelum sesi konsultasi.
        </p>
      </div>
    </div>
  );
}
