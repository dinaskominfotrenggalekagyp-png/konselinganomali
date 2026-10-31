import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  HeartPulse,
  ListChecks,
  Lock,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { Reveal } from "@/components/reveal";
import { safeJson } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Psikotes & Asesmen Mandiri",
  description:
    "Asesmen psikologi singkat dan tervalidasi untuk memetakan tingkat stres, kecemasan, minat bakat, dan potensi diri Anda.",
};

export const dynamic = "force-dynamic";

export default async function PsikotesPage() {
  const assessments = await db.assessment.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
  });

  return (
    <>
      <section className="relative overflow-hidden bg-brand-deep pb-14 pt-10 text-white sm:pb-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 82% 20%, #7dd3fc 0, transparent 38%), radial-gradient(circle at 12% 85%, #0ea5e9 0, transparent 42%)",
          }}
        />
        <div className="shell relative">
          <nav className="flex items-center gap-2 text-[11.5px] text-white/50">
            <Link href="/" className="hover:text-white">Beranda</Link>
            <span>/</span>
            <span className="text-white/80">Psikotes</span>
          </nav>

          <div className="mt-7 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
                <Sparkles className="h-3 w-3" /> Gratis &amp; rahasia
              </span>
              <h1 className="mt-5 text-[38px] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[52px]">
                Kenali diri Anda,
                <br />
                <span className="serif-italic text-brand-accent">satu langkah</span> lebih dekat.
              </h1>
              <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-white/65">
                Asesmen mandiri yang dirancang psikolog untuk memetakan kondisi
                emosional dan potensi Anda. Hasil instan, tanpa perlu membuat akun.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#asesmen" className="btn-accent">
                  Mulai asesmen <ArrowRight className="h-4 w-4" />
                </a>
                <Link href="/portal/asesmen" className="btn border border-white/20 text-white hover:bg-white/10">
                  Riwayat saya
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-accent text-brand-deep">
                    <HeartPulse className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">Bagaimana hasil digunakan?</p>
                    <p className="text-[10.5px] text-white/50">Tiga prinsip yang kami pegang</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { icon: Lock, title: "Rahasia", desc: "Hasil hanya dapat diakses oleh Anda." },
                    { icon: Stethoscope, title: "Berbasis bukti", desc: "Instrumen disusun psikolog klinis." },
                    { icon: TrendingUp, title: "Tindak lanjut", desc: "Rekomendasi langkah nyata, bukan label." },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                      <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                      <div>
                        <p className="text-[11.5px] font-semibold">{item.title}</p>
                        <p className="text-[10.5px] text-white/50">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-white" id="asesmen">
        <div className="shell">
          <Reveal className="mb-9">
            <span className="eyebrow">Pilih Asesmen</span>
            <h2 className="mt-3 text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
              Mulai dari <span className="serif-italic text-brand">yang paling relevan</span>
            </h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {assessments.map((assessment, i) => {
              const questions = safeJson<unknown[]>(assessment.questions, []);
              const config = safeJson<{ categories?: { label: string }[] }>(
                assessment.scoring,
                {}
              );

              return (
                <Reveal key={assessment.id} delay={i * 80}>
                  <div className="group flex h-full flex-col rounded-[26px] border border-line bg-white p-6 transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-card">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-mint text-brand-dark">
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="chip bg-surface text-muted">
                        <Clock className="h-3 w-3" /> {assessment.duration} menit
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-[21px] font-semibold text-brand-deep">
                      {assessment.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">
                      {assessment.description}
                    </p>

                    <div className="mt-4 flex items-center gap-3 text-[10.5px] text-muted">
                      <span className="flex items-center gap-1">
                        <ListChecks className="h-3 w-3" /> {questions.length} pertanyaan
                      </span>
                      <span className="h-1 w-1 rounded-full bg-line" />
                      <span>{config.categories?.length ?? 0} kategori hasil</span>
                    </div>

                    <Link
                      href={`/psikotes/${assessment.slug}`}
                      className="btn-primary btn-sm mt-5 w-full"
                    >
                      Mulai sekarang <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="text-[11.5px] leading-relaxed text-amber-900">
              <strong>Catatan penting:</strong> Asesmen mandiri ini bersifat skrining
              dan edukatif, bukan diagnosis klinis. Untuk penilaian menyeluruh,
              diperlukan sesi bersama psikolog berlisensi. Jika Anda berada dalam
              kondisi krisis, hubungi 119 ext. 8 atau layanan darurat terdekat.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface/70 py-14">
        <div className="shell">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-[28px] font-semibold text-brand-deep">
              Bagaimana cara kerjanya?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Jawab dengan jujur",
                desc: "Tidak ada jawaban benar atau salah. Pilih yang paling menggambarkan kondisi Anda.",
              },
              {
                step: "02",
                title: "Dapatkan hasil instan",
                desc: "Skor dan interpretasi muncul langsung, lengkap dengan rekomendasi awal.",
              },
              {
                step: "03",
                title: "Diskusikan bila perlu",
                desc: "Bawa hasil asesmen ke sesi konseling untuk dibahas lebih mendalam.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-line bg-white p-5">
                <span className="font-serif text-2xl font-semibold text-brand/30">
                  {item.step}
                </span>
                <h3 className="mt-2 text-[13.5px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
