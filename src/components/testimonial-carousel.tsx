"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

type Testimonial = {
  id: string;
  name: string;
  age: number;
  city: string;
  quote: string;
  rating: number;
};

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) return null;
  const active = items[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="relative overflow-hidden rounded-3xl bg-brand-deep p-8 text-white sm:p-10">
          <Quote className="h-10 w-10 text-brand-accent/60" />
          <blockquote
            key={active.id}
            className="mt-6 animate-fade-up font-serif text-[22px] leading-[1.5] text-white/95 sm:text-[26px]"
          >
            “{active.quote}”
          </blockquote>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-accent font-semibold text-brand-deep">
                {getInitials(active.name)}
              </span>
              <div>
                <p className="text-sm font-semibold">{active.name}</p>
                <p className="text-xs text-white/50">
                  {active.age} tahun · {active.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < active.rating
                      ? "fill-brand-accent text-brand-accent"
                      : "text-white/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                i === index
                  ? "border-brand/30 bg-brand-mint/70 shadow-sm"
                  : "border-line bg-white hover:border-brand/20"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i === index
                    ? "bg-brand-dark text-white"
                    : "bg-surface text-muted"
                )}
              >
                {getInitials(item.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {item.name}
                </span>
                <span className="block truncate text-[11.5px] text-muted">
                  {item.city} · {item.age} tahun
                </span>
              </span>
              {i === index && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              )}
            </button>
          ))}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Testimoni sebelumnya"
                onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-brand/40 hover:text-brand"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Testimoni berikutnya"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-brand/40 hover:text-brand"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
