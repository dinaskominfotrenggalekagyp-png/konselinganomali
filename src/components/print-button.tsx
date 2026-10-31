"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[11px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
    >
      <Printer className="h-3.5 w-3.5" /> Cetak / PDF
    </button>
  );
}
