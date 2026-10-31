import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&auto=format&fit=crop";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="relative hidden w-[46%] overflow-hidden bg-brand-deep lg:block">
        <Image src={AUTH_IMAGE} alt="" fill priority sizes="46vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/95 via-brand-deep/80 to-brand/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <BrandLogo variant="light" />

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
              <Sparkles className="h-3 w-3" /> Portal Klien
            </span>
            <h2 className="mt-5 max-w-sm font-serif text-[36px] font-medium leading-[1.15]">
              Satu ruang untuk seluruh{" "}
              <span className="serif-italic text-brand-accent">perjalanan</span> wellness
              Anda.
            </h2>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-white/60">
              Jadwal konseling, hasil asesmen, catatan sesi, dan tagihan—semuanya
              terintegrasi dan aman.
            </p>

            <div className="mt-7 space-y-3">
              {[
                { icon: ShieldCheck, text: "Data terenkripsi & sangat rahasia" },
                { icon: Heart, text: "Riwayat asesmen dan progres emosi" },
                { icon: Sparkles, text: "Reservasi ulang dalam dua klik" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-[12px] text-white/70">
                  <item.icon className="h-4 w-4 text-brand-accent" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="font-serif text-[15px] italic leading-relaxed text-white/85">
              “Portalnya rapi. Jadwal, catatan sesi, dan tagihan ada di satu tempat.”
            </p>
            <p className="mt-2 text-[10.5px] text-white/40">Rizky Hidayat · Klien Premium</p>
          </div>
        </div>
      </aside>

      <main className="flex w-full flex-col lg:w-[54%]">
        <div className="flex items-center justify-between px-5 py-5 sm:px-10">
          <div className="lg:hidden">
            <BrandLogo withTagline={false} />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition hover:text-brand-dark"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-10">
          <div className="w-full max-w-[420px]">
            <h1 className="font-serif text-[34px] font-medium leading-tight text-brand-deep">
              {title}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-6 text-center text-[12px] text-muted">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
