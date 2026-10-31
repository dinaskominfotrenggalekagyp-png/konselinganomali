"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { cn, formatIDR } from "@/lib/utils";

export type ServiceGridItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};

export function ServiceGrid({ services }: { services: ServiceGridItem[] }) {
  const categories = ["Semua", ...Array.from(new Set(services.map((s) => s.category)))];
  const [active, setActive] = useState("Semua");

  const filtered =
    active === "Semua" ? services : services.filter((s) => s.category === active);

  return (
    <div>
      <div className="mb-7 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full border px-4 py-2 text-[12px] font-medium transition",
              active === category
                ? "border-brand bg-brand-dark text-white"
                : "border-line bg-white text-ink/65 hover:border-brand/30 hover:text-brand-dark"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service) => (
          <Link
            key={service.id}
            href={`/klinik/${service.slug}`}
            className="group flex flex-col overflow-hidden rounded-[26px] border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={service.image}
                alt={service.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark backdrop-blur">
                {service.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-serif text-[20px] font-semibold text-brand-deep">
                {service.name}
              </h3>
              <p className="mt-1 text-[12px] font-medium text-brand">{service.tagline}</p>
              <p className="mt-2 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-muted">
                {service.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-4">
                <span className="text-[11px] text-muted">
                  Mulai{" "}
                  <strong className="font-semibold text-ink/80">
                    {formatIDR(service.price)}
                  </strong>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Clock className="h-3 w-3" /> {service.duration} mnt
                </span>
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-dark transition group-hover:gap-2.5">
                Lihat &amp; pesan sesi <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Belum ada layanan pada kategori ini.
        </p>
      )}
    </div>
  );
}
