import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Download,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, safeJson, type ScoringConfig } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hasil Asesmen",
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await db.assessmentResult.findUnique({
    where: { id },
    include: { assessment: true },
  });

  if (!result) notFound();

  const config = safeJson<ScoringConfig>(result.assessment.scoring, {
    maxScore: 1,
    categories: [],
  });
  const category =
    config.categories.find((c) => c.label === result.category) ??
    config.categories[config.categories.length - 1];

  const max = config.maxScore || 1;
  const percentage = Math.min(Math.round((result.score / max) * 100), 100);

  const user = await getCurrentUser();
  const services = await db.service.findMany({
    where: { isActive: true, category: "Klinik" },
    take: 2,
  });

  const others = await db.assessment.findMany({
    where: { isActive: true, id: { not: result.assessmentId } },
    take: 2,
  });

  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = category?.color ?? "#0ea5e9";

  return (
    <>
      <section className="bg-surface/60 py-10">
        <div className="shell">
          <nav className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <Link href="/psikotes" className="hover:text-brand">Psikotes</Link>
            <span>/</span>
            <span className="text-brand-dark">Hasil</span>
          </nav>

          <div className="mx-auto mt-6 max-w-4xl">
            <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-9">
              <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
                    Hasil Asesmen
                  </p>
                  <h1 className="mt-1 font-serif text-[26px] font-semibold text-brand-deep sm:text-[30px]">
                    {result.assessment.title}
                  </h1>
                  <p className="mt-1 text-[11px] text-muted">
                    Dikerjakan {formatDate(result.createdAt, { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {user && result.userId === user.id && (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-mint px-3 py-1.5 text-[10.5px] font-medium text-brand">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan di portal
                  </span>
                )}
              </div>

              <div className="mt-7 grid items-center gap-8 sm:grid-cols-[200px_1fr]">
                <div className="relative mx-auto flex h-[200px] w-[200px] items-center justify-center">
                  <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke="#e0f2fe"
                      strokeWidth="12"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={color}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif text-4xl font-semibold" style={{ color }}>
                      {result.score}
                    </span>
                    <span className="text-[10.5px] text-muted">dari {max} poin</span>
                  </div>
                </div>

                <div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {result.category}
                  </span>
                  <h2 className="mt-3 font-serif text-2xl font-medium leading-snug text-brand-deep">
                    {percentage <= 30
                      ? "Kondisi Anda relatif terkelola."
                      : percentage <= 60
                        ? "Ada tekanan yang perlu diperhatikan."
                        : "Ini saat yang tepat untuk mencari dukungan."}
                  </h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {result.summary}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-surface p-3">
                      <p className="text-[10px] text-muted">Skor Anda</p>
                      <p className="font-serif text-lg font-semibold text-ink">
                        {result.score}/{max}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface p-3">
                      <p className="text-[10px] text-muted">Persentil indikatif</p>
                      <p className="font-serif text-lg font-semibold text-ink">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Link href="/klinik" className="btn-primary">
                  <Stethoscope className="h-4 w-4" /> Konsultasikan hasil
                </Link>
                <Link href={`/psikotes/${result.assessment.slug}`} className="btn-outline">
                  <RotateCcw className="h-4 w-4" /> Ulangi asesmen
                </Link>
                {!user && (
                  <Link href="/register" className="btn-ghost">
                    Simpan hasil di portal <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-[11px] leading-relaxed text-amber-900">
                  <strong>Hasil ini bukan diagnosis klinis.</strong> Skrining mandiri
                  hanya memberi gambaran awal. Psikolog dapat melakukan asesmen
                  menyeluruh dengan instrumen terstandar dan wawancara klinis.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-2xl font-semibold text-brand-deep">
                Langkah berikutnya
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Rekomendasi yang disusun berdasarkan hasil Anda.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/klinik/${service.slug}`}
                    className="group rounded-2xl border border-line bg-white p-5 transition hover:border-brand/25 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint text-brand">
                        <CalendarCheck className="h-4 w-4" />
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand/30 transition group-hover:translate-x-1 group-hover:text-brand" />
                    </div>
                    <h3 className="mt-3 font-serif text-[17px] font-semibold text-brand-deep">
                      {service.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
                      {service.tagline} — {service.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-brand-deep p-6 text-white sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-serif text-xl font-semibold">
                    Ingin memahami hasil ini lebih dalam?
                  </h2>
                  <p className="mt-1 text-[12px] text-white/60">
                    Sesi feedback 30 menit bersama psikolog, tanpa komitmen lanjutan.
                  </p>
                </div>
                <Link href="/klinik" className="btn-accent shrink-0">
                  Jadwalkan sesi <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-xl font-semibold text-brand-deep">
                Asesmen lain yang mungkin relevan
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {others.map((item) => (
                  <Link
                    key={item.id}
                    href={`/psikotes/${item.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5 transition hover:border-brand/25"
                  >
                    <div>
                      <p className="text-[12.5px] font-semibold text-ink">{item.title}</p>
                      <p className="text-[10.5px] text-muted">
                        {item.duration} menit · gratis
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand" />
                  </Link>
                ))}
              </div>
            </div>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-[10.5px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5" /> Hasil disimpan dengan aman dan
              hanya dapat diakses melalui tautan ini.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
