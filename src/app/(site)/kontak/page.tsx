import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Kontak & Lokasi",
  description:
    "Hubungi tim Konseling Trenggalek melalui WhatsApp, email, atau kunjungi klinik kami di Trenggalek.",
};

export const dynamic = "force-dynamic";

export default async function KontakPage() {
  const services = await db.service.findMany({ where: { isActive: true } });

  return (
    <>
      <section className="bg-cream pb-10 pt-10">
        <div className="shell">
          <nav className="flex items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <span className="text-brand-dark">Kontak</span>
          </nav>

          <div className="mt-6 max-w-2xl">
            <span className="eyebrow">Hubungi Kami</span>
            <h1 className="mt-4 text-[38px] font-medium leading-[1.08] tracking-[-0.02em] text-brand-deep sm:text-[50px]">
              Kami di sini
              <br />
              <span className="serif-italic text-brand">untuk Anda.</span>
            </h1>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-muted">
              Pertanyaan tentang layanan atau jadwal? Pilih kanal yang paling
              nyaman—tim kami merespons dalam 1x24 jam kerja.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 pt-4">
        <div className="shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div className="space-y-3">
            {[
              {
                icon: MessageCircle,
                label: "WhatsApp Admin",
                value: "+62 853-3526-8258",
                sub: "Respons tercepat · jam kerja",
                href: "https://wa.me/6285335268258",
                accent: true,
              },
              {
                icon: Mail,
                label: "Email",
                value: "rproselegends@gmail.com",
                sub: "Untuk pertanyaan umum & kerja sama",
                href: "mailto:rproselegends@gmail.com",
              },
              {
                icon: Phone,
                label: "Telepon",
                value: "+62 853-3526-8258",
                sub: "Senin–Sabtu, 08.00–21.00 WIB",
                href: "tel:+6285335268258",
              },
              {
                icon: MapPin,
                label: "Klinik & Kantor Pusat",
                value: "Jl. Raya Trenggalek No. 123",
                sub: "Trenggalek, Jawa Timur 66311 · dekat Alun-Alun Trenggalek",
                href: "https://maps.google.com/?q=Jl.+Raya+Trenggalek,+Trenggalek,+Jawa+Timur",
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className={`group flex items-start gap-3.5 rounded-2xl border p-4 transition hover:shadow-soft ${
                  item.accent
                    ? "border-brand/20 bg-brand-mint/60 hover:border-brand/40"
                    : "border-line bg-white hover:border-brand/25"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    item.accent ? "bg-brand text-white" : "bg-brand-mint text-brand-dark"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] font-semibold text-ink">
                    {item.value}
                  </span>
                  <span className="block text-[11px] text-muted">{item.sub}</span>
                </span>
                <ArrowRight className="mt-2 h-4 w-4 text-brand/30 transition group-hover:translate-x-1 group-hover:text-brand" />
              </a>
            ))}

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-700" />
                <p className="text-[11.5px] font-semibold text-amber-900">
                  Dalam situasi krisis
                </p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-amber-900/80">
                Jika Anda atau orang terdekat berada dalam bahaya, segera hubungi 119
                ext. 8, hotline krisis Kemenkes, atau layanan darurat 112. Jangan
                menunggu balasan formulir.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-surface p-4 text-[11px] text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
              Semua komunikasi dijaga kerahasiaannya sesuai kode etik psikologi.
            </div>
          </div>

          <Reveal>
            <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-brand-deep">
                    Kirim pesan
                  </h2>
                  <p className="mt-1 text-[12px] text-muted">
                    Isi formulir, kami akan menghubungi Anda kembali.
                  </p>
                </div>
                <span className="chip bg-brand-mint text-brand">
                  <Sparkles className="h-3 w-3" /> Gratis
                </span>
              </div>

              <ContactForm services={services.map((s) => s.name)} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface/70 py-14">
        <div className="shell">
          <Reveal>
            <div className="overflow-hidden rounded-[28px] border border-line bg-white">
              <div className="relative h-[280px] bg-brand-mint/60">
                <div className="absolute inset-0 grid-lines opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lift">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <p className="mt-3 font-serif text-xl font-semibold text-brand-deep">
                    Klinik Konseling Trenggalek
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    Jl. Raya Trenggalek No. 123, Trenggalek
                  </p>
                  <a
                    href="https://maps.google.com/?q=Jl.+Raya+Trenggalek,+Trenggalek,+Jawa+Timur"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary btn-sm mt-4"
                  >
                    Buka di Google Maps <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-3">
                {[
                  { label: "Parkir", value: "Basement gedung, gratis 2 jam" },
                  { label: "Akses publik", value: "5 menit dari MRT Bendungan Hilir" },
                  { label: "Fasilitas", value: "Ruang tunggu privat & ramah disabilitas" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink/75">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
