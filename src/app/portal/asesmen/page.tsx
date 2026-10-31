import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortalAsesmenPage() {
  const user = await requireUser();

  const [results, assessments] = await Promise.all([
    db.assessmentResult.findMany({
      where: { userId: user.id },
      include: { assessment: true },
      orderBy: { createdAt: "desc" },
    }),
    db.assessment.findMany({ where: { isActive: true }, take: 3 }),
  ]);

  const average =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Asesmen
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[32px]">
          Hasil asesmen Anda
        </h1>
        <p className="mt-1 text-[12.5px] text-muted">
          Semua hasil tersimpan otomatis saat Anda masuk ke akun.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total asesmen", value: results.length, sub: "selesai" },
          { label: "Rata-rata skor", value: average, sub: "dari semua asesmen" },
          {
            label: "Terakhir",
            value: results[0]
              ? formatDate(results[0].createdAt, { day: "numeric", month: "short" })
              : "—",
            sub: results[0]?.assessment.title ?? "belum ada",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[10px] text-muted">{s.label}</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">
              {s.value}
            </p>
            <p className="truncate text-[9.5px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-brand-deep">
            Riwayat hasil
          </h2>
          <ClipboardList className="h-4 w-4 text-brand/50" />
        </div>

        {results.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-brand/40" />
            <p className="mt-2 text-[12px] font-medium text-ink">Belum ada hasil</p>
            <p className="mt-0.5 text-[10.5px] text-muted">
              Ikuti asesmen pertama Anda—hanya butuh 3–5 menit.
            </p>
            <Link href="/psikotes" className="btn-primary btn-sm mt-3">
              Mulai asesmen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            {results.map((result) => {
              const percent = Math.min(
                Math.round((result.score / 40) * 100),
                100
              );
              return (
                <Link
                  key={result.id}
                  href={`/psikotes/hasil/${result.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-line/80 p-4 transition hover:border-brand/25 hover:bg-surface/40 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <p className="text-[12.5px] font-semibold text-ink">
                      {result.assessment.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {formatDate(result.createdAt, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {result.assessment.duration} menit
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[9.5px] text-muted">{percent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="chip bg-brand-mint text-brand-dark">
                      {result.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-ink/70">
                      <TrendingUp className="h-3 w-3 text-brand" /> Skor {result.score}
                    </span>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 text-brand/40 transition group-hover:translate-x-0.5 group-hover:text-brand sm:block" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif text-lg font-semibold text-brand-deep">
          Asesmen yang tersedia
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/psikotes/${assessment.slug}`}
              className="group rounded-2xl border border-line bg-white p-4 transition hover:border-brand/25 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mint text-brand-dark">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="text-[9.5px] text-muted">{assessment.duration} menit</span>
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-snug text-ink">
                {assessment.title}
              </p>
              <p className="mt-1 text-[9.5px] text-brand">Mulai gratis →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
