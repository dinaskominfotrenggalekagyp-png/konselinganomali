import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, Home } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-brand-mint/40">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #7dd3fc 0, transparent 70%)" }}
      />

      <div className="shell relative py-16">
        <div className="mx-auto max-w-3xl">
          <BrandLogo withTagline={false} />

          <div className="mt-10 rounded-[28px] border border-white bg-white/80 p-7 shadow-soft backdrop-blur sm:p-10">
            <span className="eyebrow">
              <Compass className="h-3.5 w-3.5" /> Halaman tidak ditemukan
            </span>

            <p className="mt-5 font-serif text-[64px] font-medium leading-none tracking-[-0.04em] text-brand-deep sm:text-[88px]">
              404
            </p>
            <h1 className="mt-2 text-[26px] font-medium leading-tight text-brand-deep sm:text-[34px]">
              Sepertinya Anda mengambil jalur yang belum kami petakan.
            </h1>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
              Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tautannya
              salah ketik. Tidak apa-apa — mari kembali ke jalur yang menenangkan.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/" className="btn-primary btn-sm">
                <Home className="h-3.5 w-3.5" /> Kembali ke beranda
              </Link>
              <Link href="/klinik" className="btn-outline btn-sm">
                Cari psikolog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/psikotes" className="btn-ghost btn-sm">
                <HeartHandshake className="h-3.5 w-3.5" /> Ikuti asesmen
              </Link>
            </div>

            <div className="mt-8 grid gap-2 border-t border-line pt-5 sm:grid-cols-3">
              {[
                { label: "Edukasi", href: "/edukasi", desc: "Artikel & panduan" },
                { label: "Portal Klien", href: "/portal", desc: "Jadwal & tagihan" },
                { label: "Kontak", href: "/kontak", desc: "Bicara dengan tim" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-line/70 px-3 py-2.5 transition hover:border-brand/30 hover:bg-brand-mint/40"
                >
                  <p className="text-[11px] font-semibold text-ink">{item.label}</p>
                  <p className="text-[9.5px] text-muted">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[10.5px] text-muted">
            Butuh bantuan? Tulis ke{" "}
            <a href="mailto:rproselegends@gmail.com" className="font-semibold text-brand-dark">
              rproselegends@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
