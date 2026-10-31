"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const TABS: { id: string; label: string; icon: string; plans: Plan[] }[] = [
  {
    id: "klinik",
    label: "Klinik Pribadi",
    icon: "🌿",
    plans: [
      {
        name: "Sesi Reguler",
        price: "Rp350rb",
        unit: "/sesi 60 menit",
        description: "Untuk Anda yang ingin mulai tanpa komitmen jangka panjang.",
        features: [
          "Psikolog klinis berlisensi",
          "Sesi online atau tatap muka",
          "Catatan sesi digital",
          "Reschedule gratis 24 jam",
        ],
        cta: "Pilih sesi",
        href: "/klinik/konseling-individu",
      },
      {
        name: "Premium Care",
        price: "Rp750rb",
        unit: "/sesi 90 menit",
        description: "Pendampingan intensif dengan psikolog senior pilihan.",
        features: [
          "Psikolog senior pilihan",
          "Respons prioritas < 2 jam",
          "Laporan perkembangan bulanan",
          "Akses jurnal wellness",
          "Sesi follow-up 30 menit",
        ],
        cta: "Mulai premium",
        href: "/klinik/konseling-premium",
        featured: true,
      },
      {
        name: "Paket 4 Sesi",
        price: "Rp1,26jt",
        unit: "/4 sesi",
        description: "Hemat 10% untuk perjalanan terapi yang berkelanjutan.",
        features: [
          "4 sesi dengan psikolog sama",
          "Rencana terapi terstruktur",
          "Evaluasi di sesi terakhir",
          "Prioritas jadwal",
        ],
        cta: "Ambil paket",
        href: "/kontak",
      },
    ],
  },
  {
    id: "edukasi",
    label: "Edukasi",
    icon: "📚",
    plans: [
      {
        name: "Kelas Publik",
        price: "Rp150rb",
        unit: "/kelas",
        description: "Workshop live dua jam bersama komunitas suportif.",
        features: [
          "Kelas live interaktif",
          "Rekaman 30 hari",
          "Modul digital",
          "Sertifikat kehadiran",
        ],
        cta: "Lihat kelas",
        href: "/edukasi",
      },
      {
        name: "Sekolah / Institusi",
        price: "Custom",
        unit: "/institusi",
        description: "Otomatisasi pemetaan gaya belajar siswa dan pelatihan guru.",
        features: [
          "Pemetaan minat bakat siswa",
          "Insight gaya belajar (VAK)",
          "Workshop guru & staf",
          "Rekomendasi grouping siswa",
          "Dashboard laporan sekolah",
        ],
        cta: "Minta proposal",
        href: "/kontak",
        featured: true,
      },
    ],
  },
];

export function PricingTabs() {
  const [active, setActive] = useState("klinik");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div>
      <div className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border border-line bg-white p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all sm:px-5",
              active === t.id
                ? "bg-brand-dark text-white shadow-sm"
                : "text-ink/65 hover:text-brand-dark"
            )}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {tab.plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-3xl border p-7 transition-all duration-300",
              plan.featured
                ? "border-brand/25 bg-brand-deep text-white shadow-card lg:-translate-y-2"
                : "border-line bg-white hover:-translate-y-1 hover:shadow-soft"
            )}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                <Sparkles className="h-3 w-3" /> Paling dipilih
              </span>
            )}
            <h3
              className={cn(
                "font-serif text-xl font-semibold",
                plan.featured ? "text-white" : "text-brand-deep"
              )}
            >
              {plan.name}
            </h3>
            <p
              className={cn(
                "mt-1.5 text-[12.5px] leading-relaxed",
                plan.featured ? "text-white/60" : "text-muted"
              )}
            >
              {plan.description}
            </p>

            <div className="mt-5 flex items-end gap-1">
              <span className="font-serif text-[32px] font-semibold leading-none">
                {plan.price}
              </span>
              <span
                className={cn(
                  "pb-0.5 text-[11px]",
                  plan.featured ? "text-white/50" : "text-muted"
                )}
              >
                {plan.unit}
              </span>
            </div>

            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[12.5px]">
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                      plan.featured
                        ? "bg-brand-accent/20 text-brand-accent"
                        : "bg-brand-mint text-brand"
                    )}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span className={plan.featured ? "text-white/75" : "text-ink/75"}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={cn(
                "mt-7 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
                plan.featured
                  ? "bg-brand-accent text-brand-deep hover:bg-white"
                  : "bg-brand-dark text-white hover:bg-brand"
              )}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
