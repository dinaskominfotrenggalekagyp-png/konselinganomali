import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { getPsychologists, getServices } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { ServiceGrid } from "@/components/service-grid";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Klinik & Layanan Psikologi",
  description:
    "Konseling individu, terapi pasangan, mediasi keluarga, dan psikotes dengan psikolog klinis berlisensi.",
};

export const dynamic = "force-dynamic";

export default async function KlinikPage() {
  const [services, psychologists] = await Promise.all([
    getServices(),
    getPsychologists(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-mint/60 pb-14 pt-12 sm:pb-20 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        <div className="shell relative">
          <nav className="flex items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <span className="text-brand-dark">Klinik</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <Reveal>
              <span className="eyebrow">Klinik Konseling Trenggalek</span>
              <h1 className="mt-4 text-[38px] font-medium leading-[1.08] tracking-[-0.02em] text-brand-deep sm:text-[54px]">
                Ruang aman untuk
                <br />
                <span className="serif-italic text-brand">setiap cerita.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-muted">
                Pilih layanan yang paling sesuai dengan kebutuhan Anda. Setiap sesi
                didampingi psikolog klinis berlisensi, dengan pendekatan yang
                dipersonalisasi dan terukur.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#layanan" className="btn-primary">
                  Lihat semua layanan <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/psikotes" className="btn-outline">
                  <Sparkles className="h-4 w-4" /> Mulai dari asesmen
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BadgeCheck, value: "50+", label: "Psikolog berlisensi" },
                  { icon: ShieldCheck, value: "100%", label: "Kerahasiaan terjaga" },
                  { icon: Clock, value: "< 2 jam", label: "Respons prioritas" },
                  { icon: HeartHandshake, value: "10K+", label: "Klien terbantu" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white bg-white/80 p-4 backdrop-blur"
                  >
                    <s.icon className="h-5 w-5 text-brand" />
                    <p className="mt-2 font-serif text-2xl font-semibold text-brand-deep">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-white" id="layanan">
        <div className="shell">
          <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Layanan</span>
              <h2 className="mt-3 text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
                Sesuai dengan <span className="serif-italic text-brand">kondisi Anda</span>
              </h2>
            </div>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-muted">
              Belum yakin harus mulai dari mana? Admin kami siap membantu mencocokkan
              layanan dalam konsultasi 15 menit gratis.
            </p>
          </Reveal>

          <ServiceGrid
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              category: s.category,
              tagline: s.tagline,
              description: s.description,
              price: s.price,
              duration: s.duration,
              image: s.image,
            }))}
          />
        </div>
      </section>

      <section className="section bg-surface/70">
        <div className="shell">
          <Reveal className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Tim Kami</span>
              <h2 className="mt-3 text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
                Kenali <span className="serif-italic text-brand">pendamping</span> Anda
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <Star className="h-3.5 w-3.5 fill-[#e0a92e] text-[#e0a92e]" />
              Rating rata-rata 4.9 dari 700+ ulasan
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {psychologists.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <Link
                  href={`/klinik/psikolog/${p.slug}`}
                  className="group block overflow-hidden rounded-[26px] border border-line bg-white transition hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-brand-mint">
                    <Image
                      src={p.photo}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/70 to-transparent p-4 pt-10">
                      <p className="flex items-center gap-1 text-[10px] font-semibold text-white">
                        <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                        {p.rating} · {p.reviews} ulasan
                      </p>
                      <p className="mt-1 text-[10.5px] text-white/70">
                        {p.experience} tahun pengalaman
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-[16px] font-semibold leading-snug text-brand-deep">
                      {p.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-brand">{p.title}</p>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted">
                      {p.bio}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.specialties.split(",").slice(0, 2).map((s) => (
                        <span key={s} className="chip bg-brand-mint/80 text-brand-dark">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow">Cara Kerja</span>
            <h2 className="mt-4 text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
              Dari klik pertama
              <br />
              hingga <span className="serif-italic text-brand">sesi pertama</span>
            </h2>

            <div className="mt-7 space-y-3">
              {[
                {
                  step: "01",
                  title: "Pilih layanan & psikolog",
                  desc: "Tentukan layanan, psikolog (atau biarkan kami mencocokkan), tanggal, dan mode sesi.",
                },
                {
                  step: "02",
                  title: "Selesaikan pembayaran",
                  desc: "Invoice dibuat otomatis. Bayar melalui portal—status diperbarui secara real-time.",
                },
                {
                  step: "03",
                  title: "Hadiri sesi Anda",
                  desc: "Tautan video call atau alamat klinik dikirim H-1. Tambahkan ke kalender dengan satu klik.",
                },
                {
                  step: "04",
                  title: "Pantau perkembangan",
                  desc: "Catatan sesi, hasil asesmen, dan check-in emosi tersedia di Portal Klien.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-line bg-white p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-mint font-serif text-[12px] font-semibold text-brand-dark">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-[28px] border border-line bg-surface/60 p-6 sm:p-8">
              <h3 className="font-serif text-2xl font-semibold text-brand-deep">
                Butuh rekomendasi personal?
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                Ceritakan singkat kondisi Anda. Admin akan merekomendasikan layanan dan
                psikolog yang paling sesuai—gratis, tanpa komitmen.
              </p>
              <div className="mt-5">
                <ContactForm
                  compact
                  services={services.map((s) => s.name)}
                  defaultService="Konseling Individu"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white pb-16">
        <div className="shell">
          <div className="relative overflow-hidden rounded-[28px] bg-brand-deep p-7 text-white sm:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 15%, #7dd3fc 0, transparent 40%), radial-gradient(circle at 10% 90%, #0ea5e9 0, transparent 40%)",
              }}
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-lg">
                <h2 className="text-[26px] font-medium leading-tight sm:text-[32px]">
                  Tidak yakin harus mulai dari mana?
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                  Ikuti asesmen singkat 3–5 menit. Dapatkan gambaran awal dan
                  rekomendasi langkah berikutnya secara gratis.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/psikotes" className="btn-accent">
                  Mulai asesmen gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/kontak"
                  className="btn border border-white/20 text-white hover:bg-white/10"
                >
                  <CalendarCheck className="h-4 w-4" /> Hubungi admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
