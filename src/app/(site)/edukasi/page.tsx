import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { getPublishedArticles } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { ArticleExplorer } from "@/components/article-explorer";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Edukasi & Komunitas",
  description:
    "Artikel, workshop, dan webinar kesehatan mental yang dipandu psikolog. Tumbuh bersama komunitas yang suportif.",
};

export const dynamic = "force-dynamic";

const EVENTS = [
  {
    date: "12 Nov 2026",
    title: "Mengelola Burnout di Dunia Kerja Hybrid",
    speaker: "Yudha Saputra, M.Psi",
    mode: "Webinar · Online",
    quota: "Sisa 42 kursi",
    price: "Gratis",
    icon: Video,
  },
  {
    date: "19 Nov 2026",
    title: "Mindful Parenting: Mendampingi Anak Tanpa Memaksa",
    speaker: "Raras Ayu Kirana, M.Psi",
    mode: "Workshop · Trenggalek",
    quota: "Sisa 18 kursi",
    price: "Rp150.000",
    icon: MapPin,
  },
  {
    date: "26 Nov 2026",
    title: "Komunikasi Asertif untuk Pasangan",
    speaker: "Bagas Nurwidodo, M.Psi",
    mode: "Kelas online",
    quota: "Sisa 65 kursi",
    price: "Rp100.000",
    icon: Users,
  },
];

export default async function EdukasiPage() {
  const articles = await getPublishedArticles();

  const [featured, ...rest] = articles;

  return (
    <>
      <section className="relative overflow-hidden bg-cream pb-12 pt-10 sm:pb-16">
        <div className="shell">
          <nav className="flex items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <span className="text-brand-dark">Edukasi</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <Reveal>
              <span className="eyebrow">Edukasi &amp; Komunitas</span>
              <h1 className="mt-4 text-[38px] font-medium leading-[1.08] tracking-[-0.02em] text-brand-deep sm:text-[52px]">
                Tumbuh dengan
                <br />
                <span className="serif-italic text-brand">pengetahuan</span> yang tepat.
              </h1>
              <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-muted">
                Artikel berbasis riset, workshop interaktif, dan webinar yang dipandu
                psikolog. Semua dirancang agar mudah dipraktikkan dalam keseharian.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#artikel" className="btn-primary">
                  Baca artikel <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#kelas" className="btn-outline">
                  <CalendarDays className="h-4 w-4" /> Kelas mendatang
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "120+", label: "Artikel & panduan" },
                  { value: "36", label: "Workshop per tahun" },
                  { value: "8K+", label: "Anggota komunitas" },
                  { value: "4.9/5", label: "Rating peserta" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-line bg-white p-4">
                    <p className="font-serif text-2xl font-semibold text-brand-deep">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {featured && (
        <section className="bg-white pb-4 pt-8">
          <div className="shell">
            <Reveal>
              <Link
                href={`/edukasi/${featured.slug}`}
                className="group grid overflow-hidden rounded-[28px] border border-line bg-white transition hover:shadow-card lg:grid-cols-[1.05fr_0.95fr]"
              >
                <div className="relative min-h-[260px] lg:min-h-[340px]">
                  <Image
                    src={featured.cover}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                    Artikel unggulan
                  </span>
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                    <span className="rounded-full bg-brand-mint px-2.5 py-1 font-semibold text-brand-dark">
                      {featured.category}
                    </span>
                    <span>{formatDate(featured.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {featured.readMinutes} menit
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-[26px] font-semibold leading-tight text-brand-deep sm:text-[32px]">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-ink/60">
                      {featured.author}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-dark">
                      Baca selengkapnya <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section bg-white" id="artikel">
        <div className="shell">
          <Reveal className="mb-8">
            <span className="eyebrow">Perpustakaan</span>
            <h2 className="mt-3 text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
              Semua <span className="serif-italic text-brand">artikel</span>
            </h2>
          </Reveal>

          <Reveal>
            <ArticleExplorer articles={rest} />
          </Reveal>
        </div>
      </section>

      <section className="section bg-brand-mint/50" id="kelas">
        <div className="shell">
          <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Kelas Mendatang</span>
              <h2 className="mt-3 text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
                Belajar <span className="serif-italic text-brand">langsung</span> dari psikolog
              </h2>
            </div>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-muted">
              Kelas live dengan ruang diskusi. Rekaman tersedia 30 hari untuk peserta.
            </p>
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-3">
            {EVENTS.map((event, i) => (
              <Reveal key={event.title} delay={i * 80}>
                <div className="flex h-full flex-col rounded-3xl border border-white bg-white p-6 shadow-soft">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint text-brand">
                      <event.icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-brand-mint px-2.5 py-1 text-[10px] font-semibold text-brand-dark">
                      {event.price}
                    </span>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand">
                    {event.date}
                  </p>
                  <h3 className="mt-1 font-serif text-[19px] font-semibold leading-snug text-brand-deep">
                    {event.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[12px] text-muted">{event.speaker}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[10.5px] text-muted">
                    <span>{event.mode}</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-brand" /> {event.quota}
                    </span>
                  </div>
                  <Link href="/kontak" className="btn-outline btn-sm mt-4 w-full">
                    Daftar kelas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="shell">
          <div className="rounded-[28px] bg-brand-deep px-7 py-10 text-center text-white sm:px-12">
            <h2 className="font-serif text-[28px] font-medium sm:text-[34px]">
              Artikel baru setiap dua minggu
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-white/60">
              Bergabung dengan 8.000+ pembaca yang mendapatkan panduan praktis dan
              riset terbaru langsung di inbox.
            </p>
            <Link href="/kontak" className="btn-accent mt-5">
              Berlangganan newsletter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
