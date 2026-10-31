import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  Clock,
  FileHeart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Video,
  Users,
} from "lucide-react";
import { getFaqs, getLatestArticles, getServices, getTestimonials } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { AnimatedStat } from "@/components/animated-stat";
import { FaqAccordion } from "@/components/faq-accordion";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { PricingTabs } from "@/components/pricing-tabs";
import { ArticleCard } from "@/components/article-card";
import { ContactForm } from "@/components/contact-form";
import { DynamicIcon } from "@/components/dynamic-icon";
import { getBranding } from "@/lib/settings";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2200&auto=format&fit=crop";
const VALUE_IMAGE =
  "https://images.unsplash.com/photo-1746513930405-005d20013dd6?w=900&h=1100&auto=format&fit=crop&q=80";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allServices, testimonials, faqs, articles, branding] = await Promise.all([
    getServices(),
    getTestimonials(),
    getFaqs(),
    getLatestArticles(3),
    getBranding(),
  ]);

  const services = allServices.filter((service) =>
    ["Klinik", "Edukasi", "Psikotes"].includes(service.category)
  );

  const featured = services.find((s) => s.isFeatured) ?? services[0];
  const featuredHighlights: string[] = featured
    ? JSON.parse(featured.highlights)
    : [];
  const cards = services.filter((s) => s.id !== featured?.id).slice(0, 3);
  const serviceNames = services.map((s) => s.name);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            name: branding.siteName,
            description:
              "Layanan asesmen psikologi, konseling, dan edukasi kesehatan mental.",
            address: {
              "@type": "PostalAddress",
              streetAddress: branding.contactAddress,
              addressLocality: "Trenggalek",
              postalCode: "66311",
              addressCountry: "ID",
            },
            telephone: branding.contactPhone,
            priceRange: "Rp150.000 - Rp750.000",
          }),
        }}
      />

      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden bg-cream pb-10 pt-5 sm:pb-14 sm:pt-7">
        <div className="shell">
          <div className="relative flex min-h-[540px] items-center overflow-hidden rounded-[28px] shadow-soft">
            <Image
              src={branding.heroImage || HERO_IMAGE}
              alt="Suasana tenang di alam terbuka"
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-mint via-brand-mint/85 to-brand-mint/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-mint/80 via-transparent to-transparent lg:hidden" />

            <div className="relative z-10 grid w-full gap-10 p-6 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:p-14">
              <div className="max-w-[520px] animate-fade-up">
                <span className="eyebrow">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                  </span>
                  {branding.heroBadge}
                </span>

                <h1 className="mt-6 text-[40px] font-medium leading-[1.06] tracking-[-0.02em] text-brand-deep sm:text-[56px] lg:text-[62px]">
                  {branding.heroTitle}
                  <br />
                  <span className="serif-italic text-brand">{branding.heroAccent}</span>
                </h1>

                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink/70">
                  {branding.heroDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={branding.heroPrimaryHref} className="btn-primary btn-lg">
                    {branding.heroPrimaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={branding.heroSecondaryHref} className="btn-outline btn-lg">
                    <Play className="h-3.5 w-3.5" />
                    {branding.heroSecondaryLabel}
                  </Link>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <div className="flex items-center">
                    {["SR", "AP", "MK", "RH"].map((initial, i) => (
                      <span
                        key={initial}
                        className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-mint text-[10px] font-bold text-brand-dark first:ml-0"
                        style={{ zIndex: 10 - i }}
                      >
                        {initial}
                      </span>
                    ))}
                    <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-dark text-[10px] font-bold text-white">
                      +2k
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-[#e0a92e] text-[#e0a92e]"
                        />
                      ))}
                      <span className="ml-1 text-xs font-semibold text-ink/80">4.9/5</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      dari 2.400+ ulasan klien terverifikasi
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating portal card */}
              <div className="relative mx-auto w-full max-w-[390px] animate-fade-up [animation-delay:150ms]">
                <div className="animate-float rounded-[26px] bg-white p-5 shadow-card ring-1 ring-black/5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark font-serif text-lg font-semibold text-white">
                      W
                    </span>
                    <div className="flex-1">
                      <h3 className="font-sans text-[15px] font-semibold text-ink">
                        Portal Klien
                      </h3>
                      <p className="text-[11.5px] text-muted">Akses layanan terpadu</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider text-brand">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Live
                    </span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {[
                      {
                        icon: Search,
                        title: "Temukan Psikolog yang Tepat",
                        sub: "50+ psikolog berlisensi",
                        href: "/klinik",
                      },
                      {
                        icon: CalendarCheck,
                        title: "Reservasi Jadwal Konsultasi",
                        sub: "Online & tatap muka",
                        href: "/klinik",
                      },
                      {
                        icon: FileHeart,
                        title: "Rekam Medis & Asesmen",
                        sub: "Hasil tes & catatan sesi",
                        href: "/psikotes",
                      },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-2xl bg-[#f0f9ff] px-3.5 py-3 transition hover:bg-[#e0f2fe]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-dark shadow-sm">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold text-brand-deep">
                            {item.title}
                          </span>
                          <span className="block truncate text-[10.5px] text-muted">
                            {item.sub}
                          </span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-brand/40 transition group-hover:text-brand" />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-brand/20 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-mint text-brand">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[10.5px] font-medium text-ink/70">
                        Data terenkripsi &amp; rahasia
                      </span>
                    </div>
                    <Link
                      href="/register"
                      className="text-[10.5px] font-bold text-brand hover:underline"
                    >
                      Daftar
                    </Link>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-4 hidden items-center gap-2.5 rounded-2xl bg-white p-3 pr-4 shadow-lift ring-1 ring-black/5 sm:flex">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                    <Video className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Sesi berikutnya
                    </p>
                    <p className="text-[11.5px] font-semibold text-ink">Besok, 10.00 WIB</p>
                  </div>
                </div>

                <div className="absolute -right-2 top-16 hidden rounded-2xl bg-brand-deep px-3.5 py-2.5 text-white shadow-lift sm:block">
                  <p className="text-[9px] uppercase tracking-widest text-white/50">Respons</p>
                  <p className="font-serif text-lg leading-tight">&lt; 2 jam</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="shell mt-10">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-line/70 bg-white/70 px-6 py-5 backdrop-blur sm:flex-row sm:justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {branding.trustText}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 opacity-55">
              {["Bina Cendekia", "Nusantara Digital", "Cakra University", "Sinar Rasa", "Klinika Sehat"].map(
                (name) => (
                  <span key={name} className="font-serif text-[15px] font-semibold tracking-tight">
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ SERVICES ---------------------------- */}
      <section className="section bg-white" id="layanan">
        <div className="shell">
          <Reveal className="mx-auto max-w-[760px] text-center">
            <span className="eyebrow">Solusi Terpadu</span>
            <h2 className="mt-5 text-[34px] font-medium leading-[1.15] tracking-[-0.01em] text-brand-deep sm:text-[44px]">
              Solusi Terpadu untuk
              <br />
              <span className="serif-italic text-brand">Kesejahteraan Mental</span> Anda
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
              Temukan pendampingan profesional yang dirancang khusus untuk setiap
              langkah perjalanan kesehatan mental Anda — mulai dari konseling personal
              hingga asesmen psikologi yang mendalam.
            </p>
          </Reveal>

          {featured && (
            <Reveal className="mt-12">
              <div className="grid overflow-hidden rounded-[28px] border border-line bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[280px] lg:min-h-[420px]">
                  <Image
                    src={featured.image}
                    alt={featured.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/30 to-transparent" />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <div className="flex flex-wrap gap-2">
                    <span className="chip bg-brand-mint text-brand">
                      <Sparkles className="h-3 w-3" /> KLINIK PERSONAL
                    </span>
                    <span className="chip bg-brand-accent/90 text-brand-deep">
                      KONSELING PREMIUM
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-[28px] font-semibold leading-tight text-brand-deep">
                    {featured.tagline}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">
                    {featured.description}
                  </p>

                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {featuredHighlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-[12.5px] text-ink/75">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Link href={`/klinik/${featured.slug}`} className="btn-primary">
                      Pesan Sesi Sekarang <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="text-[12px] text-muted">
                      Mulai{" "}
                      <span className="font-semibold text-brand-dark">
                        Rp{featured.price.toLocaleString("id-ID")}
                      </span>
                      /sesi
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {cards.map((service, i) => (
              <Reveal key={service.id} delay={i * 90}>
                <div className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-line/70 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:bg-brand-mint/60 hover:shadow-card">
                  <div className="relative h-[190px] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-brand-dark backdrop-blur">
                      <DynamicIcon name={service.icon} className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-[20px] font-semibold text-brand-deep">
                        {service.name}
                      </h3>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-brand/30 transition group-hover:text-brand" />
                    </div>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
                      {service.tagline}. {service.description.slice(0, 96)}…
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-4">
                      <span className="text-[11px] text-muted">
                        Mulai{" "}
                        <strong className="font-semibold text-ink/80">
                          Rp{service.price.toLocaleString("id-ID")}
                        </strong>
                      </span>
                      <Link
                        href={
                          service.category === "Psikotes"
                            ? "/psikotes"
                            : service.category === "Edukasi"
                              ? "/edukasi"
                              : `/klinik/${service.slug}`
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-brand-dark px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-brand"
                      >
                        {service.category === "Psikotes"
                          ? "Daftar Tes"
                          : service.category === "Edukasi"
                            ? "Eksplorasi Kelas"
                            : "Lihat Detail"}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- STATS ------------------------------ */}
      <section className="bg-white pb-16 sm:pb-20">
        <div className="shell">
          <Reveal>
            <div className="grid gap-8 rounded-[28px] border border-brand/10 bg-gradient-to-br from-brand-mint/80 via-white to-white px-7 py-9 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:gap-0">
              {[
                { value: "10K+", label: "Klien Terbantu", sub: "sejak 2019" },
                { value: "92%", label: "Tingkat Kepuasan", sub: "survei pasca-sesi" },
                { value: "24/7", label: "Respons Cepat", sub: "dukungan krisis" },
                { value: "50+", label: "Psikolog Lisensi", sub: "terverifikasi" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={
                    i > 0
                      ? "lg:border-l lg:border-brand/10 lg:pl-8"
                      : "lg:pr-8"
                  }
                >
                  <AnimatedStat value={stat.value} label={stat.label} sublabel={stat.sub} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------- VALUE ------------------------------ */}
      <section className="section bg-surface/70">
        <div className="shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-card">
                <Image
                  src={branding.valueImage || VALUE_IMAGE}
                  alt="Sesi konseling yang hangat"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/45 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/92 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-mint text-brand">
                      <HeartHandshake className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-semibold text-brand-deep">
                        Ruang aman, tanpa penghakiman
                      </p>
                      <p className="text-[11px] text-muted">
                        Didampingi psikolog klinis berlisensi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 -top-4 hidden rounded-2xl bg-brand-deep p-4 text-white shadow-lift sm:block">
                <p className="font-serif text-2xl font-semibold leading-none">98%</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50">
                  merasa didengar
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <span className="eyebrow">Tentang Pendekatan Kami</span>
            <h2 className="mt-5 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[42px]">
              Maksimalkan Potensi Diri{" "}
              <span className="serif-italic text-brand">bersama</span> Konseling Trenggalek
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-muted">
              Layanan kami dirancang untuk menemui Anda di titik manapun Anda berada —
              baik Anda sedang mencari teman bicara, mendampingi keluarga, atau
              menavigasi krisis.
            </p>

            <div className="mt-7 space-y-3">
              {[
                {
                  icon: MessageCircle,
                  title: "Dukungan responsif kapanpun dibutuhkan",
                  desc: "Tim psikolog klinis kami siap sedia membantu di saat krisis atau tekanan emosional tinggi.",
                },
                {
                  icon: ShieldCheck,
                  title: "Pendekatan personal & terarah",
                  desc: "Jelajahi emosi, masalah, dan pengalaman di ruang yang aman dan terjamin kerahasiaannya.",
                },
                {
                  icon: Users,
                  title: "Kolaborasi lintas disiplin",
                  desc: "Psikolog, konselor, dan mediator bekerja bersama menyusun rencana intervensi yang utuh.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group flex gap-4 rounded-2xl border border-transparent bg-white/80 p-4 transition hover:border-brand/15 hover:bg-white hover:shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-dark transition group-hover:bg-brand group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-sans text-[13.5px] font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/klinik" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-dark hover:gap-3 transition-all">
              Kenali tim &amp; layanan kami <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ PROCESS ----------------------------- */}
      <section className="section bg-white">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <span className="eyebrow">Alur Layanan</span>
              <h2 className="mt-5 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[40px]">
                Bagaimana Proses
                <br />
                Pencocokan <span className="serif-italic text-brand">Terapi</span> Kami
                Bekerja
              </h2>
              <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-muted">
                Itulah mengapa layanan kami dirancang untuk secara presisi menemui Anda
                di titik permasalahan yang sebenarnya.
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-brand/10 bg-brand-mint/50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-brand-deep">
                    Didukung asesmen berbasis data
                  </p>
                  <p className="text-[11.5px] text-muted">
                    Setiap rekomendasi dapat ditelusuri dan dievaluasi.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="relative">
              <div className="absolute left-[22px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-brand/40 via-brand/15 to-transparent sm:block" />
              <div className="space-y-4">
                {[
                  {
                    step: "01",
                    title: "Pemetaan & Asesmen Awal",
                    desc: "Langkah pertama kami adalah memahami Anda. Melalui asesmen singkat, kami mengidentifikasi kebutuhan spesifik Anda secara akurat.",
                    icon: Search,
                  },
                  {
                    step: "02",
                    title: "Pencocokan Personal",
                    desc: "Berdasarkan data asesmen, kami mencocokkan Anda dengan psikolog atau modul yang paling tepat untuk menangani isu Anda.",
                    icon: Users,
                  },
                  {
                    step: "03",
                    title: "Intervensi & Evaluasi",
                    desc: "Perawatan holistik dimulai. Anda akan merasakan intervensi presisi dengan pemantauan perkembangan secara berkala.",
                    icon: Activity,
                  },
                ].map((item, i) => (
                  <Reveal key={item.step} delay={i * 100}>
                    <div className="group relative flex gap-5 rounded-[24px] border border-line bg-white p-5 transition hover:border-brand/25 hover:shadow-soft sm:p-6">
                      <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/15 bg-brand-mint font-serif text-sm font-semibold text-brand-dark">
                        {item.step}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-brand" />
                          <h3 className="font-serif text-[19px] font-semibold text-brand-deep">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ FEATURES ---------------------------- */}
      <section className="section relative overflow-hidden bg-brand-mint/60">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        <div className="shell relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Mengapa Konseling Trenggalek</span>
            <h2 className="mt-5 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[42px]">
              Semua yang Anda Butuhkan untuk{" "}
              <span className="serif-italic text-brand">Kesejahteraan Psikologis</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: "Akses Fleksibel",
                desc: "Dukungan online atau tatap muka, dengan jadwal yang menyesuaikan gaya hidup Anda.",
              },
              {
                icon: Users,
                title: "Pencocokan Personal",
                desc: "Anda unik, begitu pula perawatan Anda. Kami mencocokkan berdasarkan kebutuhan dan tujuan.",
              },
              {
                icon: ShieldCheck,
                title: "Rahasia & Aman",
                desc: "Percakapan bersifat sangat rahasia, ditangani dengan hormat dan kepedulian tinggi.",
              },
              {
                icon: HeartHandshake,
                title: "Inklusif Secara Kultural",
                desc: "Tim kami mencerminkan latar belakang beragam sehingga Anda merasa dipahami.",
              },
              {
                icon: Activity,
                title: "Pemantauan Kemajuan",
                desc: "Pantau pertumbuhan lewat check-in emosi, catatan sesi, dan penetapan tujuan personal.",
              },
              {
                icon: Clock,
                title: "Dukungan Krisis 24/7",
                desc: "Tim terlatih dalam krisis siap sedia sepanjang waktu untuk dukungan emosional mendesak.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="group h-full rounded-[24px] border border-white/80 bg-white/85 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:shadow-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-mint text-brand-dark transition group-hover:bg-brand group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-[18px] font-semibold text-brand-deep">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- TESTIMONIALS -------------------------- */}
      <section className="section bg-white">
        <div className="shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <span className="eyebrow">Cerita Klien</span>
              <h2 className="mt-4 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[40px]">
                Apa Kata Klien Tentang{" "}
                <span className="serif-italic text-brand">Konseling Trenggalek</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#e0a92e] text-[#e0a92e]" />
                  ))}
                </span>
                <span className="text-[12px] font-semibold text-ink">4.9</span>
                <span className="text-[11px] text-muted">· 2.400+ ulasan</span>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <TestimonialCarousel
              items={testimonials.map((t) => ({
                id: t.id,
                name: t.name,
                age: t.age,
                city: t.city,
                quote: t.quote,
                rating: t.rating,
              }))}
            />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------- PRICING ---------------------------- */}
      <section className="section bg-surface/80">
        <div className="shell">
          <Reveal className="mx-auto mb-9 max-w-xl text-center">
            <span className="eyebrow">Paket Terjangkau</span>
            <h2 className="mt-4 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[42px]">
              Sesuai <span className="serif-italic text-brand">Kebutuhan</span> Anda
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Transparan tanpa biaya tersembunyi. Pilih jalur yang paling sesuai—atau
              diskusikan kebutuhan khusus bersama tim kami.
            </p>
          </Reveal>

          <Reveal>
            <PricingTabs />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------- ARTICLES --------------------------- */}
      <section className="section bg-white">
        <div className="shell">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <span className="eyebrow">Edukasi</span>
              <h2 className="mt-4 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[40px]">
                Wawasan untuk <span className="serif-italic text-brand">tumbuh</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <Link
                href="/edukasi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark transition hover:gap-3"
              >
                Lihat semua artikel <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <Reveal key={article.id} delay={i * 80}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- CONTACT --------------------------- */}
      <section className="section bg-brand-deep" id="kontak">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <Reveal className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
              Mari Mulai
            </span>
            <h2 className="mt-5 text-[34px] font-medium leading-[1.12] sm:text-[44px]">
              Mari Mulai Perjalanan{" "}
              <span className="serif-italic text-brand-accent">Kesejahteraan</span>{" "}
              Psikologis Anda.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/60">
              Isi formulir dan tim kami akan menghubungi Anda dalam 1x24 jam kerja.
              Percakapan pertama gratis dan tanpa komitmen.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-accent">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/40">
                    Kantor Pusat
                  </p>
                  <p className="text-[13px] text-white/80">{branding.contactAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-accent">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/40">
                    WhatsApp Admin
                  </p>
                  <a
                    href={`https://wa.me/${branding.contactPhone.replace(/\D/g, "")}`}
                    className="text-[13px] text-white/80 hover:text-white"
                  >
                    {branding.contactPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-accent">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/40">
                    Jam Operasional
                  </p>
                  <p className="text-[13px] text-white/80">
                    Senin–Sabtu, 08.00–21.00 WIB · Hotline krisis 24/7
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[12px] font-semibold text-white">Butuh bantuan segera?</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/50">
                Jika Anda dalam kondisi krisis atau memiliki pikiran menyakiti diri,
                hubungi hotline 119 ext. 8 atau layanan darurat terdekat.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-[28px] bg-white p-6 shadow-card sm:p-8">
              <div className="mb-5">
                <h3 className="font-serif text-2xl font-semibold text-brand-deep">
                  Kirim Permintaan
                </h3>
                <p className="mt-1 text-[12.5px] text-muted">
                  Kami balas melalui email atau WhatsApp.
                </p>
              </div>
              <ContactForm services={serviceNames} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------- FAQ ------------------------------ */}
      <section className="section bg-cream">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-5 text-[32px] font-medium leading-[1.15] text-brand-deep sm:text-[40px]">
              Pertanyaan yang{" "}
              <span className="serif-italic text-brand">sering diajukan</span>
            </h2>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted">
              Tidak menemukan jawaban? Tim kami siap membantu dengan pertanyaan apa pun
              terkait layanan, privasi, atau proses.
            </p>

            <div className="mt-7 rounded-2xl border border-line bg-white p-5">
              <p className="text-[12px] font-semibold text-ink">Masih ragu memulai?</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Konsultasi awal 15 menit gratis untuk membantu Anda memilih jalur yang
                tepat.
              </p>
              <Link href="/kontak" className="btn-primary btn-sm mt-4">
                Ngobrol dengan admin <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <FaqAccordion
              items={faqs.map((f) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
              }))}
            />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ FINAL CTA --------------------------- */}
      <section className="bg-white pb-16 pt-4">
        <div className="shell">
          <div className="relative overflow-hidden rounded-[28px] bg-brand-deep px-7 py-12 text-center text-white sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, #7dd3fc 0, transparent 35%), radial-gradient(circle at 80% 70%, #0ea5e9 0, transparent 40%)",
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
                <Sparkles className="h-3 w-3" /> Langkah pertama dimulai hari ini
              </span>
              <h2 className="mt-5 text-[32px] font-medium leading-[1.15] sm:text-[44px]">
                Anda tidak harus{" "}
                <span className="serif-italic text-brand-accent">menjalaninya sendiri</span>.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[13.5px] leading-relaxed text-white/60">
                Buat akun gratis, ikuti asesmen singkat, dan temukan pendamping yang
                tepat untuk Anda—dalam hitungan menit.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register" className="btn-accent btn-lg">
                  Buat Akun Gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/klinik"
                  className="btn btn-lg border border-white/20 text-white hover:bg-white/10"
                >
                  Jelajahi Layanan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

