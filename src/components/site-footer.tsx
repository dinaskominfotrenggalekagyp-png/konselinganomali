import Link from "next/link";
import { Instagram, Linkedin, Facebook, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { NewsletterForm } from "@/components/newsletter-form";
import type { Branding } from "@/lib/branding";

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Klinik", href: "/klinik" },
  { label: "Edukasi", href: "/edukasi" },
  { label: "Psikotes", href: "/psikotes" },
  { label: "Kontak", href: "/kontak" },
];

const services = [
  { label: "Konseling Individu", href: "/klinik/konseling-individu" },
  { label: "Konseling Premium", href: "/klinik/konseling-premium" },
  { label: "Mediasi Keluarga", href: "/klinik/mediasi-relasi" },
  { label: "Psikotes & Asesmen", href: "/psikotes" },
  { label: "Workshop Edukasi", href: "/edukasi" },
];

export function SiteFooter({ branding }: { branding: Branding }) {
  return (
    <footer className="relative overflow-hidden bg-brand-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #7dd3fc 0, transparent 42%), radial-gradient(circle at 85% 10%, #0ea5e9 0, transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.1fr]">
          <div>
            <BrandLogo
              variant="light"
              logo={branding.logo}
              siteName={branding.siteName}
              tagline={branding.tagline}
            />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/60">
              Intervensi psikologi klinis dan kesehatan mental berbasis data untuk
              individu, keluarga, dan komunitas.
            </p>

            <div className="mt-6 space-y-3 text-[13px] text-white/70">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                {branding.contactAddress}
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brand-accent" />
                <a href={`mailto:${branding.contactEmail}`} className="hover:text-white">
                  {branding.contactEmail}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brand-accent" />
                <a
                  href={`tel:${branding.contactPhone.replace(/\s/g, "")}`}
                  className="hover:text-white"
                >
                  {branding.contactPhone}
                </a>
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
                { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-brand-accent hover:bg-brand-accent hover:text-brand-deep"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Navigasi
            </h3>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13.5px] text-white/70 transition hover:text-brand-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Layanan
            </h3>
            <ul className="mt-5 space-y-3">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13.5px] text-white/70 transition hover:text-brand-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Tetap Terhubung
            </h3>
            <p className="mt-5 text-[13px] leading-relaxed text-white/60">
              Dapatkan panduan praktis, riset terbaru, dan jadwal kelas komunitas
              langsung di inbox Anda.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>

            <Link
              href="/kontak"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-medium text-white transition hover:border-brand-accent hover:bg-brand-accent hover:text-brand-deep"
            >
              Butuh bantuan sekarang?
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11.5px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {branding.siteName} · Trenggalek, Jawa
            Timur. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/syarat-ketentuan" className="transition hover:text-white">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/kebijakan-privasi" className="transition hover:text-white">
              Kebijakan Privasi
            </Link>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Data terenkripsi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
