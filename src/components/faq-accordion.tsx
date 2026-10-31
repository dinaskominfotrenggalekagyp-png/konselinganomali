"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
      {items.map((item, index) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition hover:bg-surface/60"
            >
              <span className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[11px] text-muted/50">
                  0{index + 1}
                </span>
                <span
                  className={cn(
                    "font-serif text-[17px] font-medium leading-snug transition-colors",
                    isOpen ? "text-brand-dark" : "text-ink"
                  )}
                >
                  {item.question}
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all",
                  isOpen
                    ? "border-brand bg-brand text-white"
                    : "border-line text-muted"
                )}
              >
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 pl-[3.4rem] pr-14 text-[14px] leading-relaxed text-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
